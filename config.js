// 镜像源配置数据 - 商业化版本
const mirrorConfig = {
    // 工具分类映射
    categories: {
        system: {
            name: '系统包管理器',
            tools: ['apt', 'yum', 'homebrew']
        },
        language: {
            name: '编程语言',
            tools: ['npm', 'yarn', 'pnpm', 'pip', 'composer', 'maven', 'go', 'rubygems', 'cargo', 'gradle']
        },
        container: {
            name: '容器 & 虚拟化',
            tools: ['docker']
        },
        other: {
            name: '其他工具',
            tools: ['nuget', 'conda', 'flutter', 'cpan', 'cran']
        }
    },

    // 工具配置
    tools: {
        npm: {
            name: "NPM",
            fullName: "NPM (Node.js 包管理器)",
            icon: "📦",
            category: "language",
            requiresOS: false,
            description: "NPM（Node Package Manager）是 Node.js 的官方包管理工具，也是世界上最大的软件注册表。它让JavaScript开发者可以轻松共享和重用代码，管理项目依赖。NPM拥有超过200万个开源包，覆盖前端开发、后端服务、命令行工具等各个领域。通过配置国内镜像源，可以将下载速度从几KB/s提升到几MB/s，极大改善开发体验。",
            officialSite: "https://www.npmjs.com/",
            documentation: "https://docs.npmjs.com/",
            platforms: ["Windows", "macOS", "Linux"],
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://registry.npmmirror.com",
                    testUrl: "https://registry.npmmirror.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/npm/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/npm/",
                    testUrl: "https://mirrors.huaweicloud.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/npm/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                }
            },
            // 手动配置命令（简短版，2-3行）
            getManualCommands: function(mirror) {
                return `npm config set registry ${mirror.url}`;
            },
            // 完整脚本生成
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# NPM 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 NPM 镜像源..."

# 设置镜像源
npm config set registry ${mirror.url}

# 验证配置
echo "配置完成！当前镜像源："
npm config get registry

echo "\\n✅ NPM 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: npm config delete registry"`;
            },
            generateConfigFile: function(mirror) {
                return `# NPM 配置文件 (.npmrc)
# 由 镜像加速站 自动生成
# 放置位置: ~/.npmrc 或项目根目录

registry=${mirror.url}`;
            }
        },

        pip: {
            name: "PIP",
            fullName: "PIP (Python 包管理器)",
            icon: "🐍",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com/pypi/simple/",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/pypi/simple/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "https://pypi.tuna.tsinghua.edu.cn/simple",
                    testUrl: "https://pypi.tuna.tsinghua.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `pip config set global.index-url ${mirror.url}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# PIP 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 PIP 镜像源..."

# 永久配置
pip config set global.index-url ${mirror.url}

# 验证配置
echo "配置完成！当前镜像源："
pip config get global.index-url

echo "\\n✅ PIP 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: pip config unset global.index-url"`;
            },
            generateConfigFile: function(mirror) {
                // Windows 使用 pip.ini，Linux/macOS 使用 pip.conf
                return `# PIP 配置文件
# 由 镜像加速站 自动生成
# Windows 位置: %APPDATA%\\pip\\pip.ini
# Linux/macOS 位置: ~/.pip/pip.conf

[global]
index-url = ${mirror.url}
[install]
trusted-host = ${mirror.url.replace('https://', '').replace('http://', '').split('/')[0]}`;
            }
        },

        apt: {
            name: "APT",
            fullName: "APT (Debian/Ubuntu 包管理器)",
            icon: "🐧",
            category: "system",
            requiresOS: true,
            osVersions: {
                "ubuntu-24.04": "Ubuntu 24.04 LTS (Noble Numbat)",
                "ubuntu-22.04": "Ubuntu 22.04 LTS (Jammy Jellyfish)",
                "ubuntu-20.04": "Ubuntu 20.04 LTS (Focal Fossa)",
                "ubuntu-18.04": "Ubuntu 18.04 LTS (Bionic Beaver)",
                "debian-12": "Debian 12 (Bookworm)",
                "debian-11": "Debian 11 (Bullseye)",
                "debian-10": "Debian 10 (Buster)"
            },
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "mirrors.aliyun.com",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "mirrors.cloud.tencent.com",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "mirrors.tuna.tsinghua.edu.cn",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                huawei: {
                    name: "华为云",
                    url: "mirrors.huaweicloud.com",
                    testUrl: "https://mirrors.huaweicloud.com"
                }
            },
            getManualCommands: function(mirror, osVersion) {
                return `# 备份原有配置
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup

# 替换为 ${mirror.name} 镜像源（请根据系统版本修改）
# 然后执行: sudo apt update`;
            },
            generateScript: function(mirror, osVersion) {
                const sourcesContent = this.generateSourcesList(mirror.url, osVersion);
                return `#!/bin/bash
# APT 镜像源配置 - ${mirror.name}
# 系统版本: ${this.osVersions[osVersion]}
# 由 镜像加速站 自动生成

echo "正在配置 APT 镜像源..."

# 备份原有源列表
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d) 2>/dev/null
echo "✓ 原有配置已备份"

# 写入新的镜像源配置
sudo tee /etc/apt/sources.list > /dev/null << 'EOF'
${sourcesContent}
EOF

echo "✓ 镜像源配置已更新"

# 更新软件包列表
echo "正在更新软件包列表..."
sudo apt update

echo "\\n✅ APT 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复原有配置，执行: sudo mv /etc/apt/sources.list.backup.* /etc/apt/sources.list && sudo apt update"`;
            },
            generateSourcesList: function(baseUrl, osVersion) {
                const [distro, version] = osVersion.split('-');
                const codenames = {
                    '24.04': 'noble',
                    '22.04': 'jammy',
                    '20.04': 'focal',
                    '18.04': 'bionic',
                    '12': 'bookworm',
                    '11': 'bullseye',
                    '10': 'buster'
                };
                const codename = codenames[version];

                if (distro === 'ubuntu') {
                    return `deb http://${baseUrl}/ubuntu/ ${codename} main restricted universe multiverse
deb http://${baseUrl}/ubuntu/ ${codename}-updates main restricted universe multiverse
deb http://${baseUrl}/ubuntu/ ${codename}-backports main restricted universe multiverse
deb http://${baseUrl}/ubuntu/ ${codename}-security main restricted universe multiverse`;
                } else if (distro === 'debian') {
                    // Debian 11+ 使用新的安全更新路径 debian-security，Debian 10及更早版本使用 debian/updates
                    const versionNum = parseInt(version);
                    if (versionNum >= 11) {
                        // Debian 11, 12+ 新路径
                        return `deb http://${baseUrl}/debian/ ${codename} main contrib non-free non-free-firmware
deb http://${baseUrl}/debian/ ${codename}-updates main contrib non-free non-free-firmware
deb http://${baseUrl}/debian-security ${codename}-security main contrib non-free non-free-firmware`;
                    } else {
                        // Debian 10 及更早版本旧路径
                        return `deb http://${baseUrl}/debian/ ${codename} main contrib non-free
deb http://${baseUrl}/debian/ ${codename}-updates main contrib non-free
deb http://${baseUrl}/debian/ ${codename}/updates main contrib non-free`;
                    }
                }
            }
        },

        yum: {
            name: "YUM",
            fullName: "YUM (CentOS/RHEL 包管理器)",
            icon: "🎩",
            category: "system",
            requiresOS: true,
            osVersions: {
                "centos-7": "CentOS 7",
                "centos-8": "CentOS 8",
                "centos-stream-8": "CentOS Stream 8",
                "centos-stream-9": "CentOS Stream 9"
            },
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "mirrors.aliyun.com",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "mirrors.cloud.tencent.com",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "mirrors.tuna.tsinghua.edu.cn",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                huawei: {
                    name: "华为云",
                    url: "mirrors.huaweicloud.com",
                    testUrl: "https://mirrors.huaweicloud.com"
                }
            },
            getManualCommands: function(mirror, osVersion) {
                return `# 备份原有配置并下载新配置
sudo mkdir -p /etc/yum.repos.d/backup
sudo mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/backup/
# 然后执行: sudo yum makecache`;
            },
            generateScript: function(mirror, osVersion) {
                const version = osVersion.split('-').pop();
                return `#!/bin/bash
# YUM 镜像源配置 - ${mirror.name}
# 系统版本: ${this.osVersions[osVersion]}
# 由 镜像加速站 自动生成

echo "正在配置 YUM 镜像源..."

# 备份原有配置
sudo mkdir -p /etc/yum.repos.d/backup
sudo mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/backup/ 2>/dev/null
echo "✓ 原有配置已备份"

# 下载镜像源配置文件
sudo curl -o /etc/yum.repos.d/CentOS-Base.repo https://${mirror.url}/repo/Centos-${version}.repo
echo "✓ 镜像源配置已更新"

# 清理并生成缓存
echo "正在生成缓存..."
sudo yum clean all
sudo yum makecache

echo "\\n✅ YUM 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复原有配置，执行: sudo mv /etc/yum.repos.d/backup/*.repo /etc/yum.repos.d/ && sudo yum clean all"`;
            }
        },

        docker: {
            name: "Docker",
            fullName: "Docker Hub 镜像加速",
            icon: "🐳",
            category: "container",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://registry.cn-hangzhou.aliyuncs.com",
                    testUrl: "https://mirrors.aliyun.com",
                    note: "阿里云 Docker 镜像需要登录阿里云账号配置专属加速地址"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirror.ccs.tencentyun.com",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                daocloud: {
                    name: "DaoCloud",
                    url: "https://docker.m.daocloud.io",
                    testUrl: "https://www.daocloud.io"
                }
            },
            getManualCommands: function(mirror) {
                return `# 编辑 /etc/docker/daemon.json
# 添加: {"registry-mirrors": ["${mirror.url}"]}
# 然后执行: sudo systemctl restart docker`;
            },
            generateScript: function(mirror, osVersion) {
                const note = mirror.note ? `# ⚠️  ${mirror.note}\n` : '';
                return `#!/bin/bash
# Docker 镜像加速配置 - ${mirror.name}
# 由 镜像加速站 自动生成
${note}
echo "正在配置 Docker 镜像加速..."

# 创建或修改 daemon.json
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "registry-mirrors": ["${mirror.url}"]
}
EOF

echo "✓ 镜像加速配置已更新"

# 重启 Docker 服务
echo "正在重启 Docker 服务..."
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
echo "\\n当前镜像加速配置："
docker info | grep "Registry Mirrors" -A 1

echo "\\n✅ Docker 镜像加速已成功配置为 ${mirror.name}"`;
            },
            generateConfigFile: function(mirror) {
                return `{
  "registry-mirrors": ["${mirror.url}"]
}`;
            }
        },

        nuget: {
            name: "NuGet",
            fullName: "NuGet (.NET 包管理器)",
            icon: "📘",
            category: "other",
            requiresOS: false,
            mirrors: {
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/nuget/v3/index.json",
                    testUrl: "https://mirrors.huaweicloud.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/nuget/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                }
            },
            getManualCommands: function(mirror) {
                return `dotnet nuget add source ${mirror.url} -n ${mirror.name}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# NuGet 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 NuGet 镜像源..."

# 添加镜像源
dotnet nuget add source ${mirror.url} -n ${mirror.name}

# 验证配置
echo "\\n当前配置的源："
dotnet nuget list source

echo "\\n✅ NuGet 镜像源已成功添加"
echo "建议保留官方源，镜像源作为补充"`;
            }
        },

        composer: {
            name: "Composer",
            fullName: "Composer (PHP 包管理器)",
            icon: "🐘",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com/composer/",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/composer/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/php/",
                    testUrl: "https://mirrors.huaweicloud.com"
                }
            },
            getManualCommands: function(mirror) {
                return `composer config -g repo.packagist composer ${mirror.url}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Composer 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Composer 镜像源..."

# 全局配置
composer config -g repo.packagist composer ${mirror.url}

# 验证配置
echo "\\n当前配置："
composer config -g repo.packagist

echo "\\n✅ Composer 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: composer config -g --unset repos.packagist"`;
            }
        },

        maven: {
            name: "Maven",
            fullName: "Maven (Java 包管理器)",
            icon: "☕",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://maven.aliyun.com/repository/public",
                    testUrl: "https://maven.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/maven/",
                    testUrl: "https://mirrors.huaweicloud.com"
                }
            },
            getManualCommands: function(mirror) {
                return `# 编辑 ~/.m2/settings.xml
# 在 <mirrors> 标签中添加镜像配置
# <mirror>
#   <id>${mirror.name}</id>
#   <url>${mirror.url}</url>
#   <mirrorOf>central</mirrorOf>
# </mirror>`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Maven 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Maven 镜像源..."

# 创建 Maven 配置目录
mkdir -p ~/.m2

# 备份原有配置
if [ -f ~/.m2/settings.xml ]; then
    cp ~/.m2/settings.xml ~/.m2/settings.xml.backup.$(date +%Y%m%d)
    echo "✓ 原有配置已备份"
fi

# 写入新配置
cat > ~/.m2/settings.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <mirrors>
    <mirror>
      <id>${mirror.name}</id>
      <name>${mirror.name} Maven Mirror</name>
      <url>${mirror.url}</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
EOF

echo "✓ Maven 镜像源配置已更新"
echo "\\n✅ Maven 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复原有配置，执行: mv ~/.m2/settings.xml.backup.* ~/.m2/settings.xml"`;
            },
            generateConfigFile: function(mirror) {
                return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Maven 配置文件 (settings.xml) -->
<!-- 由 镜像加速站 自动生成 -->
<!-- 放置位置: ~/.m2/settings.xml -->
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <mirrors>
    <mirror>
      <id>${mirror.name}</id>
      <name>${mirror.name} Maven Mirror</name>
      <url>${mirror.url}</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>`;
            }
        },

        go: {
            name: "Go",
            fullName: "Go Modules (Go 包管理器)",
            icon: "🐹",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com/goproxy/",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/go/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                goproxy: {
                    name: "Goproxy.cn",
                    url: "https://goproxy.cn,direct",
                    testUrl: "https://goproxy.cn"
                },
                goproxyio: {
                    name: "Goproxy.io",
                    url: "https://goproxy.io,direct",
                    testUrl: "https://goproxy.io"
                }
            },
            getManualCommands: function(mirror) {
                return `go env -w GOPROXY=${mirror.url}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Go Modules 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Go Modules 镜像源..."

# 设置 GOPROXY
go env -w GOPROXY=${mirror.url}

# 可选：设置不走代理的私有仓库
# go env -w GOPRIVATE=*.corp.example.com

# 验证配置
echo "\\n当前配置："
go env GOPROXY

echo "\\n✅ Go Modules 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: go env -u GOPROXY"`;
            }
        },

        rubygems: {
            name: "RubyGems",
            fullName: "RubyGems (Ruby 包管理器)",
            icon: "💎",
            category: "language",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/rubygems/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/rubygems/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn/rubygems/",
                    testUrl: "https://mirrors.ustc.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `gem sources --add ${mirror.url} --remove https://rubygems.org/`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# RubyGems 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 RubyGems 镜像源..."

# 移除官方源
gem sources --remove https://rubygems.org/

# 添加镜像源
gem sources --add ${mirror.url}

# 清除缓存
gem sources -c

# 验证配置
echo "\\n当前镜像源："
gem sources -l

echo "\\n✅ RubyGems 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: gem sources --add https://rubygems.org/ --remove ${mirror.url}"`;
            }
        },

        homebrew: {
            name: "Homebrew",
            fullName: "Homebrew (macOS 包管理器)",
            icon: "🍺",
            category: "system",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn",
                    testUrl: "https://mirrors.ustc.edu.cn"
                },
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com",
                    testUrl: "https://mirrors.aliyun.com"
                }
            },
            getManualCommands: function(mirror) {
                return `export HOMEBREW_BREW_GIT_REMOTE="${mirror.url}/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="${mirror.url}/git/homebrew/homebrew-core.git"
brew update`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Homebrew 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Homebrew 镜像源..."

# 设置环境变量
export HOMEBREW_BREW_GIT_REMOTE="${mirror.url}/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="${mirror.url}/git/homebrew/homebrew-core.git"

# 写入 shell 配置文件
if [ -f ~/.zshrc ]; then
    echo 'export HOMEBREW_BREW_GIT_REMOTE="${mirror.url}/git/homebrew/brew.git"' >> ~/.zshrc
    echo 'export HOMEBREW_CORE_GIT_REMOTE="${mirror.url}/git/homebrew/homebrew-core.git"' >> ~/.zshrc
    echo "✓ 已写入 ~/.zshrc"
elif [ -f ~/.bash_profile ]; then
    echo 'export HOMEBREW_BREW_GIT_REMOTE="${mirror.url}/git/homebrew/brew.git"' >> ~/.bash_profile
    echo 'export HOMEBREW_CORE_GIT_REMOTE="${mirror.url}/git/homebrew/homebrew-core.git"' >> ~/.bash_profile
    echo "✓ 已写入 ~/.bash_profile"
fi

# 更新 Homebrew
brew update

echo "\\n✅ Homebrew 镜像源已成功配置为 ${mirror.name}"
echo "重启终端或执行 source ~/.zshrc 以使配置生效"`;
            }
        },

        conda: {
            name: "Conda",
            fullName: "Conda (数据科学包管理器)",
            icon: "🐍",
            category: "other",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn",
                    testUrl: "https://mirrors.ustc.edu.cn"
                },
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com",
                    testUrl: "https://mirrors.aliyun.com"
                }
            },
            getManualCommands: function(mirror) {
                return `# 生成配置文件
conda config --set show_channel_urls yes
# 编辑 ~/.condarc 添加镜像源`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Conda 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Conda 镜像源..."

# 生成配置文件
conda config --set show_channel_urls yes

# 创建配置文件
cat > ~/.condarc << 'EOF'
channels:
  - defaults
show_channel_urls: true
default_channels:
  - ${mirror.url}/anaconda/pkgs/main
  - ${mirror.url}/anaconda/pkgs/r
  - ${mirror.url}/anaconda/pkgs/msys2
custom_channels:
  conda-forge: ${mirror.url}/anaconda/cloud
  pytorch: ${mirror.url}/anaconda/cloud
EOF

echo "✓ 配置文件已创建"

# 清除缓存
conda clean -i

echo "\\n✅ Conda 镜像源已成功配置为 ${mirror.name}"
echo "验证配置: conda config --show channels"`;
            },
            generateConfigFile: function(mirror) {
                return `# Conda 配置文件 (.condarc)
# 由 镜像加速站 自动生成
# 放置位置: ~/.condarc

channels:
  - defaults
show_channel_urls: true
default_channels:
  - ${mirror.url}/anaconda/pkgs/main
  - ${mirror.url}/anaconda/pkgs/r
  - ${mirror.url}/anaconda/pkgs/msys2
custom_channels:
  conda-forge: ${mirror.url}/anaconda/cloud
  pytorch: ${mirror.url}/anaconda/cloud`;
            }
        },

        yarn: {
            name: "Yarn",
            fullName: "Yarn (快速的 Node.js 包管理器)",
            icon: "📦",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://registry.npmmirror.com",
                    testUrl: "https://registry.npmmirror.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/npm/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/npm/",
                    testUrl: "https://mirrors.huaweicloud.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/npm/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `yarn config set registry ${mirror.url}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Yarn 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Yarn 镜像源..."

# 设置镜像源
yarn config set registry ${mirror.url}

# 验证配置
echo "配置完成！当前镜像源："
yarn config get registry

echo "\\n✅ Yarn 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: yarn config delete registry"`;
            },
            generateConfigFile: function(mirror) {
                return `# Yarn 配置文件 (.yarnrc)
# 由 镜像加速站 自动生成
# 放置位置: ~/.yarnrc 或项目根目录

registry "${mirror.url}"`;
            }
        },

        pnpm: {
            name: "PNPM",
            fullName: "PNPM (高效的 Node.js 包管理器)",
            icon: "📦",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://registry.npmmirror.com",
                    testUrl: "https://registry.npmmirror.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/npm/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/npm/",
                    testUrl: "https://mirrors.huaweicloud.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/npm/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `pnpm config set registry ${mirror.url}`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# PNPM 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 PNPM 镜像源..."

# 设置镜像源
pnpm config set registry ${mirror.url}

# 验证配置
echo "配置完成！当前镜像源："
pnpm config get registry

echo "\\n✅ PNPM 镜像源已成功配置为 ${mirror.name}"
echo "如需恢复官方源，执行: pnpm config delete registry"`;
            },
            generateConfigFile: function(mirror) {
                return `# PNPM 配置文件 (.npmrc)
# 由 镜像加速站 自动生成
# 放置位置: ~/.npmrc 或项目根目录

registry=${mirror.url}`;
            }
        },

        cargo: {
            name: "Cargo",
            fullName: "Cargo (Rust 包管理器)",
            icon: "🦀",
            category: "language",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn/crates.io-index/",
                    testUrl: "https://mirrors.ustc.edu.cn"
                },
                sjtu: {
                    name: "上海交大",
                    url: "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index/",
                    testUrl: "https://mirrors.sjtug.sjtu.edu.cn"
                },
                rsproxy: {
                    name: "字节跳动",
                    url: "https://rsproxy.cn/crates.io-index",
                    testUrl: "https://rsproxy.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `# 编辑 ~/.cargo/config 或 ~/.cargo/config.toml
# 添加镜像源配置`;
            },
            generateScript: function(mirror, osVersion) {
                const configContent = mirror.name === "字节跳动"
                    ? `[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true`
                    : `[source.crates-io]
replace-with = 'mirror'

[source.mirror]
registry = "${mirror.url}"`;

                return `#!/bin/bash
# Cargo 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Cargo 镜像源..."

# 创建配置目录
mkdir -p ~/.cargo

# 备份原有配置
if [ -f ~/.cargo/config ]; then
    cp ~/.cargo/config ~/.cargo/config.backup.$(date +%Y%m%d)
    echo "✓ 原有配置已备份"
fi

# 写入配置
cat > ~/.cargo/config << 'EOF'
${configContent}
EOF

echo "✓ Cargo 镜像源配置已更新"
echo "\\n✅ Cargo 镜像源已成功配置为 ${mirror.name}"
echo "验证: cargo search serde"`;
            },
            generateConfigFile: function(mirror) {
                if (mirror.name === "字节跳动") {
                    return `# Cargo 配置文件 (config.toml)
# 由 镜像加速站 自动生成
# 放置位置: ~/.cargo/config.toml

[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true`;
                }
                return `# Cargo 配置文件 (config.toml)
# 由 镜像加速站 自动生成
# 放置位置: ~/.cargo/config.toml

[source.crates-io]
replace-with = 'mirror'

[source.mirror]
registry = "${mirror.url}"`;
            }
        },

        gradle: {
            name: "Gradle",
            fullName: "Gradle (Android/Java 构建工具)",
            icon: "🐘",
            category: "language",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://maven.aliyun.com/repository/public",
                    testUrl: "https://maven.aliyun.com"
                },
                tencent: {
                    name: "腾讯云",
                    url: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
                    testUrl: "https://mirrors.cloud.tencent.com"
                },
                huawei: {
                    name: "华为云",
                    url: "https://mirrors.huaweicloud.com/repository/maven/",
                    testUrl: "https://mirrors.huaweicloud.com"
                }
            },
            getManualCommands: function(mirror) {
                return `# 编辑 build.gradle 或 settings.gradle
# 添加镜像仓库配置`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Gradle 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Gradle 镜像源..."
echo "请手动编辑项目的 build.gradle 或 settings.gradle 文件"
echo ""
echo "在 allprojects { repositories { ... } } 中添加："
echo ""
echo "maven { url '${mirror.url}' }"
echo ""
echo "完整示例："
echo "allprojects {"
echo "    repositories {"
echo "        maven { url '${mirror.url}' }"
echo "        google()"
echo "        mavenCentral()"
echo "    }"
echo "}"
echo ""
echo "✅ 配置说明已显示，请按照上述内容修改 Gradle 配置文件"`;
            },
            generateConfigFile: function(mirror) {
                return `// Gradle 镜像配置 (build.gradle)
// 由 镜像加速站 自动生成
// 在项目的 build.gradle 中添加

allprojects {
    repositories {
        maven { url '${mirror.url}' }
        google()
        mavenCentral()
    }
}

// 或在 settings.gradle 中配置 (Gradle 6.8+)
dependencyResolutionManagement {
    repositories {
        maven { url '${mirror.url}' }
        google()
        mavenCentral()
    }
}`;
            }
        },

        flutter: {
            name: "Flutter",
            fullName: "Flutter (跨平台应用开发框架)",
            icon: "🐦",
            category: "other",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com",
                    testUrl: "https://mirrors.aliyun.com"
                },
                shanghai: {
                    name: "上海交大",
                    url: "https://mirror.sjtu.edu.cn",
                    testUrl: "https://mirror.sjtu.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `export PUB_HOSTED_URL="${mirror.url}/dart-pub"
export FLUTTER_STORAGE_BASE_URL="${mirror.url}/flutter"`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# Flutter 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 Flutter 镜像源..."

# 设置环境变量
export PUB_HOSTED_URL="${mirror.url}/dart-pub"
export FLUTTER_STORAGE_BASE_URL="${mirror.url}/flutter"

# 写入 shell 配置文件
SHELL_CONFIG=""
if [ -f ~/.zshrc ]; then
    SHELL_CONFIG=~/.zshrc
elif [ -f ~/.bash_profile ]; then
    SHELL_CONFIG=~/.bash_profile
elif [ -f ~/.bashrc ]; then
    SHELL_CONFIG=~/.bashrc
fi

if [ -n "$SHELL_CONFIG" ]; then
    echo "" >> $SHELL_CONFIG
    echo "# Flutter 镜像源 - ${mirror.name}" >> $SHELL_CONFIG
    echo 'export PUB_HOSTED_URL="${mirror.url}/dart-pub"' >> $SHELL_CONFIG
    echo 'export FLUTTER_STORAGE_BASE_URL="${mirror.url}/flutter"' >> $SHELL_CONFIG
    echo "✓ 已写入 $SHELL_CONFIG"
fi

echo "\\n✅ Flutter 镜像源已成功配置为 ${mirror.name}"
echo "重启终端或执行 source $SHELL_CONFIG 使配置生效"
echo "验证: flutter doctor"`;
            }
        },

        cpan: {
            name: "CPAN",
            fullName: "CPAN (Perl 包管理器)",
            icon: "🐪",
            category: "other",
            requiresOS: false,
            mirrors: {
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com/CPAN/",
                    testUrl: "https://mirrors.aliyun.com"
                },
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/CPAN/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn/CPAN/",
                    testUrl: "https://mirrors.ustc.edu.cn"
                }
            },
            getManualCommands: function(mirror) {
                return `# 方法1: 临时使用
cpan -M ${mirror.url}

# 方法2: 配置 CPAN
o conf urllist push ${mirror.url}
o conf commit`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# CPAN 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 CPAN 镜像源..."

# 创建 CPAN 配置目录
mkdir -p ~/.cpan/CPAN

# 配置镜像源
perl -MCPAN -e "
    CPAN::HandleConfig->load;
    CPAN::HandleConfig->edit('urllist', 'unshift', '${mirror.url}');
    CPAN::HandleConfig->commit;
"

echo "✓ CPAN 镜像源配置已更新"
echo "\\n✅ CPAN 镜像源已成功配置为 ${mirror.name}"
echo "验证: cpan -v"`;
            }
        },

        cran: {
            name: "CRAN",
            fullName: "CRAN (R 语言包管理器)",
            icon: "📊",
            category: "other",
            requiresOS: false,
            mirrors: {
                tsinghua: {
                    name: "清华大学",
                    url: "https://mirrors.tuna.tsinghua.edu.cn/CRAN/",
                    testUrl: "https://mirrors.tuna.tsinghua.edu.cn"
                },
                ustc: {
                    name: "中科大",
                    url: "https://mirrors.ustc.edu.cn/CRAN/",
                    testUrl: "https://mirrors.ustc.edu.cn"
                },
                aliyun: {
                    name: "阿里云",
                    url: "https://mirrors.aliyun.com/CRAN/",
                    testUrl: "https://mirrors.aliyun.com"
                }
            },
            getManualCommands: function(mirror) {
                return `# 在 R 中执行
options(repos=c(CRAN="${mirror.url}"))`;
            },
            generateScript: function(mirror, osVersion) {
                return `#!/bin/bash
# CRAN 镜像配置 - ${mirror.name}
# 由 镜像加速站 自动生成

echo "正在配置 CRAN 镜像源..."

# 创建 R 配置目录
mkdir -p ~/.R

# 写入配置文件
cat > ~/.Rprofile << 'EOF'
# CRAN 镜像源 - ${mirror.name}
options(repos=c(CRAN="${mirror.url}"))
EOF

echo "✓ CRAN 镜像源配置已更新"
echo "\\n✅ CRAN 镜像源已成功配置为 ${mirror.name}"
echo "验证: 在 R 中执行 getOption('repos')"`;
            },
            generateConfigFile: function(mirror) {
                return `# R 配置文件 (.Rprofile)
# 由 镜像加速站 自动生成
# 放置位置: ~/.Rprofile 或项目根目录

# CRAN 镜像源 - ${mirror.name}
options(repos=c(CRAN="${mirror.url}"))`;
            }
        }
    },

    // 工具函数：生成脚本文件名
    getScriptFileName: function(toolKey, mirrorKey, osVersion = null) {
        if (osVersion) {
            // 将版本号的点和横杠移除，如 ubuntu-22.04 -> ubuntu2204
            const cleanVersion = osVersion.replace(/[.-]/g, '');
            return `${toolKey}-${cleanVersion}-${mirrorKey}.sh`;
        }
        return `${toolKey}-${mirrorKey}.sh`;
    }
};

// 兼容旧版本代码
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mirrorConfig;
}
