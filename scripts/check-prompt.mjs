import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { rewritePromptAssembly } from '../lib/identity.js';

// Use the host's real renderer; loading a plugin alone does not render its persona.
const base = process.env.DSH_AI_BASE;
if (!base) throw new Error('Set DSH_AI_BASE to the host node_modules/@deepseek-ai directory.');
const require = createRequire(resolve(base, 'dsh-system-prompt/package.json'));
const { Context } = await import(pathToFileURL(require.resolve('@deepseek-ai/cordis')));
const { default: SystemPrompt, renderPrompt, renderContextSnapshot } = await import(
  pathToFileURL(require.resolve('@deepseek-ai/dsh-system-prompt'))
);
const { parse } = require('yaml');
const patch = parse(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8'), {
  // Read configuration as data; do not execute unrelated !!js expressions.
  customTags: [{ tag: 'tag:yaml.org,2002:js', resolve: value => value }],
});
const config = patch.find(entry => entry.id === 'system-prompt')?.config;
assert.ok(config, 'Bundle must provide the system-prompt configuration under test.');

async function withPrompt(settings, run) {
  const ctx = new Context();
  try {
    await ctx.plugin(SystemPrompt, settings);
    ctx.systemPrompt.variable('provider', () => 'fixture-provider');
    ctx.systemPrompt.variable('model', () => 'fixture-model');
    await run(ctx.systemPrompt);
  } finally {
    await ctx.fiber.dispose();
  }
}

test('bundle persona renders with the variables supplied by the agent loop', async () => {
  await withPrompt(config, async prompt => {
    const cwd = 'Working directory: /tmp/{{literal-directory}}.';
    // Fixture follows the working-directory service contract: required, literal context.
    prompt.context({ name: 'working-directory:current', order: 0, required: true,
      interpolate: false, text: cwd });
    const assembly = await prompt.assemble();
    assert.equal(typeof renderPrompt(assembly), 'string');
    assert.ok(renderContextSnapshot(assembly).includes(cwd));
    // The live plugin rewrites the assembled sections again before rendering.
    const rewritten = rewritePromptAssembly(assembly, { capabilityProtocol: false });
    assert.equal(typeof renderPrompt(rewritten), 'string');
    assert.ok(renderContextSnapshot(rewritten).includes(cwd));
  });
});

test('runtime rewrite preserves custom suffixes and does not invent an absent suffix', async () => {
  await withPrompt({ ...config, personaSuffix: 'Use model {{model}}.' }, async prompt => {
    const assembly = await prompt.assemble();
    const rewritten = rewritePromptAssembly(assembly, { capabilityProtocol: false });
    assert.ok(renderPrompt(rewritten).includes('Use model fixture-model.'));
    const withoutSuffix = { ...assembly, sections: assembly.sections.filter(s => s.name !== 'deployment:persona-suffix') };
    assert.equal(typeof renderPrompt(rewritePromptAssembly(withoutSuffix, { capabilityProtocol: false })), 'string');
  });
});

test('unregistered variables still fail at rendering, before a model request', async () => {
  await withPrompt({ ...config, personaSuffix: 'Your working directory is {{cwd}}.' }, async prompt => {
    const assembly = await prompt.assemble();
    assert.throws(() => renderPrompt(assembly), /unknown prompt variable "\{\{cwd\}\}" in section "deployment:persona-suffix"/);
  });
});
