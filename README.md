# 术语实验室

用中文定义、可操作演示和概念对照学习技术术语。

当前包含 **前端开发 40 项 + 常见 UI 与基础交互 76 项，共 116 项**。支持分类、关键词和变体搜索、收藏、掌握进度；记录保存在当前浏览器，暂不跨设备同步。

## 本地使用

直接打开 `public/index.html`，或运行：

```sh
python -m http.server 8765 --directory public --bind 127.0.0.1
```

开发校验与构建需要 Node.js 20+，没有第三方运行依赖：

```sh
npm ci
npm test
npm run build
```

## 结构

- `public/`：网站源码与运行资源，直接打开即可运行。
- `scripts/check.cjs`：检查资源、脚本语法、词条结构、关联及演示注册。
- `scripts/build.cjs`：校验后生成 `dist/`；构建产物不提交。
- `AGENTS.md`、`CONTRIBUTING.md`：后续修改和 Git 规范。
- `.github/workflows/ci.yml`：push/PR 自动检查。

UI 分为内容与标识、页面区域、输入与选择、导航与展开、信息与容器、浮层与提示、状态与反馈、滚动与操作。每项有可操作演示、定义、常见场景、误区、变体、相似概念对照、理解题与官方文档链接。高级特效不在这个板块。

新增内容应保持词条 ID 稳定，注册 `TERMS` 和 `DEMOS`。可选教学字段：`variants: [{name, description}]`、`comparison: {other: "目标词条ID", difference}`。保持键盘与手机可操作，使用 `textContent` 处理用户输入，返回清理函数释放定时器与监听器。

## Cloudflare Pages（GitHub 集成）

在 Pages 中连接 `Reb666/term-lab`，设置：

| 配置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 框架预设 | None |
| 根目录 | 仓库根目录（留空） |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

合入 main 后由 Pages 自动构建发布。首次迁移前的 Direct Upload 项目独立存在；最终项目地址与自定义域名以控制台激活状态为准。

后续使用功能分支、Conventional Commits 和 PR，合并前运行检查。不要强推 main，不提交密钥和 ZIP。详见 [贡献流程](CONTRIBUTING.md)。

## 参考

术语语义参考 [W3C WAI 交互模式](https://www.w3.org/WAI/ARIA/apg/patterns/) 与 [MDN](https://developer.mozilla.org/zh-CN/)。每个条目提供具体来源。原生日期、时间和文件选择器的外观随浏览器与系统变化。
