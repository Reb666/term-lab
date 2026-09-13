# 术语实验室

用中文定义、可操作演示和概念对照学习技术术语。

正式网站：[phtaxis.xyz](https://phtaxis.xyz)。

当前包含 **前端开发 40 项 + 常见 UI 与基础交互 76 项 + 高级 UI 视效 20 项 + 图形编程与交互场景 33 项，共 169 项**。支持分类、关键词和变体搜索、收藏、掌握进度；记录保存在当前浏览器，暂不跨设备同步。

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

高级 UI 视效单独分为材质与光影、图形与色彩、空间与层次、时间与反馈，覆盖玻璃拟态、新拟态、辉光、聚光、渐变、混合模式、双色调、裁剪、遮罩、文字填充、透视、倾斜、翻转、视差、多层阴影、缓动、交错动画、揭示、涟漪和形状变形。每项可调参数并切换基线对照；动画手动触发，遵循页面减少动画设置。倾斜、视差和进度类实验使用滑块，支持触屏与键盘。演示中的场景是本地 CSS 绘制，不依赖外部图片。

视效包位于 `public/effects-data.js`、`public/effects-demos.js` 与 `public/effects.css`。这些是教学近似，不是完整生产组件；具体浏览器的背景模糊、遮罩等支持仍需按目标设备验证。

图形编程板块分为绘图与渲染基础、三维与材质、程序化图形与模拟、视觉效果实例、交互场景。`graphics-data.js` 提供内容，`graphics-ui.js` 管理控件与生命周期，`graphics-demos.js` 和 `graphics-simulations.js` 注册演示，`graphics.css` 提供样式。Canvas、SVG、WebGL 和 WebGPU 使用对应原生 API；三维场景使用明确标注的 CPU 投影教学，模拟注明近似边界。动画默认静止，支持播放、暂停、步进及减少动画；离开实验释放资源。WebGPU 需要安全上下文和可用适配器，不支持时显示说明。

新增内容应保持词条 ID 稳定，注册 `TERMS` 和 `DEMOS`。可选教学字段：`variants: [{name, description}]`、`comparison: {other: "目标词条ID", difference}`。保持键盘与手机可操作，使用 `textContent` 处理用户输入，返回清理函数释放定时器与监听器。

## Cloudflare Pages（GitHub 集成）

Cloudflare Pages 项目 `term-lab` 已连接 `Reb666/term-lab`，配置如下：

| 配置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 框架预设 | None |
| 根目录 | 仓库根目录（留空） |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

合入 main 后由 Pages 自动构建发布到 https://phtaxis.xyz。Pages 默认地址为 https://term-lab.pages.dev；根域 DNS 使用 CNAME 指向该地址。原 Direct Upload 项目 `reb-term-lab` 保留为历史部署，后续不再向它上传更新。

后续使用功能分支、Conventional Commits 和 PR，合并前运行检查。不要强推 main，不提交密钥和 ZIP。详见 [贡献流程](CONTRIBUTING.md)。

## 参考

术语语义参考 [W3C WAI 交互模式](https://www.w3.org/WAI/ARIA/apg/patterns/) 与 [MDN](https://developer.mozilla.org/zh-CN/)。每个条目提供具体来源。原生日期、时间和文件选择器的外观随浏览器与系统变化。
