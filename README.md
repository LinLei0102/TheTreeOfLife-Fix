# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in layers.js to see what it all looks like.
---

## 中文汉化版（evolution-zh 分支）

本项目在 `evolution` 分支（commit `78a554fc`）基础上制作了完整中文汉化。

- **汉化基准**：`evolution` 分支（与线上演示站 `https://tzh391.github.io/The-Modding-Tree/` 一致）
- **默认语言**：中文；设置面板第一行有「语言 / Language」按钮，可切到英文逐字对照原版，再点切回中文。英文原版完整保存在 `en/` 目录。
- **存档兼容**：中英两版共用同一存档键（`tree_of_life`），所有 ID/字段名未改，切换语言不影响存档。

### 目录说明

| 路径 | 用途 |
|---|---|
| `index.html` + `js/` | 中文版游戏（默认入口） |
| `en/` | 英文原版完整副本（语言切换目标） |
| `tools/zh/dictionary.json` | 唯一译文词典（en → zh，6207 条） |
| `tools/zh/rebuild_all.sh` | 从英文基线一键重建中文版（可复现） |
| `docs/术语表.md`、`docs/汉化方案.md` | 术语规范与路线决策 |
| `save/endgame-v2.069.json`、`save/import.html` | 残局存档与免安装导入页 |

### 跟版与重建

上游 `tzh391/The-Modding-Tree` 更新后，用 `upstream` 拉取新版 `evolution`，再执行：

```bash
bash tools/zh/rebuild_all.sh
```

脚本会自动：恢复英文基线 → 应用词典回填 → 补数字读法/UI 标签 → 语法检查。新增文本的译文需补进 `dictionary.json`。

### 验收状态

- 运行时文本扫描 3702 次调用：含中文 3426，纯英文残留 16（均为 DNA、INtestine 大小写文字游戏、PRO/PRI 代号等白名单保留项）
- 词典 token（占位符/HTML 标签）不一致：0
- 全部 JS `node --check` 通过；连续两次干净重放产物哈希一致
- 详细结论见 `docs/汉化方案.md`
