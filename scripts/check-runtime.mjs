import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { installAssembleGuard, rewritePromptAssembly } from '../lib/identity.js';
import { installContinueRetry } from '../lib/continue-retry.js';
import { ALL_PATCHES, applyReplacementsToText, defaultOverrideText, hashOverride, isKeepableUserOverride, syncPromptInjectOnDiskSync, sanitizeYamlPersonaScalars } from '../lib/core.js';

const assembly = () => ({ sections: [], contexts: [], tools: [], variables: {} });
const rewriteOptions = { capabilityProtocol: false, dropMnemon: false };
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('preserves user personas, literal tags and third-party tool/context contributions', () => {
  const text = "You are Claude, a custom test assistant.\n<project_instructions>literal example</project_instructions>\n<|im_start|>system:\nKeep this user text.";
  const input = { sections: [
    { name: 'user-custom', text, order: 0, interpolate: false },
    { name: 'deployment:persona-prefix', text, order: 1, interpolate: false },
    { name: 'deployment:persona-suffix', text, order: 2, interpolate: false },
  ], contexts: [{ name: 'rea-context', text: 'fixture' }], tools: [{ name: 'mcp__rea__fixture' }], variables: { model: 'fixture' } };
  const result = rewritePromptAssembly(input, rewriteOptions);
  assert.deepEqual(result.sections, input.sections);
  assert.equal(result.contexts, input.contexts);
  assert.equal(result.tools, input.tools);
  assert.equal(result.variables, input.variables);
});

test('a copied plugin prompt inside a user section is preserved verbatim', () => {
  const text = 'This user quote must stay.';
  const input = { ...assembly(), sections: [{ name: 'user-quote', text }] };
  const result = rewritePromptAssembly(input, { ...rewriteOptions, fallbackInject: text });
  assert.equal(result.sections.find(s => s.name === 'user-quote').text, text);
});

test('host and plugin assembly failures keep their original error terminal state', async () => {
  const failure = new Error('required context unavailable');
  const host = { async assemble() { throw failure; } };
  const off = installAssembleGuard(host, value => value);
  try { await assert.rejects(host.assemble(), error => error === failure); }
  finally { off(); }
  const host2 = { async assemble() { return assembly(); } };
  const off2 = installAssembleGuard(host2, () => { throw failure; });
  try { await assert.rejects(host2.assemble(), error => error === failure); }
  finally { off2(); }
});

test('disposing the guard restores the method and cancels an in-flight rewrite', async () => {
  const wait = deferred(), original = () => wait.promise;
  const host = { assemble: original };
  let rewrites = 0;
  const off = installAssembleGuard(host, value => { rewrites++; return value; });
  const pending = host.assemble();
  off(); off();
  const value = assembly(); wait.resolve(value);
  assert.equal(await pending, value);
  assert.equal(rewrites, 0);
  assert.equal(host.assemble, original);
});

test('retired guard cleanup does not remove the new owner or a replacement method', async () => {
  const host = { async assemble() { return assembly(); } };
  const old = installAssembleGuard(host, value => ({ ...value, owner: 'old' }));
  const current = installAssembleGuard(host, value => ({ ...value, owner: 'new' }));
  old();
  assert.equal((await host.assemble()).owner, 'new');
  const replacement = async () => ({ ...assembly(), hostVersion: 2 });
  host.assemble = replacement;
  current();
  assert.equal(host.assemble, replacement);
});

test('guard disposal restores prototype ownership; unsupported hosts stay untouched', async () => {
  const prototype = { async assemble() { return assembly(); } };
  const host = Object.create(prototype);
  const off = installAssembleGuard(host, value => value);
  off();
  assert.equal(Object.hasOwn(host, 'assemble'), false);
  assert.equal(host.assemble, prototype.assemble);
  const frozen = Object.freeze({ assemble: prototype.assemble });
  assert.equal(installAssembleGuard(frozen, value => value), false);
  assert.equal(frozen.assemble, prototype.assemble);
});

test('pending retry callbacks stop when their plugin instance is disposed', async () => {
  const handlers = new Map();
  const ctx = { on(event, handler) { handlers.set(event, handler); return () => handlers.delete(event); } };
  const runtime = installContinueRetry(ctx, { config: { autoRetry: true, autoContinue: false } });
  const wait = deferred();
  const before = globalThis.__dshPurgeRetryPending;
  const pending = handlers.get('agent/request-error')({ agent: { id: 'fixture' }, failure: { code: 'TRANSPORT' } }, () => wait.promise);
  runtime.dispose();
  const downstream = { kind: 'stop' }; wait.resolve(downstream);
  assert.equal(await pending, downstream);
  assert.equal(handlers.size, 0);
  assert.equal(globalThis.__dshPurgeRetryPending, before);
});

test('user edits to default templates survive automatic synchronization', () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-purge-override-test-'));
  try {
    mkdirSync(join(home, 'dsh-purge'));
    const custom = '<|im_start|>system:\n<project_instructions>Little Code Sauce\nUSER CUSTOM RULE</project_instructions>';
    writeFileSync(join(home, 'prompt-inject.md'), custom);
    // Both hand-edited files and explicitly saved custom files must survive.
    for (const state of [{}, { customized: true, hash: hashOverride(custom), seedHash: hashOverride(custom) }]) {
      writeFileSync(join(home, 'dsh-purge/override-state.json'), JSON.stringify(state));
      assert.equal(isKeepableUserOverride(home, custom), true);
      assert.equal(syncPromptInjectOnDiskSync(home).reason, 'user_custom');
      assert.equal(readFileSync(join(home, 'prompt-inject.md'), 'utf8'), custom);
    }
    const oldDefault = 'A known previous default fixture.';
    writeFileSync(join(home, 'prompt-inject.md'), oldDefault);
    writeFileSync(join(home, 'dsh-purge/override-state.json'), JSON.stringify({ customized: false, hash: hashOverride(oldDefault) }));
    assert.equal(syncPromptInjectOnDiskSync(home).reason, 'refresh_default');
    assert.equal(readFileSync(join(home, 'prompt-inject.md'), 'utf8'), defaultOverrideText());
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test('YAML compatibility cleanup preserves mixed user text and scalar semantics', () => {
  for (const style of ['>-', '|-', '>+', '|+']) {
    const source = `- id: example\n  config:\n    prefix: ${style}\n      You are a coding agent powered by the {{model}} model.\n      USER CUSTOM RULE MUST STAY\n\n      SECOND CUSTOM RULE\n`;
    assert.equal(sanitizeYamlPersonaScalars(source), source);
  }
  const legacy = '- id: example\n  config:\n    prefix: >-\n      You are a coding agent powered by the {{model}} model.\n';
  assert.equal(sanitizeYamlPersonaScalars(legacy), '- id: example\n  config:\n    prefix: ""\n');
});

test('YAML identity patches preserve entire custom scalars, including examples', () => {
  const examples = [
    'description: |-\n  Example:\n  prefix: ""\n    USER CUSTOM CONTENT\nnext: true\n',
    'description: |-\n  prefix: |-\n    You are a coding agent powered by the {{model}} model.\nnext: true\n',
    'prefix: &shared You are a coding agent powered by the {{model}} model.\ncopy: *shared\n',
  ];
  for (const key of ['personaPrefix', 'prefix']) {
    for (const style of ['>-', '|-', '>+', '|+', '>2-']) {
      examples.push(`config:\n  ${key}: ${style}\n    You are a coding agent powered by the {{model}} model.\n    USER CUSTOM RULE\n`);
    }
  }
  for (const source of examples) {
    assert.equal(sanitizeYamlPersonaScalars(source), source);
    for (const id of [4, 43, 76]) {
      const result = applyReplacementsToText(source, ALL_PATCHES.find(p => p.id === id), 'fixture.yml');
      assert.equal(result.changed, false);
      assert.equal(result.text, source);
    }
  }
  const source = 'prefix: >- # keep comment\r\n  You are a coding agent powered by the {{model}} model.\r\n\r\nnext: true\r\n';
  const result = sanitizeYamlPersonaScalars(source);
  assert.equal(result, 'prefix: "" # keep comment\r\n\r\nnext: true\r\n');
  assert.equal(sanitizeYamlPersonaScalars(result), result);
  assert.throws(() => sanitizeYamlPersonaScalars('prefix: ""\n  unknown orphan\n'), /Cannot patch invalid YAML/);
});

test('redteam headings in user sections do not change mode or truncate content', () => {
  const section = { name: 'user-custom', text: 'User preface\n## 运行环境前提\nUSER RULE' };
  const input = { ...assembly(), sections: [section] };
  assert.deepEqual(rewritePromptAssembly(input, rewriteOptions).sections, [section]);
  const redteam = { ...input, sections: [...input.sections, { name: 'dsh-purge:ops', text: '## 运行环境前提\nfixture' }] };
  assert.deepEqual(rewritePromptAssembly(redteam, rewriteOptions).sections.find(s => s.name === 'user-custom'), section);
});

test('unsupported readonly hosts never leave a misleading installed guard', () => {
  const original = async () => assembly();
  const host = {};
  Object.defineProperty(host, 'assemble', { value: original });
  for (let i = 0; i < 2; i++) assert.equal(installAssembleGuard(host, value => value), false);
  assert.equal(host.assemble, original);
  assert.deepEqual(Object.getOwnPropertySymbols(host), []);
});

test('guard preserves readonly and accessor descriptors across assignment/disposal', () => {
  const original = async () => assembly(), replacement = async () => assembly();
  const readonly = {};
  Object.defineProperty(readonly, 'assemble', { value: original, configurable: true, writable: false });
  const descriptor = Object.getOwnPropertyDescriptor(readonly, 'assemble');
  const off = installAssembleGuard(readonly, value => value);
  assert.throws(() => { readonly.assemble = replacement; }, TypeError);
  off();
  assert.deepEqual(Object.getOwnPropertyDescriptor(readonly, 'assemble'), descriptor);
  let current = original;
  const host = { get assemble() { return current; }, set assemble(value) { current = value; } };
  const accessor = Object.getOwnPropertyDescriptor(host, 'assemble');
  const off2 = installAssembleGuard(host, value => value);
  host.assemble = replacement;
  off2();
  assert.equal(current, replacement);
  assert.deepEqual(Object.getOwnPropertyDescriptor(host, 'assemble'), accessor);
});

test('fallback guard can remount after the host replaces a non-configurable method', async () => {
  const host = {};
  Object.defineProperty(host, 'assemble', { value: async () => assembly(), writable: true });
  const off = installAssembleGuard(host, value => ({ ...value, owner: 'first' }));
  assert.equal((await host.assemble()).owner, 'first');
  const replacement = async () => ({ ...assembly(), hostVersion: 2 });
  host.assemble = replacement;
  off();
  assert.deepEqual(Object.getOwnPropertySymbols(host), []);
  assert.equal(host.assemble, replacement);
  const off2 = installAssembleGuard(host, value => ({ ...value, owner: 'second' }));
  assert.equal((await host.assemble()).owner, 'second');
  off2();
  assert.equal(host.assemble, replacement);
});

test('pending waterfall callbacks and global hooks retire with their plugin instance', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-purge-lifecycle-test-'));
  const before = { DSH_HOME: process.env.DSH_HOME, TMPDIR: process.env.TMPDIR };
  const globals = ['__dshPurgePrepareAssemble', '__dshPurgeHungPrompt'];
  const saved = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const disposers = [], handlers = new Map();
  try {
    process.env.DSH_HOME = home;
    process.env.TMPDIR = home;
    const { installIdentityOverride } = await import('../lib/index.js');
    const ctx = {
      on(event, handler) { handlers.set(event, handler); return () => handlers.delete(event); },
      effect(fn) { disposers.push(fn()); },
      systemPrompt: { async assemble() { return assembly(); } },
    };
    installIdentityOverride(ctx);
    const wait = deferred();
    const pending = handlers.get('system-prompt/assemble')(assembly(), {}, () => wait.promise);
    const retiredPrepare = globalThis.__dshPurgePrepareAssemble;
    for (const dispose of disposers.splice(0)) dispose();
    const value = assembly(); wait.resolve(value);
    assert.equal(await pending, value);
    assert.equal(retiredPrepare({}), null);
    for (const key of globals) assert.equal(Object.hasOwn(globalThis, key), false);
  } finally {
    for (const dispose of disposers) dispose();
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
    rmSync(home, { recursive: true, force: true });
  }
});
