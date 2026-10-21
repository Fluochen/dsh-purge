# 镜像与维护说明 / Mirror & Maintenance Notice

本仓库是 **[YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)** 的**全量镜像（mirror）**，
由 [@mmparko](https://github.com/mmparko) 在上游宣布删库前完整备份，用于存档与分发。
自 **2026-10-21** 起，本仓库（`y2ambition-ai/dsh-purge`）接管维护，跟随新版 dsh 更新补丁锚点。

本仓库定位：**自用攻防测试工具，用于检查网络安全**——评估本人这套 Harness 的策略与权限边界、在离线靶标或已获授权范围内做攻防演练；不针对未授权目标。

---

## 〇、维护接管 / Maintenance handover

| 项 | 内容 |
| --- | --- |
| 上游状态 | 原作者 **YuJunZhiXue** 已公告暂停更新：不再发版、暂不收 issue / PR、不保证跟进新版 dsh |
| 本仓库 | <https://github.com/y2ambition-ai/dsh-purge>（`master`） |
| 接管时间 | 2026-10-21 |
| 维护范围 | 跟随 dsh 新版本修补丁锚点、维护 `dsh-purge --check` 只读兼容检查、更新文档与元数据 |
| 首个维护版本 | **1.2.0**，适配 dsh **0.2.1-rc.2** |
| 约束 | 原作者署名、MIT 许可、README 的署名要求与非盈利条款全部保留；不改变原作者内容的归属 |

上游原始内容（接管前）可用 `upstream-snapshot-6c1d638` 完整取回；接管后的改动见 `git log upstream-snapshot-6c1d638..master`。

---

## 一、署名 / Attribution

| 项 | 内容 |
| --- | --- |
| 原项目 | **dsh-purge — DeepSeek Harness 破甲**（让所有模型都能破甲，不同模型可换不同提示词） |
| 原作者 | **YuJunZhiXue**（[@YuJunZhiXue](https://github.com/YuJunZhiXue)） |
| 原仓库 | <https://github.com/YuJunZhiXue/dsh-purge> |
| 原许可证 | MIT License（本仓库 `LICENSE` 原样保留，未做任何改动） |

**本项目的名称、思路、代码、提示词的一切权利与署名均归原作者。**
本仓库不主张原作者内容的原创性；接管前的存档零改动，接管后的维护改动（兼容适配、检查工具、
元数据）由 y2ambition-ai 按同一 MIT 许可与非盈利条款提供，不改变原作者内容的归属。

按原 README「[署名要求](https://github.com/YuJunZhiXue/dsh-purge#署名要求)」章节的明确要求：
**借用本项目的名称、思路、代码或提示词，必须署名，并写明来源仓库。** 任何基于本镜像的二开、
分发、集成，都必须保留本说明与原仓库链接。原项目的非盈利条款同样沿用：**不得用于卖课、
卖插件、卖 token、倒卖等收费行为。**

---

## 二、备份内容 / What's included

| 项目 | 内容 |
| --- | --- |
| 分支 | `master`、`fix/restart-sticky` |
| 原版 Tag | 73 个：`v1.1.1` … `v1.1.71`（含各 `-beta.N` 预发布）+ `restore-issue-25` |
| PR 归档 Tag | 26 个：`archive/pr-<N>-head`、`archive/pr-<N>-merge` |
| 上游快照 Tag | `upstream-snapshot-6c1d638` — 备份时刻上游 `master` 的原始 commit |
| Issue/PR 存档 | 分支 `upstream-archive`：`upstream-archive/` 目录下的 JSON 与可读摘要 |
| Issue 规模 | 91 个 issue + 24 个 PR，共 135 条评论 |

> 说明：GitHub 禁止向 `refs/pull/*` 推送（`deny updating a hidden ref`），
> 因此上游的 26 个 PR ref 已转换为同 SHA 的 `archive/pr-*` tag，commit 对象一个不少。

### 相对上游的差异

接管前：`master` 比上游 `master` 只多 `MIRROR-NOTICE.md` 一个 commit。
2026-10-21 起：`master` 追加维护提交（1.2.0 适配 dsh 0.2.1-rc.2、`--check`、维护文档、元数据）。
上游原始内容本身零改动，可通过 `upstream-snapshot-6c1d638` 拿到；接管后的改动与该快照的差异：

```sh
git diff --stat upstream-snapshot-6c1d638..master
```

---

## 三、备份记录 / Capture record

- 备份时间：2026-10-13
- 上游 `master`：`6c1d638d1bdcc45ede50fc30249c753d58122a51`
- 上游 `fix/restart-sticky`：`1f5c2ff6e29346ff1b2b6a4f7b8faa7fa431eac4`
- 最新原版 tag `v1.1.71`：`5e757260a0be055892b48ec520d451cc82e1c191`
- 备份时刻上游星标 **4,995**、fork **612**
- 上游仓库元数据、issues、PR、评论、标签的完整 JSON 见 `upstream-archive` 分支
- 上游 Wiki：未启用（`*.wiki.git` 返回 `Repository not found`），无内容可备份

### 完整性校验结果（备份时刻实跑）

| 校验项 | 结果 |
| --- | --- |
| ref 逐条 SHA 比对 | **101 / 101 完全一致**，0 缺失、0 差异 |
| `master` 源码包 SHA256 | 上游与镜像**逐字节相同**：`4acda024330d43b7beaf220f308e10eb27cf253fd4135942e3e5930b1dace106` |
| 文件级 blob SHA | **121 / 121 完全一致**（Github Trees API recursive 比对） |
| `git fsck --full` | 通过，无损坏、无悬挂对象缺失 |

---

## 四、自行校验 / Verify

```bash
git clone https://github.com/mmparko/dsh-purge.git
cd dsh-purge

# 1. 备份时刻的上游原始状态
git log --oneline -1 upstream-snapshot-6c1d638
#    → 6c1d638 上游 master 原样

# 2. 本镜像与上游原始状态的差异（应只有 MIRROR-NOTICE.md 一个文件）
git diff --stat upstream-snapshot-6c1d638 master

# 3. 分支与 tag 清点
git branch -a            # master / fix/restart-sticky
git tag | wc -l          # 99 = 73 原版 + 26 PR 归档
git tag | grep '^archive/pr-'

# 4. 对照上游快照做一次完整 hash 校验
git rev-parse master^{tree}
git rev-parse upstream-snapshot-6c1d638^{tree}
```

```bash
# 5. 与上游（若仍在线）逐 ref 比对
git ls-remote https://github.com/YuJunZhiXue/dsh-purge.git | sort > /tmp/up.txt
git ls-remote https://github.com/mmparko/dsh-purge.git | sort > /tmp/mine.txt
diff /tmp/up.txt /tmp/mine.txt
```

---

## 五、上游 README 中的原生状态说明（保留告知）

上游 README 在备份时载明：**项目暂停更新**，作者因工作安排暂停维护、不再发版、暂不收
issue / PR，也不保证跟进新版 dsh；仓库仍可自用。该状态说明保留在 `README.md` / `README.zh-CN.md`
的「维护状态」段落中。上游 README 的「违规商用公示」章节与配图属宣传纠纷内容，已在 1.2.4 之后
的仓库整理中移除，不涉及上游代码与许可条款的改动。
