# 修改与发布流程

1. `git switch main`，确认工作区干净后运行 `git pull --ff-only`。
2. `git switch -c feat/描述`（修复使用 `fix/描述`）。
3. 修改 `public/`，保持稳定的词条 ID；运行 `npm test` 和 `npm run build`。
4. UI 改动验证桌面、手机及键盘操作。检查 `git diff`，只暂存本次相关文件。
5. 使用 Conventional Commits，例如 `feat(ui): add date range comparison`。
6. 推送分支并创建 PR，写明变化与验证；检查通过后合入 `main`。
7. Cloudflare Pages 自动从 `main` 构建并发布，确认构建成功与实际页面。

不要强推主分支，不上传 ZIP、密钥或 `dist/`。回退已发布变更使用 `git revert` 并经正常流程发布。

仓库内规范和 CI 已配置；服务端分支保护是否启用应以 GitHub 设置为准。
