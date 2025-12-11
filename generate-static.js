#!/usr/bin/env node

/**
 * 静态站点生成器 (Static Site Generator)
 * 将单页应用转换为多个静态HTML页面，CDN友好，SEO友好
 *
 * 生成的页面结构:
 * /index.html                              - 首页
 * /tutorials/index.html                    - 教程列表
 * /monitor/index.html                      - 监控页面
 * /about/index.html                        - 关于页面
 * /tools/npm/index.html                    - NPM工具页
 * /tools/npm/aliyun/index.html            - NPM+阿里云配置页
 * /tools/apt/ubuntu-22.04/aliyun/index.html - APT+Ubuntu22.04+阿里云
 */

const fs = require('fs');
const path = require('path');

// 导入配置
const mirrorConfig = require('./config.js');
const toolMetadata = require('./tool-metadata.js');

// 加载站点配置
function loadSiteConfig() {
    const configPath = path.join(__dirname, 'site-config.json');
    if (fs.existsSync(configPath)) {
        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.warn('⚠️  无法读取 site-config.json，使用默认配置');
            return null;
        }
    }
    return null;
}

const siteConfig = loadSiteConfig();

// 配置
const CONFIG = {
    siteUrl: siteConfig?.siteUrl || 'https://mirror.example.com',
    siteName: siteConfig?.siteName || '镜像加速站',
    outputDir: 'dist', // 输出目录
    templateFile: 'index.html' // 模板文件
};

// 确保输出目录存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 读取模板
function readTemplate() {
    const templatePath = path.join(__dirname, CONFIG.templateFile);
    return fs.readFileSync(templatePath, 'utf8');
}

// 生成面包屑HTML
function generateBreadcrumb(parts) {
    let html = '<div class="breadcrumb">';
    parts.forEach((part, index) => {
        if (index > 0) {
            html += '<span class="breadcrumb-separator">></span>';
        }
        const activeClass = index === parts.length - 1 ? ' active' : '';
        html += `<a href="${part.url}" class="breadcrumb-item${activeClass}">${part.label}</a>`;
    });
    html += '</div>';
    return html;
}

// 获取工具描述（用于SEO）
function getToolDescription(toolKey) {
    const descriptions = {
        npm: 'Node.js生态系统的包管理工具，用于安装和管理JavaScript依赖包，是前端开发和Node.js开发的必备工具',
        pip: 'Python的包管理工具，用于安装和管理Python库和依赖项，支持从PyPI仓库下载数万个Python包',
        maven: 'Java项目的构建管理和依赖管理工具，广泛应用于Java企业级应用开发，管理项目的构建生命周期',
        go: 'Go语言的模块管理工具，用于下载和管理Go语言项目的依赖包，支持版本控制和模块化开发',
        composer: 'PHP的依赖管理工具，用于管理PHP项目的库和依赖关系，是现代PHP开发的标准工具',
        rubygems: 'Ruby的包管理系统，用于分发和安装Ruby程序和库，是Ruby开发生态的核心组件',
        nuget: '.NET平台的包管理工具，用于创建、发布和使用.NET库，支持C#、VB.NET等多种.NET语言',
        conda: 'Python科学计算环境的包管理器，不仅管理Python包，还管理二进制依赖，广泛用于数据科学和机器学习领域',
        apt: 'Debian和Ubuntu系统的包管理工具，用于安装、更新和卸载软件包，是Linux系统管理的基础工具',
        yum: 'Red Hat、CentOS等系统的包管理工具，基于RPM包管理，提供自动依赖解析和软件包安装功能',
        homebrew: 'macOS和Linux的包管理工具，简化软件安装过程，提供数千个常用软件包的一键安装',
        docker: '容器化平台的镜像仓库，用于拉取和推送Docker容器镜像，是现代云原生应用部署的基础设施'
    };
    return descriptions[toolKey] || '开发者常用的包管理和构建工具';
}

// 修复CSS和JS路径（改为绝对路径）
function fixAssetPaths(html, depth) {
    // 修复CSS路径
    html = html.replace(
        /<link rel="stylesheet" href="style\.css">/g,
        '<link rel="stylesheet" href="/style.css">'
    );

    // 修复JS路径
    html = html.replace(
        /<script src="config\.js"><\/script>/g,
        '<script src="/config.js"></script>'
    );
    html = html.replace(
        /<script src="app\.js"><\/script>/g,
        '<script src="/app.js"></script>'
    );
    html = html.replace(
        /<script src="static-enhance\.js"><\/script>/g,
        '<script src="/static-enhance.js"></script>'
    );
    html = html.replace(
        /<script src="app-enhanced\.js"><\/script>/g,
        '<script src="/app-enhanced.js"></script>'
    );

    return html;
}

// 替换模板中的meta标签
function replaceMeta(html, meta) {
    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${meta.title}</title>`
    );
    html = html.replace(
        /<meta name="description" content=".*?">/,
        `<meta name="description" content="${meta.description}">`
    );
    html = html.replace(
        /<meta property="og:title" content=".*?">/,
        `<meta property="og:title" content="${meta.title}">`
    );
    html = html.replace(
        /<meta property="og:description" content=".*?">/,
        `<meta property="og:description" content="${meta.description}">`
    );
    html = html.replace(
        /<meta property="og:url" content=".*?">/,
        `<meta property="og:url" content="${meta.url}">`
    );
    html = html.replace(
        /<link rel="canonical" href=".*?">/,
        `<link rel="canonical" href="${meta.url}">`
    );

    // 添加结构化数据
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": meta.title,
        "description": meta.description,
        "url": meta.url
    };

    html = html.replace(
        '</head>',
        `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n</head>`
    );

    return html;
}

// 生成工具配置页面
function generateToolPage(toolKey, mirrorKey, osVersion = null) {
    const tool = mirrorConfig.tools[toolKey];
    const mirror = tool.mirrors[mirrorKey];

    // 确定URL路径
    let urlPath, outputPath;
    if (osVersion) {
        urlPath = `/tools/${toolKey}/${osVersion}/${mirrorKey}/`;
        outputPath = path.join(CONFIG.outputDir, 'tools', toolKey, osVersion, mirrorKey);
    } else {
        urlPath = `/tools/${toolKey}/${mirrorKey}/`;
        outputPath = path.join(CONFIG.outputDir, 'tools', toolKey, mirrorKey);
    }

    ensureDir(outputPath);

    // 生成meta信息
    const osInfo = osVersion ? ` (${tool.osVersions[osVersion]})` : '';
    const meta = {
        title: `${tool.fullName} ${mirror.name}镜像配置${osInfo} - ${CONFIG.siteName}`,
        description: `一键配置${tool.fullName}的${mirror.name}国内镜像源${osInfo}，复制命令即可使用，提升下载速度10倍以上。`,
        url: CONFIG.siteUrl + urlPath
    };

    // 生成脚本内容
    const script = tool.generateScript(mirror, osVersion);
    const manualCommands = tool.getManualCommands(mirror, osVersion);
    const scriptFileName = mirrorConfig.getScriptFileName(toolKey, mirrorKey, osVersion);

    // 生成HTML内容
    let html = readTemplate();
    html = replaceMeta(html, meta);

    // 生成完整页面内容
    const breadcrumb = generateBreadcrumb([
        { label: '首页', url: '/' },
        { label: '工具中心', url: '/tools/' },
        { label: tool.name, url: `/tools/${toolKey}/` },
        { label: mirror.name, url: urlPath }
    ]);

    const pageContent = `
    <div class="container" style="max-width: 1200px; margin: 80px auto; padding: 20px;">
        ${breadcrumb}

        <h1 style="margin-top: 30px;">${tool.icon} ${tool.fullName} - ${mirror.name}镜像配置</h1>
        ${osInfo ? `<p class="subtitle">系统版本: ${tool.osVersions[osVersion]}</p>` : ''}

        <div class="tabs-nav" style="margin-top: 40px;">
            <button class="tab-btn active" data-tab="oneclick">🚀 一键脚本 <span class="tab-badge">推荐</span></button>
            <button class="tab-btn" data-tab="manual">📝 手动配置</button>
            <button class="tab-btn" data-tab="script">💾 脚本内容</button>
        </div>

        <div class="tabs-content">
            <!-- 一键脚本 -->
            <div class="tab-panel active" data-panel="oneclick">
                <p class="tab-desc">复制以下命令到终端执行即可完成配置：</p>
                <div class="code-box">
                    <code id="oneClickCommand">curl -sSL ${CONFIG.siteUrl}/scripts/${scriptFileName} | bash</code>
                    <button class="btn-copy" onclick="copyToClipboard('oneClickCommand')">📋</button>
                </div>
                <div class="result-note">
                    ✅ 所有脚本开源透明，可在下方查看完整内容
                </div>
            </div>

            <!-- 手动配置 -->
            <div class="tab-panel" data-panel="manual">
                <p class="tab-desc">适合想了解具体步骤的用户：</p>
                <pre><code>${escapeHtml(manualCommands)}</code></pre>
            </div>

            <!-- 脚本内容 -->
            <div class="tab-panel" data-panel="script">
                <p class="tab-desc">完整脚本内容（可复制保存）：</p>
                <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto;"><code>${escapeHtml(script)}</code></pre>
                <a href="/scripts/${scriptFileName}" download class="btn-primary" style="margin-top: 20px;">⬇️ 下载脚本文件</a>
            </div>
        </div>

        <div class="result-tips" style="margin-top: 40px;">
            <h4>💡 使用提示</h4>
            <ul>
                <li>配置后请重启终端或运行 <code>source ~/.bashrc</code></li>
                <li>如遇问题可访问 <a href="/tutorials/">教程中心</a> 查看详细指南</li>
                <li>建议定期测速选择最优镜像源</li>
            </ul>
        </div>

        <div style="margin-top: 50px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <a href="/tools/${toolKey}/" class="btn-secondary">← 返回选择其他镜像源</a>
            <a href="/" class="btn-secondary">🏠 返回首页</a>
        </div>
    </div>

    <script>
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('[data-panel="' + tab + '"]').classList.add('active');
        });
    });

    // 复制功能（增强版）
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('未找到元素:', elementId);
            return;
        }

        const text = element.innerText || element.textContent;
        const button = event.target;
        const originalText = button.textContent;

        // 尝试使用现代 API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess(button, originalText);
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopy(text, button, originalText);
            });
        } else {
            // 降级方案
            fallbackCopy(text, button, originalText);
        }
    }

    // 降级复制方案
    function fallbackCopy(text, button, originalText) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (successful) {
                showCopySuccess(button, originalText);
            } else {
                showCopyError(button, originalText);
            }
        } catch (err) {
            console.error('降级复制失败:', err);
            showCopyError(button, originalText);
        }
    }

    // 显示复制成功
    function showCopySuccess(button, originalText) {
        button.textContent = '✅';
        button.style.background = '#10b981';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }

    // 显示复制失败
    function showCopyError(button, originalText) {
        button.textContent = '❌';
        setTimeout(() => {
            button.textContent = originalText;
            alert('复制失败，请手动选择文本复制');
        }, 1000);
    }
    </script>
    `;

    // 替换模板中的main-content部分
    html = html.replace(
        /<main class="main-content">[\s\S]*?<\/main>/,
        `<main class="main-content">${pageContent}</main>`
    );

    // 修复CSS和JS路径（使用绝对路径）
    const depth = osVersion ? 3 : 2; // /tools/npm/aliyun/ = 3级, /tools/npm/ = 2级
    html = fixAssetPaths(html, depth);

    // 注入站点配置（页脚、统计等）
    html = injectSiteConfig(html);

    // 写入文件
    const htmlPath = path.join(outputPath, 'index.html');
    fs.writeFileSync(htmlPath, html, 'utf8');

    return urlPath;
}

// HTML转义
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 生成页脚HTML
function generateFooter() {
    if (!siteConfig) {
        return ''; // 如果没有配置，保持原有页脚
    }

    const currentYear = new Date().getFullYear();

    // 生成完整页脚（包括链接区域）
    let footerHTML = '<div class="footer-content">\n';

    // 快速链接
    if (siteConfig.footerLinks && siteConfig.footerLinks.quickLinks) {
        footerHTML += '    <div class="footer-section">\n';
        footerHTML += '        <h4>快速链接</h4>\n';
        Object.values(siteConfig.footerLinks.quickLinks).forEach(link => {
            footerHTML += `        <a href="${link.url}">${link.label}</a>\n`;
        });
        footerHTML += '    </div>\n';
    }

    // 支持的镜像源
    if (siteConfig.footerLinks && siteConfig.footerLinks.mirrors) {
        footerHTML += '    <div class="footer-section">\n';
        footerHTML += '        <h4>支持的镜像源</h4>\n';
        Object.values(siteConfig.footerLinks.mirrors).forEach(link => {
            footerHTML += `        <a href="${link.url}" target="_blank">${link.label}</a>\n`;
        });
        footerHTML += '    </div>\n';
    }

    // 关于我们
    if (siteConfig.footerLinks && siteConfig.footerLinks.about) {
        footerHTML += '    <div class="footer-section">\n';
        footerHTML += '        <h4>关于我们</h4>\n';
        Object.values(siteConfig.footerLinks.about).forEach(link => {
            footerHTML += `        <a href="${link.url}" target="_blank">${link.label}</a>\n`;
        });
        footerHTML += '    </div>\n';
    }

    footerHTML += '</div>\n';

    // 页脚底部
    footerHTML += '<div class="footer-bottom">\n';
    footerHTML += `    <p>© ${currentYear} ${siteConfig.siteName}`;

    if (siteConfig.footerText) {
        footerHTML += ` · ${siteConfig.footerText}`;
    }

    if (siteConfig.icpNumber) {
        footerHTML += ` · <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow" style="color: rgba(255,255,255,0.7);">${siteConfig.icpNumber}</a>`;
    }

    if (siteConfig.contactGithub) {
        footerHTML += ` · <a href="${siteConfig.contactGithub}" target="_blank" style="color: rgba(255,255,255,0.7);">开源免费</a>`;
    }

    if (siteConfig.contactEmail) {
        footerHTML += ` · <a href="mailto:${siteConfig.contactEmail}" style="color: rgba(255,255,255,0.7);">联系我们</a>`;
    }

    footerHTML += '</p>\n</div>';

    return footerHTML;
}

// 注入站点配置到HTML
function injectSiteConfig(html, isHomePage = false) {
    if (!siteConfig) {
        return html;
    }

    // 替换整个页脚区域
    const customFooter = generateFooter();
    if (customFooter) {
        // 替换从 footer-content 到 footer-bottom 的整个区域
        html = html.replace(
            /<div class="footer-content">[\s\S]*?<div class="footer-bottom">[\s\S]*?<\/div>/,
            customFooter
        );
    }

    // 注入 Google Analytics（如果启用）
    if (siteConfig.enableAnalytics && siteConfig.analyticsId) {
        const analyticsScript = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${siteConfig.analyticsId}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${siteConfig.analyticsId}');
    </script>
`;
        html = html.replace('</head>', `${analyticsScript}</head>`);
    }

    return html;
}

// 生成工具列表页
function generateToolListPage(toolKey) {
    const tool = mirrorConfig.tools[toolKey];
    const urlPath = `/tools/${toolKey}/`;
    const outputPath = path.join(CONFIG.outputDir, 'tools', toolKey);

    ensureDir(outputPath);

    const meta = {
        title: `${tool.fullName}镜像源配置 - ${CONFIG.siteName}`,
        description: `选择${tool.fullName}的国内镜像源，支持阿里云、腾讯云、清华大学等多个镜像站，一键配置。`,
        url: CONFIG.siteUrl + urlPath
    };

    // 生成镜像源卡片（带测速功能）
    let mirrorCards = '';
    Object.keys(tool.mirrors).forEach(mirrorKey => {
        const mirror = tool.mirrors[mirrorKey];
        const mirrorUrl = tool.requiresOS
            ? '#' // 需要选择系统版本
            : `/tools/${toolKey}/${mirrorKey}/`;

        // 数据属性用于测速
        const dataAttrs = `data-tool="${toolKey}" data-mirror="${mirrorKey}" data-url="${mirror.url}"`;

        mirrorCards += `
        <div class="mirror-card" ${dataAttrs} onclick="location.href='${mirrorUrl}'">
            <h3>${mirror.name}</h3>
            <div class="mirror-latency" data-latency-for="${toolKey}-${mirrorKey}">
                <span class="latency-text"></span>
            </div>
            ${mirror.note ? `<div class="note">⚠️ ${mirror.note}</div>` : ''}
        </div>`;
    });

    // 如果需要系统版本，生成版本选择
    let osVersionSection = '';
    if (tool.requiresOS && tool.osVersions) {
        osVersionSection = '<h2 style="margin-top: 40px;">选择系统版本</h2><div class="os-grid">';
        Object.keys(tool.osVersions).forEach(osKey => {
            osVersionSection += `
            <div class="os-card">
                <h3>${tool.osVersions[osKey]}</h3>
                <div class="mirror-list">`;

            Object.keys(tool.mirrors).forEach(mirrorKey => {
                const mirror = tool.mirrors[mirrorKey];
                osVersionSection += `
                    <a href="/tools/${toolKey}/${osKey}/${mirrorKey}/" class="mirror-link">
                        ${mirror.name}
                    </a>`;
            });

            osVersionSection += `</div></div>`;
        });
        osVersionSection += '</div>';
    }

    // 获取工具元数据
    const metadata = toolMetadata[toolKey] || {};

    // 生成工具信息区域
    const toolInfoSection = `
        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-top: 30px;">
            <h2 style="font-size: 24px; margin-bottom: 16px; color: #1a1a1a;">📖 工具介绍</h2>
            <p style="font-size: 15px; line-height: 1.8; color: #333; margin-bottom: 24px;">
                ${metadata.description || getToolDescription(toolKey)}
            </p>

            ${metadata.officialSite || metadata.documentation || metadata.platforms ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                ${metadata.officialSite ? `
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 6px;">官方网站</div>
                    <a href="${metadata.officialSite}" target="_blank" rel="noopener" style="color: #2563eb; text-decoration: none; font-size: 14px; word-break: break-all;">
                        ${metadata.officialSite.replace('https://', '').replace('http://', '')} →
                    </a>
                </div>` : ''}

                ${metadata.documentation ? `
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 6px;">官方文档</div>
                    <a href="${metadata.documentation}" target="_blank" rel="noopener" style="color: #2563eb; text-decoration: none; font-size: 14px; word-break: break-all;">
                        ${metadata.documentation.replace('https://', '').replace('http://', '')} →
                    </a>
                </div>` : ''}

                ${metadata.platforms ? `
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 6px;">支持平台</div>
                    <div style="font-size: 14px; color: #333;">
                        ${metadata.platforms.join(' · ')}
                    </div>
                </div>` : ''}
            </div>` : ''}
        </div>`;

    const pageContent = `
    <div class="container" style="max-width: 1200px; margin: 40px auto 80px; padding: 20px;">
        ${generateBreadcrumb([
            { label: '首页', url: '/' },
            { label: '工具中心', url: '/tools/' },
            { label: tool.name, url: urlPath }
        ])}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
            <div style="flex: 1;">
                <h1 style="margin: 0;">${tool.icon} ${tool.fullName}</h1>
                <p style="font-size: 16px; color: #666; margin-top: 8px; margin-bottom: 0;">
                    快速配置国内镜像源，提升下载速度
                </p>
            </div>
            <button class="btn-speed-test" onclick="testCurrentToolSpeed('${toolKey}')" style="margin-left: 20px;">
                ⚡ 一键测速
            </button>
        </div>

        ${!tool.requiresOS ? `
        <div style="margin-top: 40px;">
            <h2 style="font-size: 24px; margin-bottom: 20px; color: #1a1a1a;">🎯 请选择镜像源</h2>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">点击卡片查看配置方法，系统会自动测速并标记最快的镜像源</p>
            <div class="mirror-grid">
                ${mirrorCards}
            </div>
        </div>
        ` : `
        <div style="margin-top: 40px;">
            <h2 style="font-size: 24px; margin-bottom: 20px; color: #1a1a1a;">🎯 请选择系统版本</h2>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">先选择您的操作系统版本，然后选择镜像源</p>
            ${osVersionSection}
        </div>
        `}

        ${toolInfoSection}
    </div>

    <script>
    // 页面加载后自动测速
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            testCurrentToolSpeed('${toolKey}');
        }, 500);
    });

    // 当前工具页面的测速功能
    function testCurrentToolSpeed(toolKey) {
        const btn = document.querySelector('.btn-speed-test');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ 测速中...';
        }

        const cards = document.querySelectorAll('.mirror-card[data-tool="' + toolKey + '"]');
        let completed = 0;
        const total = cards.length;

        cards.forEach(card => {
            const mirrorUrl = card.getAttribute('data-url');
            const mirrorKey = card.getAttribute('data-mirror');
            const latencyEl = card.querySelector('.mirror-latency');

            // 显示测速中状态
            latencyEl.innerHTML = '<span class="latency-text" style="color: #f59e0b;">⏳ 测速中...</span>';

            // 执行测速
            const startTime = Date.now();
            const img = new Image();
            const timeout = setTimeout(() => {
                completed++;
                latencyEl.innerHTML = '<span class="latency-text" style="color: #999;">超时</span>';
                checkComplete();
            }, 5000);

            img.onload = img.onerror = () => {
                clearTimeout(timeout);
                const latency = Date.now() - startTime;
                completed++;

                if (latency < 5000) {
                    const color = latency < 200 ? '#10b981' : latency < 500 ? '#f59e0b' : '#666';
                    latencyEl.innerHTML = '<span class="latency-text fast" style="color: ' + color + ';">⚡ ' + latency + 'ms</span>';
                    card.setAttribute('data-latency', latency);
                }

                checkComplete();
            };

            // 尝试访问镜像源
            img.src = mirrorUrl.replace(/\\/$/, '') + '/favicon.ico?' + Date.now();
        });

        function checkComplete() {
            if (completed === total) {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = '✅ 测速完成';
                    setTimeout(() => {
                        btn.textContent = '⚡ 重新测速';
                    }, 2000);
                }

                // 标记最快的镜像
                const cardsArray = Array.from(cards);
                const validCards = cardsArray.filter(c => c.hasAttribute('data-latency'));
                if (validCards.length > 0) {
                    validCards.sort((a, b) =>
                        parseInt(a.getAttribute('data-latency')) - parseInt(b.getAttribute('data-latency'))
                    );
                    validCards[0].classList.add('fastest');
                }
            }
        }
    }
    </script>`;

    let html = readTemplate();
    html = replaceMeta(html, meta);
    html = html.replace(
        /<main class="main-content">[\s\S]*?<\/main>/,
        `<main class="main-content">${pageContent}</main>`
    );

    // 修复CSS和JS路径（使用绝对路径）
    const depth = 1; // /tools/npm/ = 1级
    html = fixAssetPaths(html, depth);

    // 注入站点配置（页脚、统计等）
    html = injectSiteConfig(html);

    fs.writeFileSync(path.join(outputPath, 'index.html'), html, 'utf8');
    return urlPath;
}

// 生成工具总览页 /tools/index.html
function generateToolsOverviewPage() {
    const urlPath = '/tools/';
    const outputPath = path.join(CONFIG.outputDir, 'tools');

    ensureDir(outputPath);

    const meta = {
        title: `开发工具镜像源配置中心 - ${CONFIG.siteName}`,
        description: `提供19个常用开发工具的国内镜像源配置，包括NPM、PIP、Maven、Docker等，支持阿里云、腾讯云、清华大学等多个镜像站，一键配置，提升下载速度10倍以上。`,
        url: CONFIG.siteUrl + urlPath
    };

    // 统计信息
    let totalTools = 0;
    let totalMirrors = 0;
    let totalScripts = 0;

    Object.keys(mirrorConfig.tools).forEach(toolKey => {
        const tool = mirrorConfig.tools[toolKey];
        totalTools++;
        totalMirrors += Object.keys(tool.mirrors).length;

        // 计算脚本数量
        if (tool.requiresOS && tool.osVersions) {
            totalScripts += Object.keys(tool.mirrors).length * Object.keys(tool.osVersions).length;
        } else {
            totalScripts += Object.keys(tool.mirrors).length;
        }
    });

    // 按分类生成工具卡片
    const categoryHTML = Object.keys(mirrorConfig.categories).map(catKey => {
        const category = mirrorConfig.categories[catKey];
        const categoryTools = category.tools.map(toolKey => {
            const tool = mirrorConfig.tools[toolKey];
            const metadata = toolMetadata[toolKey] || {};
            const mirrorCount = Object.keys(tool.mirrors).length;

            return `
            <a href="/tools/${toolKey}/" class="tool-overview-card">
                <div style="display: flex; align-items: start; gap: 16px;">
                    <div style="font-size: 48px; line-height: 1;">${tool.icon}</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 20px; margin: 0 0 8px 0; color: #1a1a1a;">${tool.fullName}</h3>
                        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0; line-height: 1.6;">
                            ${(metadata.description || '').substring(0, 120)}...
                        </p>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <span style="font-size: 13px; color: #666;">
                                <strong style="color: #2563eb;">${mirrorCount}</strong> 个镜像源
                            </span>
                            ${metadata.platforms ? `
                            <span style="font-size: 13px; color: #666;">
                                支持: ${metadata.platforms.slice(0, 2).join(', ')}${metadata.platforms.length > 2 ? '...' : ''}
                            </span>` : ''}
                        </div>
                    </div>
                    <div style="font-size: 24px; color: #cbd5e1;">→</div>
                </div>
            </a>`;
        }).join('');

        return `
        <div style="margin-bottom: 48px;">
            <h2 style="font-size: 28px; margin-bottom: 20px; color: #1a1a1a; display: flex; align-items: center; gap: 8px;">
                <span>${getCategoryIcon(catKey)}</span>
                <span>${category.name}</span>
                <span style="font-size: 16px; color: #999; font-weight: normal;">(${category.tools.length})</span>
            </h2>
            <div style="display: grid; gap: 16px;">
                ${categoryTools}
            </div>
        </div>`;
    }).join('');

    const pageContent = `
    <div class="container" style="max-width: 1200px; margin: 40px auto 80px; padding: 20px;">
        ${generateBreadcrumb([
            { label: '首页', url: '/' },
            { label: '工具中心', url: urlPath }
        ])}

        <div style="text-align: center; margin: 40px 0 50px;">
            <h1 style="font-size: 42px; margin-bottom: 16px; color: #1a1a1a;">🛠️ 开发工具镜像配置中心</h1>
            <p style="font-size: 18px; color: #666; max-width: 700px; margin: 0 auto 32px;">
                一站式解决所有开发工具的镜像配置问题，让软件包下载快如闪电
            </p>

            <!-- 统计信息 -->
            <div style="display: flex; justify-content: center; gap: 40px; margin-top: 32px;">
                <div>
                    <div style="font-size: 36px; font-weight: 700; color: #2563eb;">${totalTools}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 4px;">开发工具</div>
                </div>
                <div>
                    <div style="font-size: 36px; font-weight: 700; color: #10b981;">${totalMirrors}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 4px;">镜像源</div>
                </div>
                <div>
                    <div style="font-size: 36px; font-weight: 700; color: #f59e0b;">${totalScripts}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 4px;">配置脚本</div>
                </div>
            </div>
        </div>

        <!-- 搜索框 -->
        <div style="max-width: 600px; margin: 0 auto 50px;">
            <input
                type="text"
                id="toolSearchInput"
                placeholder="🔍 搜索工具名称或关键词..."
                style="width: 100%; padding: 14px 20px; font-size: 16px; border: 2px solid #e5e7eb; border-radius: 12px; outline: none; transition: border-color 0.3s;"
                onfocus="this.style.borderColor='#2563eb'"
                onblur="this.style.borderColor='#e5e7eb'"
                oninput="filterTools(this.value)"
            >
        </div>

        <!-- 工具分类列表 -->
        <div id="toolsContainer">
            ${categoryHTML}
        </div>

        <!-- 无结果提示 -->
        <div id="noResults" style="display: none; text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
            <p style="font-size: 18px; color: #666;">未找到匹配的工具</p>
        </div>
    </div>

    <style>
    .tool-overview-card {
        display: block;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        text-decoration: none;
        transition: all 0.3s;
    }

    .tool-overview-card:hover {
        border-color: #2563eb;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        transform: translateY(-2px);
    }
    </style>

    <script>
    // 工具搜索过滤功能
    function filterTools(query) {
        const searchQuery = query.toLowerCase().trim();
        const toolCards = document.querySelectorAll('.tool-overview-card');
        const categories = document.querySelectorAll('#toolsContainer > div');
        let visibleCount = 0;

        toolCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(searchQuery)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 隐藏空分类
        categories.forEach(category => {
            const visibleCards = category.querySelectorAll('.tool-overview-card[style*="display: block"]').length;
            category.style.display = visibleCards > 0 ? 'block' : 'none';
        });

        // 显示/隐藏无结果提示
        document.getElementById('noResults').style.display = visibleCount === 0 ? 'block' : 'none';
    }
    </script>`;

    let html = readTemplate();
    html = replaceMeta(html, meta);
    html = html.replace(
        /<main class="main-content">[\s\S]*?<\/main>/,
        `<main class="main-content">${pageContent}</main>`
    );

    // 修复CSS和JS路径
    const depth = 0; // /tools/ = 0级
    html = fixAssetPaths(html, depth);

    // 注入站点配置
    html = injectSiteConfig(html);

    fs.writeFileSync(path.join(outputPath, 'index.html'), html, 'utf8');
    console.log('✅ 工具总览页生成成功: /tools/');
    return urlPath;
}

// 获取分类图标
function getCategoryIcon(catKey) {
    const icons = {
        system: '🖥️',
        language: '📝',
        container: '📦',
        other: '🔧'
    };
    return icons[catKey] || '📂';
}

// 主函数
function generateStaticSite() {
    console.log('🚀 开始生成静态站点...\n');

    const startTime = Date.now();
    let pageCount = 0;

    // 1. 复制并处理原始 index.html 到 dist/
    ensureDir(CONFIG.outputDir);

    // 读取首页，注入站点配置
    let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    indexHtml = injectSiteConfig(indexHtml, true); // 首页保留搜索框
    fs.writeFileSync(
        path.join(CONFIG.outputDir, 'index.html'),
        indexHtml,
        'utf8'
    );
    pageCount++;

    // 2. 复制静态资源
    ['style.css', 'app.js', 'config.js', 'static-enhance.js'].forEach(file => {
        if (fs.existsSync(path.join(__dirname, file))) {
            fs.copyFileSync(
                path.join(__dirname, file),
                path.join(CONFIG.outputDir, file)
            );
        }
    });

    // 3. 复制 scripts 目录
    const scriptsDir = path.join(__dirname, 'scripts');
    const distScriptsDir = path.join(CONFIG.outputDir, 'scripts');
    if (fs.existsSync(scriptsDir)) {
        ensureDir(distScriptsDir);
        fs.readdirSync(scriptsDir).forEach(file => {
            // 跳过index.html，后面单独处理
            if (file === 'index.html') return;

            fs.copyFileSync(
                path.join(scriptsDir, file),
                path.join(distScriptsDir, file)
            );
        });
    }

    // 4. 复制并注入站点配置到页面框架
    console.log('📄 处理页面框架...');
    const frameworkPages = ['guides', 'scripts', 'about'];
    frameworkPages.forEach(page => {
        const sourceFile = path.join(__dirname, page, 'index.html');
        if (fs.existsSync(sourceFile)) {
            const targetDir = path.join(CONFIG.outputDir, page);
            ensureDir(targetDir);

            let html = fs.readFileSync(sourceFile, 'utf8');
            html = injectSiteConfig(html); // 注入站点配置

            fs.writeFileSync(
                path.join(targetDir, 'index.html'),
                html,
                'utf8'
            );
            pageCount++;
            console.log(`   ↳ ${page}/index.html`);
        }
    });

    // 5. 生成工具总览页 /tools/index.html
    console.log('📄 生成工具总览页...');
    generateToolsOverviewPage();
    pageCount++;

    // 6. 生成每个工具的页面
    Object.keys(mirrorConfig.tools).forEach(toolKey => {
        const tool = mirrorConfig.tools[toolKey];

        // 生成工具列表页
        console.log(`📄 生成工具页: ${toolKey}`);
        generateToolListPage(toolKey);
        pageCount++;

        // 生成每个镜像源的配置页
        Object.keys(tool.mirrors).forEach(mirrorKey => {
            if (tool.requiresOS && tool.osVersions) {
                // 需要系统版本
                Object.keys(tool.osVersions).forEach(osVersion => {
                    console.log(`   ↳ ${toolKey}/${osVersion}/${mirrorKey}`);
                    generateToolPage(toolKey, mirrorKey, osVersion);
                    pageCount++;
                });
            } else {
                // 不需要系统版本
                console.log(`   ↳ ${toolKey}/${mirrorKey}`);
                generateToolPage(toolKey, mirrorKey);
                pageCount++;
            }
        });
    });

    // 5. 复制 robots.txt 和生成 sitemap
    if (fs.existsSync('robots.txt')) {
        fs.copyFileSync('robots.txt', path.join(CONFIG.outputDir, 'robots.txt'));
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ 静态站点生成完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 生成页面: ${pageCount} 个`);
    console.log(`   - 耗时: ${elapsed} 秒`);
    console.log(`   - 输出目录: ${path.resolve(CONFIG.outputDir)}`);
    console.log('\n💡 下一步:');
    console.log(`   1. 修改脚本中的 siteUrl 为你的实际域名`);
    console.log(`   2. 运行: node generate-sitemap.js (生成sitemap.xml)`);
    console.log(`   3. 将 dist/ 目录部署到你的服务器或CDN`);
    console.log(`   4. 推荐部署平台: Cloudflare Pages, Vercel, Netlify`);
}

// 执行
try {
    generateStaticSite();
} catch (error) {
    console.error('❌ 生成失败:', error);
    console.error(error.stack);
    process.exit(1);
}
