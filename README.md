# Skill Plugin Marketplace

技能插件市场，**优先兼容 Claude Code 的 `/plugin` 流程**：通过 `/plugin marketplace add` 与 `/plugin install` 安装与使用插件。另含 Web 站点与可选 Cursor 专用安装脚本。

## 推荐方式：Claude Code /plugin（最高优先级）

在 **Claude Code** 中按以下步骤使用本市场：

### 1. 添加市场

若本仓库已推送到 GitHub（例如 `your-org/systembug-claude-marketplace`）：

```text
/plugin marketplace add your-org/systembug-claude-marketplace
```

或本地路径（开发时）：

```text
/plugin marketplace add /path/to/systembug-claude-marketplace
```

### 2. 安装插件

```text
/plugin install example-skill@systembug-marketplace
```

其中 `systembug-marketplace` 为 `.claude-plugin/marketplace.json` 中的 `name`，安装后插件会按 `plugin.json` 的 `version` 参与更新检查。

### 3. 使用技能

在 Claude Code 聊天中输入：

```text
/example-skill
```

即可触发已安装插件中的同名技能。

### 4. 更新市场与插件

```text
/plugin marketplace update
```

会刷新市场列表；已安装插件会按版本判断是否更新。

---

## 验证配置

安装 [Claude CLI](https://docs.anthropic.com/en/docs/claude-code/get-started) 后，在仓库根目录执行：

```bash
claude plugin validate .
```

用于校验 `.claude-plugin/marketplace.json` 与各插件的 `plugin.json`。

---

## 项目结构（Claude Code 优先）

| 路径 | 说明 |
|------|------|
| **`.claude-plugin/marketplace.json`** | **Claude Code 市场清单**（名称、owner、插件列表与 source） |
| **`plugins/<name>/`** | **各插件目录**：含 `.claude-plugin/plugin.json` 与 `skills/`、`commands/` 等 |
| `plugins/example-skill/` | 示例插件（含技能 `example-skill`） |
| `docs/MARKETPLACE_DESIGN.md` | 市场设计与 Cursor/Claude 双轨说明 |
| `data/skills.json` | 可选：Cursor 专用注册表（供 Web/CLI 备用） |
| `scripts/install-skill.js` | 可选：仅 Cursor 的安装脚本（`npm run install-skill -- <id>`） |

插件目录约定见 [Claude Code 插件市场文档](https://docs.anthropic.com/en/docs/claude-code/plugin-marketplaces)；技能放在 `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`。

---

## 启动 Web 站点（可选）

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。可用于浏览插件列表与安装说明；**安装仍推荐在 Claude Code 内用 `/plugin install` 完成**。

---

## 可选：仅 Cursor 的安装方式

若只在 **Cursor** 中使用、且不通过 Claude Code：

```bash
npm run install-skill -- example-skill
```

会将 `data/skills.json` 中配置的对应技能安装到 `~/.cursor/skills/`（或加 `--project` 装到当前项目 `.cursor/skills/`）。此路径与 Claude Code 的插件缓存（`~/.claude/plugins/cache`）相互独立。

---

## 参考

- [Create and distribute a plugin marketplace](https://docs.anthropic.com/en/docs/claude-code/plugin-marketplaces)（Claude Code 官方）
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [Just Be: Build Yourself a Claude Code Plugin Marketplace](https://just-be.dev/blog/why-i-built-a-claude-code-plugin-marketplace/)
- [Cursor Plugins](https://cursor.com/docs/plugins) / [Cursor Marketplace](https://cursor.com/marketplace)
