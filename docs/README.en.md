<div align="center">

# Purge Community

**Helping your AI assistant stay focused on your learning and hands-on work.**

A self-hosted add-on for DeepSeek Harness (known in the community as a 破甲 / "jailbreak" plugin) · 80 host patches · 25 status layers

[![Release](https://img.shields.io/github/v/release/kingcharleslzy-ai/dsh-purge?label=release)](https://github.com/kingcharleslzy-ai/dsh-purge/releases)

Current version 1.6.45 · targets **DSH Desktop 0.2.1-rc.2** (rc.1 also passes)

</div>

---

## What it is

Purge Community runs entirely on your own machine and gathers the parts of daily use that cost the most attention:

- **See the state** — whether the install, patches and prompt injection are actually ready;
- **Fewer round trips** — repeated confirmations and interruptions collapse into one setting;
- **Always reversible** — apply, roll back and toggles are recorded, snapshotted first;
- **Easy to experiment** — prompts, rules and presets in one place, all undoable.

The goal is simple: let the assistant support your learning and hands-on experiments coherently, instead of stopping to ask before every step.

People usually call this a 破甲 ("armor-breaking") or unrestrained-mode plugin: it lowers interaction friction so the agent can keep working. It does not change the model itself, and it does not change what you are trying to do.

## Principles

| Principle | Meaning |
| --- | --- |
| Local first | Everything runs locally; no cloud account changes, no uploads of prompts or config |
| Observable | Every action reports status and evidence, never "it should be applied" |
| Reversible | Snapshots with manifests before apply, install and rollback |
| Never decides for you | It only removes friction; you choose what to change and enable |

## Scope

Local learning, personal projects, automation experiments and maintenance work. Use it on machines you own or are authorized to work on; get permission before touching anyone else's systems.

## Install

The installer snapshots first and **never** applies patches or restarts the app. Install, apply and restart are three separate steps.

- macOS: `scripts/install.sh` (`--dry-run` first)
- Linux CLI/Web: `scripts/install.sh`, with `DSH_NODE`, `PURGE_DSH_CLI`, `DSH_HOME`, `--profile=`
- Windows 11: `scripts/install.ps1` (`-DryRun` first)

### Install boundaries

- Before the plugin loads, the installer leaves DSH itself untouched; a failed step keeps the original entry point, the logs and the snapshot.
- It does not change your global npm registry, does not clear caches, and does not touch your other plugins or prompts.
- If a marketplace JSON install fails (issue #7), the plugin is not loaded yet: pick a dependency source or use the standalone installer instead of retrying the update repeatedly.

See [installation guide](INSTALLATION.md) for details and failure handling.

## Panel

A full page in the left sidebar: one line of state at the top, "Apply" as the primary action, everything else collapsed, help behind `?`. The maintenance page shows recent actions, backup usage and update preferences. Unused entries can be hidden for display only.

## Commands

`selfcheck`, `status`, `host-status`, `diagnose`, `reanchor`, `probe`, `audit`, `boost`, `preset`, `retry`, `usage` / `prune`, `backup` / `rollback`. See `purge-community --help`.

## Updates

Two separate preferences (check / install), default check-only every six hours. Installing never restarts the app — you decide when to reopen it.

## Compatibility

Plugin `dsh-purge-community` 1.6.45 · verified on DSH Desktop 0.2.1-rc.1 / rc.2 · Node ≥ 18.

## Troubleshooting

```sh
purge-community selfcheck --json
purge-community diagnose
purge-community audit --limit 20
```

If the panel does not open, confirm both sides run the same version, then follow [MAINTENANCE.md](MAINTENANCE.md); do not overwrite `Resources/app` directly.

## Development

`npm test`, `npm run check:docs`, `npm run check:client`, `npm run test:electron`, `npm run smoke`.

Agent-facing instructions live in [AGENTS.md](../AGENTS.md); when the two disagree, AGENTS.md wins.

**Keywords**: 破甲 · unrestricted mode · prompt injection · jailbreak · DSH plugin · status self-check · backup and rollback

## 1.6.39

Fixes opaque standalone installer download failures with stage-specific diagnostics, bounded retries and system curl fallback. Official HTTPS source, certificate and SHA256 verification remain mandatory. Failed downloads do not modify the existing installation. No proxy changes or automatic restart. See [release notes](releases/1.6.39.md) and [maintenance details](maintenance-issue-52.md).

## Contributors

Thank you to the original author, code contributors, and everyone who provided reproductions, analysis, and verification. Each avatar links to a GitHub profile. See [contribution records](../CONTRIBUTORS.md) for individual credit and [NOTICE.md](../NOTICE.md) for third-party attribution.

<!-- CONTRIBUTORS:START -->
<table>
  <tr>
    <td align="center" width="120"><a href="https://github.com/YuJunZhiXue"><img src="https://avatars.githubusercontent.com/u/188421097?s=112" width="56" height="56" alt="YuJunZhiXue" /><br /><sub>YuJunZhiXue</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/kingcharleslzy-ai"><img src="https://avatars.githubusercontent.com/u/260348840?s=112" width="56" height="56" alt="kingcharleslzy-ai" /><br /><sub>kingcharleslzy-ai</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/luowang-ui"><img src="https://avatars.githubusercontent.com/u/62333101?s=112" width="56" height="56" alt="luowang-ui" /><br /><sub>luowang-ui</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/heigit"><img src="https://avatars.githubusercontent.com/u/8845668?s=112" width="56" height="56" alt="heigit" /><br /><sub>heigit</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/OGHong"><img src="https://avatars.githubusercontent.com/u/130678941?s=112" width="56" height="56" alt="OGHong" /><br /><sub>OGHong</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/Wangxiaolu0716"><img src="https://avatars.githubusercontent.com/u/110671501?s=112" width="56" height="56" alt="Wangxiaolu0716" /><br /><sub>Wangxiaolu0716</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="120"><a href="https://github.com/wtfsb19"><img src="https://avatars.githubusercontent.com/u/70636030?s=112" width="56" height="56" alt="wtfsb19" /><br /><sub>wtfsb19</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/MingShi350"><img src="https://avatars.githubusercontent.com/u/47762455?s=112" width="56" height="56" alt="MingShi350" /><br /><sub>MingShi350</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/loLollipop"><img src="https://avatars.githubusercontent.com/u/168881978?s=112" width="56" height="56" alt="loLollipop" /><br /><sub>loLollipop</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/youki258"><img src="https://avatars.githubusercontent.com/u/177468176?s=112" width="56" height="56" alt="youki258" /><br /><sub>youki258</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/SimonQvQ"><img src="https://avatars.githubusercontent.com/u/154972131?s=112" width="56" height="56" alt="SimonQvQ" /><br /><sub>SimonQvQ</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/alexopenfan-xiaxin"><img src="https://avatars.githubusercontent.com/u/267281196?s=112" width="56" height="56" alt="alexopenfan-xiaxin" /><br /><sub>alexopenfan-xiaxin</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="120"><a href="https://github.com/0xnuu"><img src="https://avatars.githubusercontent.com/u/113989865?s=112" width="56" height="56" alt="0xnuu" /><br /><sub>0xnuu</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/21hbguo"><img src="https://avatars.githubusercontent.com/u/139569698?s=112" width="56" height="56" alt="21hbguo" /><br /><sub>21hbguo</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/cracer4869"><img src="https://avatars.githubusercontent.com/u/46320829?s=112" width="56" height="56" alt="cracer4869" /><br /><sub>cracer4869</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/fomaper"><img src="https://avatars.githubusercontent.com/u/38674512?s=112" width="56" height="56" alt="fomaper" /><br /><sub>fomaper</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/Kilig1058674225"><img src="https://avatars.githubusercontent.com/u/68159061?s=112" width="56" height="56" alt="Kilig1058674225" /><br /><sub>Kilig1058674225</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/LinyiAIGC"><img src="https://avatars.githubusercontent.com/u/68159061?s=112" width="56" height="56" alt="LinyiAIGC" /><br /><sub>LinyiAIGC</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="120"><a href="https://github.com/Musan-34"><img src="https://avatars.githubusercontent.com/u/279201993?s=112" width="56" height="56" alt="Musan-34" /><br /><sub>Musan-34</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/qianxuno"><img src="https://avatars.githubusercontent.com/u/179305118?s=112" width="56" height="56" alt="qianxuno" /><br /><sub>qianxuno</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/TLcmmmm"><img src="https://avatars.githubusercontent.com/u/167976723?s=112" width="56" height="56" alt="TLcmmmm" /><br /><sub>TLcmmmm</sub></a></td>
    <td align="center" width="120"><a href="https://github.com/Tofu707"><img src="https://avatars.githubusercontent.com/u/178003727?s=112" width="56" height="56" alt="Tofu707" /><br /><sub>Tofu707</sub></a></td>
  </tr>
</table>
<!-- CONTRIBUTORS:END -->

The list combines GitHub commit authors with curated acknowledgements, refreshes daily, and retains historical contributors. Order is not a ranking; reporting an issue does not imply authorship of code.

### Download troubleshooting (#52)

The standalone installer now reports the failing stage, official host, transport, attempt and error code. Transient failures get one fetch retry followed by system curl, with bounded time and attempts. Both paths retain HTTPS source, TLS, size and SHA256 checks. Re-download the installer and run dry-run first; share only redacted diagnostic lines if it still fails. No proxy configuration or automatic restart is performed. See [maintenance details](maintenance-issue-52.md).

## Per-preset prompt exclusions (1.6.40)

Merge `excludePresets: [roleplay, minimal]` into the existing `dsh-purge` entry's config in the current profile. The default `[]` preserves existing behavior. Match effective preset IDs exactly, ignoring case and surrounding whitespace. All prompt sections, assembly rewrites and the host fallback use the same per-session decision; subagents use their own effective preset. Configured exclusions with an unknown context suppress injection rather than leaking it. Commands, UI and tools remain registered.

This does not revert global host patches, deployment configuration or past chat messages. Installation does not apply patches or restart DSH; old host fallback calls need a user-scheduled apply and manual restart to pass session context. See [configuration, migration and test boundaries](maintenance-issue-53.md).
