<div align="center">

# Purge Community

**让 AI 更专注地辅助你的学习与动手实验。**

给 DeepSeek Harness 的自托管控件（俗称「破甲」插件）· 80 条宿主补丁 · 25 层状态自检 · 左侧栏整页设置

[![Release](https://img.shields.io/github/v/release/kingcharleslzy-ai/dsh-purge?label=release)](https://github.com/kingcharleslzy-ai/dsh-purge/releases)
[![Checks](https://github.com/kingcharleslzy-ai/dsh-purge/actions/workflows/community.yml/badge.svg)](https://github.com/kingcharleslzy-ai/dsh-purge/actions/workflows/community.yml)

当前版本 **1.6.45** · 适配 **DSH Desktop 0.2.1-rc.2**（rc.1 同样通过） · [English](docs/README.en.md)

1.6.45 修正“应用未完成”的误导提示：按实际证据显示原因，保留真实失败与未知状态。[发行说明](docs/releases/1.6.45.md) · [市场安装与迁移指南](docs/MARKET-MIGRATION.md)。

</div>

---

## 搭配：本机出图（Qwen Studio）

破甲之后最直接的玩法，是把「生图」也搬到本机——不用网页、不用会员、不把提示词发到别人服务器。

配套插件 **Qwen Studio**（`dsh-qwen-studio`）把 Qwen Image 2.1 接进 DSH：

- **Apple Silicon Mac**：MLX / MFLUX 本机推理，模型用时加载、空闲释放；
- **Windows / Linux + NVIDIA**：连你自己的 GPU 网关（ComfyUI 或 vLLM-Omni 协议），也支持 SSH 按需拉起；
- 支持参考图编辑（按图改画风、换材质）、LoRA、ControlNet、蒙版、整套预设、图库与批量任务；
- 装好之后，会话里直接说「画一张…」或「把这张改成水彩」，Agent 调用 `qwen_generate_image` 并把图返回到对话里。

**组合效果**：破甲让 Agent 不再反复确认「要不要画」，出图插件让它真的画出来，全程在你自己的机器上完成。

**仓库**：[kingcharleslzy-ai/dsh-qwen-studio](https://github.com/kingcharleslzy-ai/dsh-qwen-studio) · **下载**：[最新 Releases](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/releases/latest) · **安装与硬件自查**：[docs/SETUP.md](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/blob/main/docs/SETUP.md)（先看「这台机器能不能跑」再动手）

## 它是什么

Purge Community 是一个跑在你自己机器上的 Harness 附加组件。它把日常使用里最消耗注意力的几件事收敛到一处：

- **看清楚状态**：安装、补丁、注入到底有没有就绪，一条命令或一屏面板给结论；
- **少一些往返**：把反复出现的确认与打断，收敛成一次设置；
- **随时能回去**：应用、回滚、开关都留记录，操作前自动快照；
- **方便做实验**：提示词、规则、预设集中管理，改坏了能撤。

目标很简单：**让助手更连贯地配合你的学习与动手实验**，而不是每做一步都先停下来问一句。

社区里通常把它叫作「破甲」或「无限制模式」插件——指的是它降低了交互层面的摩擦，让 agent 能连续执行任务；它不改模型本身，也不改变你要做的事。

### 下载时报 `fetch failed`？

1.6.39 起，独立安装器会显示失败阶段和错误码，有限重试后可切换系统 curl；两条通道都保留来源、证书和 SHA256 校验。请先重新下载安装脚本再运行 dry-run，仍失败时提交脱敏诊断行即可。见 [下载排查说明](docs/maintenance-issue-52.md)。不会自动修改代理或重启 DSH。

### 让不同预设保留自己的提示词

1.6.40 新增 `excludePresets`：默认空列表，保持原有行为；可将 `roleplay`、`minimal` 等预设排除在 Purge 提示词注入之外，保留命令、面板与工具。切换预设、并行会话和子 Agent 各自判断，宿主兜底也遵守排除。配置示例、升级步骤与边界见 [按预设排除说明](docs/maintenance-issue-53.md)。这不会撤销全局宿主补丁。

## 设计原则

| 原则 | 含义 |
| --- | --- |
| 本机优先 | 全部逻辑在本机运行，不改云端账号、不上传提示词或配置 |
| 可见 | 每个动作都有状态与证据，不靠"应该生效了"这种判断 |
| 可回滚 | 应用 / 安装 / 回滚前自动快照，保留原文件与校验清单 |
| 不替你做决定 | 只减少摩擦，不改变你的目标；改什么、开什么，都由你确认 |

## 适用场景

本机学习、个人项目、自动化实验与维护工作。请在你拥有或已获授权的环境中使用；涉及他人系统时，先取得许可。

## 1.6.39 更新

修复独立安装器只显示 `fetch failed` 的问题：分阶段诊断、有限重试和系统 curl 备用下载，继续严格校验官方来源、证书和 SHA256。下载失败不触碰现有安装。[发行说明](docs/releases/1.6.45.md) · [配置与验收](docs/maintenance-issue-52.md)

## 安装

安装器会自动快照，并且**不会**自动应用补丁或重启应用。三步是分开的：安装 → 应用 → 你手动重开。

### macOS

```sh
curl -fsSL https://raw.githubusercontent.com/kingcharleslzy-ai/dsh-purge/master/scripts/install.sh -o /tmp/purge-install.sh
sh /tmp/purge-install.sh --dry-run     # 先校验来源与 SHA256
sh /tmp/purge-install.sh               # 确认无误再执行
```

### Linux · CLI / Web

默认使用当前 PATH 的 `node` / `dsh` 与 `web` profile；可用 `DSH_NODE`、`PURGE_DSH_CLI`、`DSH_HOME`、`--profile=名称` 显式指定。

```sh
sh scripts/install.sh --dry-run
sh scripts/install.sh
```

系统 npm 只读时会准备用户副本，插件迁移成功后才激活入口；失败保留原入口，不覆盖你的修改。

### Windows 11 · PowerShell

```powershell
irm https://raw.githubusercontent.com/kingcharleslzy-ai/dsh-purge/master/scripts/install.ps1 -OutFile $env:TEMP\purge-install.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\purge-install.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File $env:TEMP\purge-install.ps1
```

### 安装边界

- **插件加载前**，安装器不会改动 DSH 本体；任何一步失败都保留原入口、日志与快照，可以原样重试。
- 安装器**不修改全局 npm 源**、不清空缓存、不改动你的其他插件与提示词。
- 市场 JSON 首次安装失败（issue #7）时插件尚未加载，属于安装器层面的问题：请先选择依赖来源，或用独立安装入口重试，不要反复点更新。

细节与失败处理见 [安装指南](docs/INSTALLATION.md)。

## 面板

左侧栏一整页，不做悬浮按钮：

- 顶部一句话说明当前状态，主操作是「应用」；
- 其余分区折叠，说明收进 `?`，需要时再展开；
- 维护页可看最近动作、备份占用、更新偏好；
- 支持隐藏不用的入口（例如回退按钮），只影响显示。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `purge-community selfcheck [--json]` | 逐层状态与证据；不适用项单独标注 |
| `purge-community status` | 宿主路径与计数 |
| `purge-community host-status` | 只读查看安装布局与当前入口（不换包、不重启） |
| `purge-community diagnose` | 锚点漂移诊断，给出文件、行号与候选落点 |
| `purge-community reanchor …` | 把确认过的新锚点钉成本地覆盖，可撤销 |
| `purge-community probe [new]` | 生成运行时探针，验证注入确实送达模型 |
| `purge-community audit [--limit n]` | 最近动作记录 |
| `purge-community boost [on\|off]` | 尾部强化段开关 |
| `purge-community preset [status\|install]` | 「无限制模式」预设落盘 |
| `purge-community retry [on\|off]` | 回答被中断时的单次重试开关 |
| `purge-community usage` / `prune` | 备份占用与清理 |
| `purge-community backup` / `rollback <id>` | 快照 / 回滚插件 |

## 更新

维护页分别设置「自动检查」与「自动安装」，默认只检查，间隔 6 小时。安装完成不会自动重启——你决定什么时候重开。

## 兼容性

| 组件 | 值 |
| --- | --- |
| 插件 | `dsh-purge-community` 1.6.45 |
| 已验证宿主 | DSH Desktop 0.2.1-rc.1 / 0.2.1-rc.2 |
| 其它宿主 | 允许安装，自检会标「未验证」；先看 `diagnose` |
| Node | ≥18（桌面版自带运行时即可） |

## 出问题怎么办

```sh
purge-community selfcheck --json     # 先看哪一层不是 ok
purge-community diagnose             # 锚点漂移时看候选位置
purge-community audit --limit 20     # 最近动作
```

面板打不开时，先确认版本一致，再按 [维护文档](docs/MAINTENANCE.md) 恢复；不要直接覆盖 `Resources/app`。

## 开发与验证

```sh
npm test                 # 单元与契约测试
npm run check:docs       # 版本与文档一致性
npm run check:client     # 面板 bundle 与源码一致
npm run test:electron    # 真实 Electron 环境（临时目录，不改安装）
npm run smoke            # 发行包冒烟
```

面向 AI agent 的操作说明在 [AGENTS.md](AGENTS.md)，两者冲突时以它为准。

**关键词**：破甲 · 无限制模式 · unrestricted · prompt injection · jailbreak · DSH 插件 · 状态自检 · 备份回滚

## 贡献者

感谢原作者、代码贡献者，以及提供问题复现、分析与验证的朋友。头像链接直达 GitHub 主页；具体贡献见 [贡献记录](CONTRIBUTORS.md)，第三方来源见 [NOTICE.md](NOTICE.md)。

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

名单合并 GitHub 提交者与人工鸣谢记录，自动每日刷新并保留历史贡献者。头像顺序不代表贡献排名，也不将问题报告者误记为代码作者。
