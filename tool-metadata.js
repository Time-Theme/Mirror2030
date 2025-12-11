// 工具详细元数据（用于SEO和页面展示）
const toolMetadata = {
    npm: {
        description: "NPM（Node Package Manager）是 Node.js 的官方包管理工具，也是世界上最大的软件注册表。它让JavaScript开发者可以轻松共享和重用代码，管理项目依赖。NPM拥有超过200万个开源包，覆盖前端开发、后端服务、命令行工具等各个领域。通过配置国内镜像源，可以将下载速度从几KB/s提升到几MB/s，极大改善开发体验。",
        officialSite: "https://www.npmjs.com/",
        documentation: "https://docs.npmjs.com/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    yarn: {
        description: "Yarn 是由 Facebook 开发的快速、可靠、安全的 JavaScript 包管理工具。它作为 NPM 的替代方案，提供了更快的安装速度、更好的离线支持和确定性的依赖管理。Yarn 使用并行下载、缓存机制等技术显著提升了包安装效率，特别适合大型项目和团队协作开发。",
        officialSite: "https://yarnpkg.com/",
        documentation: "https://yarnpkg.com/getting-started",
        platforms: ["Windows", "macOS", "Linux"]
    },

    pnpm: {
        description: "PNPM（Performant NPM）是新一代的 Node.js 包管理器，以其卓越的性能和磁盘效率著称。它采用独特的内容寻址存储机制，所有包只存储一次，通过硬链接复用，可节省大量磁盘空间。PNPM 的安装速度比 NPM 快2-3倍，特别适合 monorepo 项目和需要频繁安装依赖的场景。",
        officialSite: "https://pnpm.io/",
        documentation: "https://pnpm.io/motivation",
        platforms: ["Windows", "macOS", "Linux"]
    },

    pip: {
        description: "PIP（Pip Installs Packages）是 Python 的标准包管理工具，用于安装和管理 Python 软件包。它可以从 PyPI（Python Package Index）下载超过40万个Python包，涵盖数据科学、机器学习、Web开发、自动化脚本等各个领域。配置国内镜像后，可以解决 pip install 经常超时的问题，让包安装流畅如丝。",
        officialSite: "https://pip.pypa.io/",
        documentation: "https://pip.pypa.io/en/stable/user_guide/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    maven: {
        description: "Apache Maven 是 Java 生态系统中最流行的项目管理和构建工具。它不仅管理项目依赖，还提供了标准化的项目结构、构建流程和插件系统。Maven 从中央仓库下载 JAR 包，配置国内镜像后可以将依赖下载速度提升10倍以上，是Java企业级开发的必备工具。",
        officialSite: "https://maven.apache.org/",
        documentation: "https://maven.apache.org/guides/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    gradle: {
        description: "Gradle 是现代化的构建自动化工具，特别在 Android 开发中被广泛使用。它结合了 Ant 的灵活性和 Maven 的约定优于配置原则，使用 Groovy 或 Kotlin DSL 编写构建脚本。Gradle 支持增量构建、构建缓存等高级特性，配置国内镜像后可以显著加快 Android 项目的构建速度。",
        officialSite: "https://gradle.org/",
        documentation: "https://docs.gradle.org/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    go: {
        description: "Go Modules 是 Go 语言的官方依赖管理系统（Go 1.11+）。它通过 go.mod 文件声明项目依赖，自动下载所需的包和版本。GOPROXY 环境变量用于配置模块下载代理，使用国内代理可以解决 golang.org/x 等包无法访问的问题，让 go get 命令畅通无阻。",
        officialSite: "https://go.dev/",
        documentation: "https://go.dev/doc/modules/managing-dependencies",
        platforms: ["Windows", "macOS", "Linux"]
    },

    docker: {
        description: "Docker 是领先的容器化平台，通过镜像（Image）和容器（Container）技术实现应用的快速部署和环境一致性。Docker Hub 是官方的镜像仓库，包含数百万个容器镜像。由于网络原因，国内拉取镜像经常失败或速度极慢。配置国内镜像加速器后，docker pull 速度可提升10-50倍。",
        officialSite: "https://www.docker.com/",
        documentation: "https://docs.docker.com/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    composer: {
        description: "Composer 是 PHP 的依赖管理工具，允许你声明项目所依赖的库并自动安装它们。它类似于 Node.js 的 NPM 或 Python 的 PIP，从 Packagist.org 下载PHP包。Composer 是现代 PHP 开发的标准工具，Laravel、Symfony 等主流框架都使用它管理依赖。配置国内镜像可以大幅提升包下载速度。",
        officialSite: "https://getcomposer.org/",
        documentation: "https://getcomposer.org/doc/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    rubygems: {
        description: "RubyGems 是 Ruby 的包管理系统，用于分发和安装 Ruby 程序和库（称为 Gems）。Ruby on Rails 等流行框架都通过 RubyGems 分发。由于官方源服务器在国外，国内用户经常遇到连接超时或速度缓慢的问题。配置国内镜像后，gem install 可以达到MB/s级别的下载速度。",
        officialSite: "https://rubygems.org/",
        documentation: "https://guides.rubygems.org/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    cargo: {
        description: "Cargo 是 Rust 语言的包管理器和构建工具，它负责下载依赖、编译包、分发包等任务。Rust 的生态系统通过 crates.io 分发超过10万个 crate（Rust包）。由于网络原因，国内用户访问 crates.io 和 GitHub 经常不稳定。配置国内镜像源可以解决 cargo build 卡住或失败的问题。",
        officialSite: "https://doc.rust-lang.org/cargo/",
        documentation: "https://doc.rust-lang.org/cargo/reference/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    nuget: {
        description: "NuGet 是 .NET 平台的包管理工具，提供了创建、发布和使用.NET库的完整解决方案。它集成在 Visual Studio 中，支持 C#、VB.NET、F# 等.NET语言。NuGet Gallery 拥有超过30万个包，覆盖各类.NET开发需求。配置国内镜像可以加速包还原（restore）过程。",
        officialSite: "https://www.nuget.org/",
        documentation: "https://learn.microsoft.com/nuget/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    conda: {
        description: "Conda 是开源的包管理和环境管理系统，专为 Python 数据科学和机器学习设计。与 PIP 不同，Conda 不仅管理 Python 包，还能管理底层的二进制依赖（如 CUDA、MKL）。它提供虚拟环境隔离，特别适合科学计算、深度学习等需要复杂依赖的场景。配置国内镜像可以大幅加速 conda install 速度。",
        officialSite: "https://docs.conda.io/",
        documentation: "https://docs.conda.io/projects/conda/en/latest/user-guide/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    apt: {
        description: "APT（Advanced Package Tool）是 Debian 和 Ubuntu 系统的包管理工具，用于安装、升级、卸载软件包。它自动处理依赖关系，从软件源（repository）下载 .deb 包。Ubuntu 官方源服务器在国外，国内用户使用 apt update 和 apt install 经常很慢。配置国内镜像源可以将系统更新速度提升10倍以上。",
        officialSite: "https://ubuntu.com/",
        documentation: "https://help.ubuntu.com/community/AptGet/Howto",
        platforms: ["Linux (Debian/Ubuntu)"]
    },

    yum: {
        description: "YUM（Yellowdog Updater Modified）是 RHEL、CentOS、Fedora 等红帽系 Linux 发行版的包管理工具。它使用 RPM 包格式，自动解析和安装依赖。随着 CentOS 8 停止维护，CentOS Stream 和 Rocky Linux 成为主流替代。配置国内镜像源可以加速 yum install 和系统更新过程。",
        officialSite: "https://www.redhat.com/",
        documentation: "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/managing-software-packages_configuring-basic-system-settings",
        platforms: ["Linux (RHEL/CentOS/Fedora)"]
    },

    homebrew: {
        description: "Homebrew 是 macOS 和 Linux 的包管理工具，被称为 macOS 缺失的软件包管理器。它让在 Mac 上安装开发工具变得简单，支持数千个常用软件（formula）和图形应用（cask）。由于 Homebrew 从 GitHub 和官方源下载，国内用户经常遇到速度慢或连接失败的问题。配置国内镜像可以显著提升 brew install 速度。",
        officialSite: "https://brew.sh/",
        documentation: "https://docs.brew.sh/",
        platforms: ["macOS", "Linux"]
    },

    flutter: {
        description: "Flutter 是 Google 开发的跨平台 UI 框架，用一套代码可以构建 iOS、Android、Web、Desktop 应用。Flutter SDK 和 Dart Pub 包需要从 Google 服务器下载，国内访问经常受限。配置 Flutter 和 Dart 的国内镜像可以解决 flutter create、flutter pub get 等命令卡住的问题，让跨平台开发更流畅。",
        officialSite: "https://flutter.dev/",
        documentation: "https://docs.flutter.dev/",
        platforms: ["Windows", "macOS", "Linux"]
    },

    cpan: {
        description: "CPAN（Comprehensive Perl Archive Network）是 Perl 的综合存档网络，包含超过25年积累的18万个 Perl 模块。它是 Perl 生态系统的核心，几乎所有 Perl 项目都依赖 CPAN 模块。由于官方镜像在国外，使用 cpan 命令安装模块时速度较慢。配置国内镜像可以加速模块下载，改善 Perl 开发体验。",
        officialSite: "https://www.cpan.org/",
        documentation: "https://www.cpan.org/modules/INSTALL.html",
        platforms: ["Windows", "macOS", "Linux"]
    },

    cran: {
        description: "CRAN（Comprehensive R Archive Network）是 R 语言的官方软件包仓库，托管了超过1.9万个 R 包，涵盖统计分析、数据可视化、机器学习等各个领域。R 在学术界和数据科学领域广泛使用，但 CRAN 官方镜像在国外，下载速度慢。配置国内 CRAN 镜像可以让 install.packages() 命令飞速完成包安装。",
        officialSite: "https://cran.r-project.org/",
        documentation: "https://cran.r-project.org/doc/manuals/r-release/R-admin.html",
        platforms: ["Windows", "macOS", "Linux"]
    }
};

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = toolMetadata;
}

// 浏览器环境全局变量
if (typeof window !== 'undefined') {
    window.toolMetadata = toolMetadata;
}
