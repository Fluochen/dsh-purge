# dsh-purge 维护手册（y2ambition-ai 维护线）

本仓库自 2026-10-21 起由 y2ambition-ai 接管维护。上游 YuJunZhiXue/dsh-purge 已暂停更新。
原作者署名、MIT 许可与非盈利条款不变；维护改动只修「新 dsh 版本下的补丁锚点与工具链」，
不改原作者内容的归属。

## 版本线

| 插件版本 | dsh 版本 | 状态 |
| --- | --- | --- |
| 1.2.x | 0.2.1-rc.2（桌面 + `dsh web`） | 当前维护线 |
| 1.1.x | 0.2.0-rc.2 | 保留旧锚点，1.2.x 仍可降级兼容 |
| ≤1.1.39 | 0.1.7 及更早 | 冻结，不再改 |

版本规则：dsh 小版本变化 → 插件 minor 进位（1.2.0、1.3.0…）；同一 dsh 线内修 bug → patch 进位。
`package.json` 的 `dshTarget` 写验证过的 dsh 版本，README「适配范围」同步。

## 代码地图

| 位置 | 作用 |
| --- | --- |
| `lib/core.js` · `targetFiles()` | 把目标包名映射到 `@deepseek-ai` 安装树里的实际文件；dsh 新增/移动包时先改这里 |
| `lib/core.js` · `PATCHES` / `CODE_PATCHES` / `ENGINE_PATCHES` / `NEW_TOOL_PATCHES` | 全部补丁，`ALL_PATCHES` 按这个顺序打；顺序有意义（后面的补丁可以依赖前面补丁的产物） |
| `lib/core.js` · `COMPLETE_PROMPT_WATERFALL_INJECT*` | #40 的替换常量；每个宿主结构一份，不要改旧件 |
| `lib/index.js` | 运行时插件：system prompt 注入、工具、重启/再应用、状态 |
| `bin/dsh-purge.js` | 命令行：`--status`、`--check`、`--apply`、`--revert`、`--uninstall` |
| `.github/workflows/release.yml` | push `master` 后按 `package.json` 版本发 GitHub Release |
| `.github/workflows/compat.yml` | 每周对 npm `next` 的 dsh 跑 `--check`，锚点漂移即失败 |

## 升级 dsh 后的维护流程

### 1. 确认两端版本

```sh
dsh --version                                              # CLI / web 端
defaults read "/Applications/DeepSeek Harness.app/Contents/Info.plist" CFBundleShortVersionString  # 桌面端
npm view @deepseek-ai/dsh dist-tags --json                 # npm next / latest
```

桌面端与 `dsh web` 目前共用同一份 `@deepseek-ai` 源码（2026-10-21 对 0.2.1-rc.2 实测文件哈希一致），
CLI 端锚点检查结果可代表桌面端；桌面独有的补丁（#45/#46/#83/#84/#82）只在桌面 surface 生效，
如需完整核对，先解包桌面 asar 再对解包树跑检查。

### 2. 跑只读兼容检查

```sh
# CLI / web 安装树（npm global 布局示例）
AI="$(npm root -g)/@deepseek-ai/dsh/node_modules/@deepseek-ai"
node bin/dsh-purge.js --check --base "$AI"

# 桌面解包树（插件「应用」后会解到 resources/app）
node bin/dsh-purge.js --check --base "/Applications/DeepSeek Harness.app/Contents/Resources/app/dsh/node_modules/@deepseek-ai"

# 机器可读
node bin/dsh-purge.js --check --json > /tmp/dsh-purge-compat.json
```

读法：

- `pending`：目标文件在、原文锚点还在，Apply 会打上；
- `applied`：已经打上；
- `skipped` / `pattern_not_found` / `read_error`：**文件在但锚点漂移，需要修 pattern**；
- `missing_file` / `na`：这份安装里本来没有该包（可选插件、桌面专属），不是适配失败。

退出码：有**非可选**补丁漂移时为 `1`。可选包（梁神、hooks、Anthropic OAuth、用户自造预设）缺失
不算失败。

### 3. 在副本上做真实 Apply 验证

不要直接拿本机宿主试错。复制一份安装树（APFS 用 `cp -cR` 秒级）：

```sh
mkdir -p /tmp/dsh-purge-compat
cp -cR "$AI" /tmp/dsh-purge-compat/ai
node - <<'EOF'
import { applyPatches, ALL_PATCHES } from './lib/core.js';
const ai = '/tmp/dsh-purge-compat/ai';
const report = await applyPatches(ai, ALL_PATCHES, { preserveClientBundles: false, forApply: true });
for (const r of report) if (!['applied','already','na','missing_file'].includes(r.status)) console.log(r);
EOF
```

- 期望：所有非 `missing_file` 的补丁为 `applied`/`already`；
- 第二次 Apply 必须全部 `already`（幂等，不能重复叠标记）；
- 对改过的产物跑 `node --check`：

```sh
for f in dsh-system-prompt/lib/index.js dsh-web-app/lib/index.js \
         dsh-client-ui-conversation/lib/client.js dsh-agent-loop/lib/index.js \
         dsh-harness-dev-context/lib/index.js; do
  node --check "/tmp/dsh-purge-compat/ai/$f" || break
done
```

### 4. 修锚点（不要重写旧件）

新 dsh 版本通常只改结构或换包，不要删除旧 `replacements`。做法：

1. `targetFiles()` 加新文件 key（别改旧 key），优先 `firstExisting([...新路径, ...旧路径])`；
2. 在对应补丁的 `replacements` 末尾追加一条**新结构 pattern → replace**；
3. 替换常量另起名字（例：`COMPLETE_PROMPT_WATERFALL_INJECT_021`），旧宿主继续走旧件；
4. 新 pattern 必须能收敛：Apply 两次第二次不再 `applied`；必要时把产物里的标记加进 `markers`。

1.2.0 的四个实例：

- #32 / #53：0.2.1 把 Web 面身份句与「不要另开服务器」从 `dsh-web-app` 移到
  `dsh-harness-dev-context/lib/index.js`，新增文件 key + 新锚点；
- #40：0.2.1 的 system-prompt 组装新增 `requiredContexts`，按新块重写替换常量，保留
  `runtimeContextSuppressed` 时的 required 过滤；
- #77：0.2.1 把 `append()` 里的 `this.revised.clear()` 改成 `if (this.revised.size > 0) ...`，
  追加新 pattern（依赖 #56 已定义 `isRewindMarker` / `replaceWindow`）。

### 5. 隔离启动验证

```sh
# 用完整 dsh 包副本 + 副本 @deepseek-ai，隔离 DSH_HOME 启动 web，确认能打印 URL、页面可开
DSH_HOME=/tmp/dsh-purge-home /tmp/dsh-full/lib/bin.js --profile web --port 61235 --host 127.0.0.1 --no-open
```

headless profile 不在支持范围：插件 cordis.patch 的 `personaSuffix` 使用 `{{cwd}}`，headless 的
system prompt 没有该变量，加载会报 `unknown prompt variable "{{cwd}}"` 并退出。不要把插件装进
headless profile。

### 6. 发布

1. 改 `package.json` 版本与 `dshTarget`；
2. `release-notes.md` 第一行必须是 `# <版本号>`（CI 校验）；
3. 同步 README 版本号、适配范围、安装命令；
4. 提交 `master` 并推送（`release.yml` 自动发 Release + zip，同一版本重复推不会重发）；
5. 可选：打 `v<版本号>` tag 再推。

## 本机安装（维护者自用）

本机维护用 **link 软链**，仓库改动即时生效，不需要重装：

```sh
# web profile
dsh plugin --profile web add "link:$HOME/.dsh/plugins/dsh-purge"
# 桌面 profile：在 profiles/desktop 里 pnpm add link:…，并把 "dsh-purge" 追加到 dsh.profile.bundles 末尾
cd "$HOME/.dsh/profiles/desktop" && pnpm add "link:$HOME/.dsh/plugins/dsh-purge"
```

改完 profile 后重启宿主，在会话标题旁点 **dsh-purge → 清洗 → 应用**。`应用` 会写宿主
（桌面端会解包 `app.asar` 到 `resources/app`）并自动重启；助手不要代点、不要重启。

回退：`dsh-purge --revert`（还原已打补丁，保留 `prompt-inject.md`）；卸载：`dsh-purge --uninstall`。

## CI

`compat.yml` 每周一 02:00 UTC 装 npm `@deepseek-ai/dsh@next` 跑 `--check`。失败表示 dsh 改了目标
文件或结构：按第 4 节修锚点、跑第 3/5 节验证、发 patch 版本。也可以手动
`workflow_dispatch` 触发。

## 凭据与安全

- 维护脚本只读宿主安装树；`--apply` 会写 `@deepseek-ai` 文件，每个目标先备份成
  `<文件>.dshpurge.bak`，`--revert` 还原。
- 不要把 API Key、账号凭据写进本仓库、日志或测试 fixture。
- 测试用的临时 DSH_HOME 如果复制过 `.credentials.yaml`，用完删除。
