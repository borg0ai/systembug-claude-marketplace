# 技能插件市场设计：如何构建并可被 Claude /install 使用

本文档说明如何构建一个「不仅是网站」的技能插件市场。**最高优先级：兼容 Claude Code 的 `/plugin marketplace add` 与 `/plugin install` 流程。**

---

## 1. 市场组成（不仅是网站）

| 部分 | 作用 |
|------|------|
| **Claude Code 市场 (`.claude-plugin/marketplace.json`)** | **优先**。Claude Code 通过 `/plugin marketplace add` 与 `/plugin install <plugin>@<marketplace>` 安装；插件目录含 `plugin.json`、`skills/` 等，规范见 [Anthropic 文档](https://docs.anthropic.com/en/docs/claude-code/plugin-marketplaces)。 |
| **Web 站点** | 浏览、搜索、查看插件说明与安装指引（推荐引导用户使用 Claude Code /plugin 安装） |
| **可选：Cursor 注册表 + 安装脚本** | `data/skills.json` + `scripts/install-skill.js`，仅用于 Cursor 环境或无法使用 Claude Code 时的备用安装方式 |

在 Claude Code 中「安装某技能」应使用 `/plugin install <plugin>@<marketplace>`，而不是仅打开网页或只跑本地脚本。

---

## 2. Claude Code 市场结构（优先）

- **市场清单**：仓库根目录 `.claude-plugin/marketplace.json`。必填：`name`（市场标识，kebab-case）、`owner`、`plugins` 数组。每项插件需 `name`、`source`（如 `"./plugins/example-skill"`）；建议填 `description`、`version`、`author`、`category`。
- **插件目录**：每个插件一个目录，如 `plugins/example-skill/`。内含：
  - `.claude-plugin/plugin.json`：必填 `name`、`description`、`version`。
  - `skills/<skill-name>/SKILL.md`：技能内容，聊天中通过 `/skill-name` 触发。
  - 可选：`commands/`、`agents/`、`hooks/`、`.mcp.json`、`.lsp.json` 等（见 [Plugin structure](https://just-be.dev/blog/why-i-built-a-claude-code-plugin-marketplace/)）。
- **校验**：在仓库根执行 `claude plugin validate .` 可校验市场与插件配置。
- **保留名称**：市场 `name` 不可使用 `claude-plugins-official`、`anthropic-marketplace` 等官方保留名。

---

## 3. Cursor 技能安装位置（可选备用）

- **用户级**：`~/.cursor/skills/<skill-id>/`（所有项目可用）
- **项目级**：`<project>/.cursor/skills/<skill-id>/`（仅当前仓库）

每个技能是一个目录，至少包含 `SKILL.md`，可有 `reference.md`、`examples.md`、`scripts/` 等。

---

## 4. 注册表数据结构（Cursor 备用）

建议用 JSON 文件（如 `data/skills.json`）或后续可替换为 API：

```json
{
  "skills": [
    {
      "id": "my-skill-id",
      "name": "显示用名称",
      "description": "简短描述",
      "source": "git|url|file",
      "sourceUrl": "https://github.com/org/repo 或 可下载的 zip/目录 URL",
      "installPath": "可选：仓库内相对路径，如 skills/my-skill"
    }
  ]
}
```

- `source: "git"`：安装脚本执行 `git clone` 到技能目录，或 `git clone --depth 1 <url> <target>` 再只保留子路径。
- `source: "url"`：下载 zip 或单文件（如 SKILL.md）到目标目录。
- `source: "file"`：本地路径，仅开发/调试用。

Web 与 CLI 都读取同一份注册表，保证「网站上看到的」和「安装到的」一致。

---

## 5. 安装流程（Claude Code 优先 vs Cursor 备用）

1. **用户**：在 Cursor 聊天中说「安装 xxx 技能」或「/install xxx」。
2. **Claude**：理解意图后，执行项目提供的安装命令，例如：
   - `node scripts/install-skill.js <skill-id>`
   - 或 `npm run install-skill -- <skill-id>`
   - 或（若发布为包）`npx your-marketplace install <skill-id>`
3. **安装脚本**：
   - 读取 `data/skills.json`（或通过环境变量指向的注册表 URL）
   - 根据 `skill-id` 查找 `source` 与 `sourceUrl`
   - 确定目标目录：默认 `~/.cursor/skills/<skill-id>/`（可加 `--project` 写当前项目 `.cursor/skills/`）
   - 按 `source` 类型执行：git clone / 下载并解压 / 复制文件
   - 输出成功或失败信息，便于 Claude 向用户反馈

这样「/install」在对话里就对应「运行这条安装命令」，而不是仅跳转网页。

---

**Claude Code（推荐）**：用户执行 `/plugin marketplace add <repo>`，再执行 `/plugin install <plugin>@<marketplace-name>`。无需本地脚本。

**Cursor 备用**：用户或 Claude 在项目根执行 `npm run install-skill -- <skill-id>`，脚本读取 `data/skills.json` 并写入 `~/.cursor/skills/` 或 `.cursor/skills/`。

## 6. 与 Cursor 官方市场的关系

- **官方市场**（cursor.com/marketplace）：插件为 Git 仓库，经 Cursor 审核，在 Cursor 内通过 UI 安装；技能可在聊天中用 `/skill-name` 调用。
- **本市场**：自建注册表 + 自建 Web + 自建安装脚本，面向你自己的技能集合；安装目标仍是 Cursor 的技能目录，安装后同样可用 `/skill-name` 在聊天中调用。
- 可选：在技能元数据里增加 `cursorSlug` 或链接到官方市场条目，方便用户从你的站点跳转到官方或反之。

---

## 7. 实现检查清单

**Claude Code（优先）：**

- [x] 维护 `.claude-plugin/marketplace.json`，插件列表与 `plugins/*` 一致
- [x] 每个插件含 `.claude-plugin/plugin.json`（必填 `version`）与 `skills/<name>/SKILL.md`
- [ ] 定期运行 `claude plugin validate .`（建议加入 CI）
- [ ] Web 从市场或注册表拉取列表，安装指引以 Claude Code `/plugin install` 为主

**可选（Cursor 备用）：**

- [x] 维护 `data/skills.json` 与 `scripts/install-skill.js` 供 Cursor 环境
- [ ] Web 详情页提供「安装命令」复制（Claude Code 与 Cursor 两种说明）

## 8. 安全与可审计性

- 安装脚本应对 `sourceUrl` 做简单校验（协议、域名白名单等），避免任意 URL 被拉取。
- 若从 Git 安装，建议固定 tag 或 commit，避免 main 被篡改导致不可复现。
- 注册表若改为 API，建议只读、可缓存，并考虑签名或版本号以便审计。

以上即为「如何构建市场」以及「如何通过 Claude /install（执行安装命令）使用」的完整设计。
