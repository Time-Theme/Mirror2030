## ✨ 核心特性

- 🎯 **纯静态生成** - 每个页面都是真实HTML文件
- ⚡ **CDN 100%缓存** - 理论上无限并发，零回源压力
- 🔗 **真实URL路径** - 可分享、可刷新、SEO完美
- 📦 **多工具支持** - NPM、PIP、APT、YUM、Docker、Maven、Go等14+工具
- 🏃 **一键脚本** - 复制命令即可使用
- 🔍 **智能搜索** - 实时搜索、高亮显示（静态页面也支持！）
- ⚡ **自动测速** - 后台自动测速，推荐最快镜像（静态页面也支持！）
- 🎨 **智能配置** - 一键设置域名、备案号、联系方式
- 📱 **响应式设计** - 完美支持移动端
- 🚀 **秒开体验** - 首屏加载 < 300ms

## 🎨 v2.0 新特性

### 1. 全新主页设计

**优化前**：4个大分类卡片
**优化后**：3个板块 + 14个紧凑卡片

```
📦 软件包镜像
├── NPM、PIP、Maven、Go、Composer、RubyGems、NuGet、Conda

💻 系统更新镜像
├── APT、YUM、Homebrew

🐳 容器镜像
└── Docker
```

### 2. 纯静态架构

```
访问: /tools/npm/aliyun/
文件: /tools/npm/aliyun/index.html ✅ 真实文件

优势：
✅ 100% CDN缓存
✅ 零回源
✅ 可分享
✅ SEO完美
✅ 无限并发
```

### 3. 优化的标签页

- ✅ 间距优化
- ✅ 下载选项文字间距调整
- ✅ 移动端适配

## 📂 项目结构

```
mirror/
├── index.html                      # 主页（含3个板块）
├── style.css                       # 样式文件
├── config.js                       # 配置数据
├── generate-scripts-enhanced.js    # 脚本生成器
├── generate-static.js              # 静态站点生成器
├── generate-sitemap.js             # Sitemap生成器
├── build.js                        # 一键构建脚本
├── package.json                    # 项目配置
├── README.md                       # 本文件
├── DEPLOY_GUIDE.md                 # 🆕 详细部署指南
├── QUICK_REFERENCE.md              # 快速参考
├── BUILD_GUIDE.md                  # 构建指南
├── robots.txt                      # 爬虫规则
└── scripts/                        # 预生成的脚本文件
    ├── npm-aliyun.sh
    ├── pip-tsinghua.sh
    └── ... (约50个脚本)
```

## 🚀 快速开始

### 1. 智能配置（新功能！）

首次使用，建议先配置站点信息：

```bash
npm run setup
```

交互式配置向导会引导你设置：

- ✅ 网站域名
- ✅ 站点名称
- ✅ ICP备案号（可选）
- ✅ 联系邮箱（可选）
- ✅ GitHub仓库地址
- ✅ 自定义页脚文本
- ✅ Google Analytics（可选）

**这些配置会自动应用到所有生成的页面！**

详细说明请查看 **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

### 2. 一键构建

```bash
npm install        # 首次运行
npm run build      # 一键构建所有内容
```

生成结果：

```
dist/
├── index.html (首页)
├── tools/ (170+ 个静态HTML页面)
├── scripts/ (50+ 个配置脚本)
├── sitemap.xml
└── robots.txt
```

### 3. 本地预览

```bash
npm run preview
```

访问 http://localhost:8000

### 4. 部署

查看 **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)** 获取详细部署步骤

**推荐部署平台**：

- ⭐ **Cloudflare Pages**（全球用户，免费）
- ⭐ **阿里云 OSS + CDN**（国内用户，极快）

## 🛠️ 支持的工具

### 软件包镜像

- **NPM** - Node.js 包管理器
- **PIP** - Python 包管理器
- **Maven** - Java 包管理器
- **Go** - Go 包管理器
- **Composer** - PHP 包管理器
- **RubyGems** - Ruby 包管理器
- **NuGet** - .NET 包管理器
- **Conda** - 数据科学包管理器

### 系统更新镜像

- **APT** - Debian/Ubuntu (5个系统版本)
- **YUM** - CentOS/RHEL (4个系统版本)
- **Homebrew** - macOS 包管理器

### 容器镜像

- **Docker** - Docker Hub 镜像加速

## 📊 统计数据

- **支持工具**：14 种
- **镜像源**：30+ 个
- **系统版本**：9 种
- **预生成脚本**：50+ 个
- **静态HTML页面**：170+ 个
- **总大小**：~625 KB
- **首屏加载**：< 300ms
- **CDN缓存率**：100%

## 📝 NPM 命令

```bash
npm run setup     # 🆕 智能配置向导（首次运行）
npm run scripts   # 生成配置脚本
npm run static    # 生成静态站点
npm run sitemap   # 生成sitemap.xml
npm run build     # 一键构建所有（推荐）
npm run verify    # 🆕 验证静态站点功能完整性
npm run dev       # 本地开发预览
npm run preview   # 预览构建结果
npm run clean     # 清理生成文件
```

## 🎯 SEO 优化

已实施：

- ✅ 每个页面独立HTML文件
- ✅ 完整的meta标签
- ✅ Open Graph / Twitter Card
- ✅ 结构化数据 (Schema.org)
- ✅ sitemap.xml (200+ URL)
- ✅ robots.txt
- ✅ 语义化HTML标签
- ✅ 移动端友好

待完成：

- ⏳ 创建 og-image.jpg (1200×630px)
- ⏳ 提交sitemap到Google/百度/Bing
- ⏳ 创建教程文章内容

## 🌐 部署选项

| 平台                 | 优势                | 适用场景   |
| -------------------- | ------------------- | ---------- |
| **Cloudflare Pages** | 免费、快速、全球CDN | 全球用户 ⭐ |
| **Vercel**           | 免费、自动部署      | 全球用户   |
| **Netlify**          | 免费、易用          | 全球用户   |
| **阿里云 OSS+CDN**   | 国内最快、低成本    | 国内用户 ⭐ |

详细步骤请查看 **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**

## 🔧 常见问题

### Q: 为什么是纯静态而不是SPA？

**A**:

- ✅ CDN 100%缓存（SPA只有30%）
- ✅ 理论上无限并发（SPA有回源压力）
- ✅ SEO完美（SPA需要额外处理）
- ✅ 分享链接永久有效（SPA可能失效）

### Q: 如何添加新的镜像源？

```bash
# 1. 编辑 config.js，在对应工具的 mirrors 中添加
# 2. 重新构建
npm run build
# 3. 重新部署
```

### Q: 如何更新内容？

```bash
# 1. 修改文件
# 2. 重新构建
npm run build
# 3. 部署到服务器
# Cloudflare Pages: git push（自动）
# 阿里云OSS: ossutil cp -r dist/ oss://bucket/
```

## 📖 文档

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - 🆕 智能配置指南（首次使用必读！）
- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)** - 完整部署指南
- **[BUILD_GUIDE.md](BUILD_GUIDE.md)** - 构建原理和详细说明
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 命令速查表
- **[SEO_GUIDE.md](SEO_GUIDE.md)** - SEO优化完全指南

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License - 可自由使用、修改、商用

---

## 🎉 v2.0 更新日志

### 2024-01-xx

**重大更新**：

- ✨ **智能配置系统**（一键设置域名、备案号、联系方式）
- ✨ 全新主页设计（3个板块 + 紧凑卡片）
- ✨ 纯静态架构（100% CDN缓存）
- ✨ 真实URL路径（可分享、可刷新）
- ✨ 优化标签页和间距
- ✨ 完整的部署文档

**性能提升**：

- ⚡ 首屏加载速度：2s → 300ms
- ⚡ CDN缓存率：30% → 100%
- ⚡ 并发能力：中等 → 无限

**SEO优化**：

- 📈 可索引URL：1个 → 170+个
- 📈 搜索收录难度：困难 → 容易

**部署体验**：

- 🎯 一键配置站点信息
- 🎯 自动注入到所有页面
- 🎯 支持ICP备案号、Google Analytics
- 🎯 灵活的配置管理

---

**Made with ❤️ for developers in China**
