# 普陀中学摄影社官网（pcpths）

摄影社官方静态网站，通过 GitHub Pages 发布：**https://kylinle.github.io/pcpths/**
仓库：**KylinLe/pcpths**（public，main 分支根目录部署，push 后自动构建，约 1-2 分钟生效）

## 与用户协作的方式（重要）

- 用户不是程序员，需求可能模糊或含错误。以产品经理思维工作：先理解真实需求，主动给建议并说明理由，用大白话解释技术决策，不要把专业选项清单抛给用户。
- **范围红线**：只允许修改本仓库（pcpths），绝不触碰用户的其他项目（如 KylinLe/cp 上课平台等）。指向其他项目的链接只做引用。
- 所有 git/GitHub 操作由 Claude 代劳；用户只负责描述需求和确认结果。

## 技术栈

纯静态 HTML/CSS/JS，无框架、无构建工具。设计语言：**细线 / 黑白 / 字距 / 六边形光孔**。

## 目录结构

```
├── index.html          # 主页（单页：首屏、01 课程、02 任务、03 后续计划、04 APP 下载（安卓 / 苹果双按钮；苹果带 Safari 提醒弹窗 → 确定后下载并跳转安装指南））
├── css/style.css       # 全部样式（设计变量在 :root）
├── js/main.js          # 全部交互（对缺失元素有防御性判断，可安全用于任何分页面）
├── plan/               # 计划分页面
│   ├── clubs-greeting.html   # 元旦各社团祝福拍摄（已填内容）
│   └── gala-recording.html   # 元旦晚会拍摄与录制（岗位安排表）
├── guide/              # 使用指南分页面
│   └── ios-install.html    # 苹果版 APP 安装指南（主页 05 模块跳转到这里）
├── downloads/          # 供下载的文件（主页下载按钮指向这里）
│   ├── pcpths_android.apk    # 安卓版 APP 安装包（04 模块）
│   └── 普陀中学摄影社.mobileconfig  # 苹果版安装配置文件（05 模块）
├── assets/logo.png     # 社团 logo（导航、页脚、favicon）
└── .gitignore          # 排除 .DS_Store
```

## 设计规范（强制）

**所有分页面和新增模块必须复用主页组件，不允许自创视觉样式：**

| 用途 | 组件 |
|------|------|
| 顶部导航 | `.nav`（毛玻璃顶栏，含品牌区、链接、上课平台按钮、移动端菜单；主页导航与手机菜单含「通知」入口 `.notices-toggle`，点击重新显示全部通知） |
| 页面首屏 | `section.hero` > `.wrap`：`.eyebrow` + `h1` + `.hero-en` |
| 内容分节 | `section.sec` > `.wrap`：`.sec-head`（`.sec-num` + `h2` + `.en`）+ `.sec-body` |
| 列表 | `.list`（黑色顶线）> `.list-item`（`.n` 序号 / `.t` 标题 / `.d` 描述） |
| 可点击列表 | `.list-item.plan-item` 加 `.go` 小按钮（主页"后续计划"用法） |
| 课程卡片 | `.courses` > `.course`（`.idx` + `h3` + `.en` + `p`） |
| 岗位表 | `.spec-table`（表头小字距，行间浅灰细线；移动端转卡片堆叠，`data-label` 提供字段名） |
| 通知栏 | `.notices` 容器（主页顶栏下方固定，始终留在 DOM）+ 多条 `.notice` 黑底细条堆叠（`.notice-link` 整条可点跳转对应板块 + `.notice-close` 细线 × 独立关闭；JS 按可见条数动态更新 `--notices-h`，`body` 加 `has-notice` 给内容与锚点让位；关闭记录存 localStorage 同浏览器持久，顶栏「通知」入口可重新显示全部并重播 `.repop` 滑入动画作为弹出反馈） |
| 下载按钮 | `.dl-btn`（黑色描边大按钮，悬停反色，与 `.platform-btn`/`.go` 同款按钮语言；带 `data-file` 属性的才会触发下载弹窗，普通链接跳转不弹窗；多个按钮用 `.dl-opts` 双栏网格并排，移动端单列） |
| 弹窗 | `.modal` > `.modal-mask` + `.modal-box`（浅灰细线框白底，`.modal-btn` 按钮；Esc / 点遮罩关闭。`#dlModal` 开始下载提示，文件名由按钮 `data-file` 动态填入 `#dlFile`；`#iosModal` Safari 使用提醒，确定后下载并跳转指南页） |

- 颜色/间距一律用变量：`--ink --paper --muted --faint --line --pad --maxw --ease`

### 细线规则（美观为先，禁止过度使用）

- 结构分隔一律 1px 浅灰 `--line`：分节、列表行、导航/页脚/底栏边缘、手机菜单
- 纯黑 `--ink` 仅限三处强调：列表/模块顶部起始线（`.list`、`.courses`）、按钮描边（`.platform-btn`、`.go`）、链接悬停下划线
- 只用 1px；同方向禁止近距双线；拿不准就用浅灰
- 计划分页（`plan/`）内容区不设上下框线，以留白分隔
- 分页面引用路径相对（`../css/style.css`、`../assets/logo.png`）
- 计划分页面特有：底部固定底栏 `.foot.foot-bar`（logo + 版权，白底细线，无毛玻璃）
- 主页通知栏 `.notices`（黑底白字，可多条堆叠，条与条之间用白色 18% 细线分隔——白底浅灰线的反相；关闭后同浏览器不再出现，顶栏「通知」可重新显示）
- 长标题用 `.plan-title`（h1 的缩小变体）；滚动显现统一用 `.reveal` 类

## 发布流程

1. 改动本地文件（先跑无头 Chrome 验证：临时装 playwright-core 驱动系统 Chrome，检查布局溢出、资源 404、控制台报错）
2. `git add -A && git commit -m "..." && git push origin main`
3. 线上验证：等 Pages 构建后用**仅新版独有的文字**做标志（旧版也有的字样会误判）

## 网络异常兜底

github.com 主站时通时断（push 会超时）。api.github.com 通常稳定。当 git push 失败时，用 `gh api` 的 Git Data API 上传提交：创建 blobs → 基于远程当前 tree 创建新 tree → 创建 commit（parent 指向远程 HEAD）→ PATCH `git/refs/heads/main`。上传成功后 `git fetch` 并 `reset --hard origin/main` 对齐本地。文件内容用 python 生成 JSON（base64）后 `gh api --input` 传入，避免命令行参数过长。

## 已安装环境

- gh CLI v2.103.3（`~/.local/bin/gh`，已登录 KylinLe，token 存 macOS 钥匙串）
- git credential.helper 已配置为 `gh auth git-credential`，push/pull 免密
