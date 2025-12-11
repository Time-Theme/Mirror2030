#!/usr/bin/env node

/**
 * 智能部署配置工具
 * 交互式收集站点配置信息，生成配置文件
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, 'site-config.json');

// 默认配置
const DEFAULT_CONFIG = {
    siteUrl: 'https://mirror.example.com',
    siteName: '镜像加速站',
    icpNumber: '',
    contactEmail: '',
    contactGithub: '',
    footerText: '',
    enableAnalytics: false,
    analyticsId: ''
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function loadExistingConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    }
    return DEFAULT_CONFIG;
}

async function setup() {
    log('\n========================================', 'bright');
    log('   🚀 镜像加速站 - 智能部署配置', 'bright');
    log('========================================\n', 'bright');

    const existingConfig = await loadExistingConfig();
    const hasExisting = fs.existsSync(CONFIG_FILE);

    if (hasExisting) {
        log('✅ 检测到现有配置文件\n', 'green');
        log('当前配置:', 'yellow');
        console.log(JSON.stringify(existingConfig, null, 2));
        console.log();

        const useExisting = await question('是否使用现有配置? (y/n，默认 n): ');
        if (useExisting.toLowerCase() === 'y') {
            log('\n✅ 使用现有配置', 'green');
            rl.close();
            return;
        }
    }

    log('请输入以下配置信息（按回车使用默认值）\n', 'blue');

    // 1. 站点域名
    const siteUrl = await question(`网站域名 (默认: ${existingConfig.siteUrl}): `)
        || existingConfig.siteUrl;

    // 2. 站点名称
    const siteName = await question(`站点名称 (默认: ${existingConfig.siteName}): `)
        || existingConfig.siteName;

    // 3. ICP备案号
    log('\n💡 提示: ICP备案号格式如: 京ICP备12345678号-1', 'yellow');
    const icpNumber = await question(`ICP备案号 (默认: ${existingConfig.icpNumber || '无'}): `)
        || existingConfig.icpNumber;

    // 4. 联系邮箱
    const contactEmail = await question(`联系邮箱 (默认: ${existingConfig.contactEmail || '无'}): `)
        || existingConfig.contactEmail;

    // 5. GitHub仓库
    const contactGithub = await question(`GitHub仓库地址 (默认: ${existingConfig.contactGithub || 'https://github.com/your-repo/mirror-site'}): `)
        || existingConfig.contactGithub || 'https://github.com/your-repo/mirror-site';

    // 6. 页脚自定义文本
    log('\n💡 提示: 页脚文本会显示在每个页面底部', 'yellow');
    const footerText = await question(`自定义页脚文本 (默认: ${existingConfig.footerText || '让下载快如闪电'}): `)
        || existingConfig.footerText || '让下载快如闪电';

    // 7. 页脚链接配置
    log('\n💡 页脚链接配置（直接回车使用默认值）', 'yellow');

    // 快速链接
    log('\n📌 快速链接:', 'blue');
    const footerQuickLinks = {
        home: { label: '镜像中心', url: '/index.html' },
        guides: { label: '新手指南', url: '/guides/index.html' },
        scripts: { label: '一键脚本', url: '/scripts/index.html' }
    };

    // 支持的镜像源
    log('\n📌 支持的镜像源:', 'blue');
    const footerMirrors = {
        aliyun: { label: '阿里云', url: 'https://developer.aliyun.com/mirror/' },
        tencent: { label: '腾讯云', url: 'https://mirrors.cloud.tencent.com/' },
        huawei: { label: '华为云', url: 'https://mirrors.huaweicloud.com/' },
        tsinghua: { label: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/' }
    };

    // 关于我们
    log('\n📌 关于我们:', 'blue');
    const footerAbout = {
        intro: { label: '项目简介', url: '/about/index.html' },
        feedback: { label: '反馈建议', url: contactGithub + '/issues' },
        github: { label: 'GitHub', url: contactGithub }
    };

    // 8. 是否启用统计
    const enableAnalytics = await question(`\n是否启用网站统计? (y/n，默认 n): `);
    const analyticsEnabled = enableAnalytics.toLowerCase() === 'y';

    let analyticsId = '';
    if (analyticsEnabled) {
        analyticsId = await question(`Google Analytics ID (格式: G-XXXXXXXXXX): `) || '';
    }

    // 生成配置对象
    const config = {
        siteUrl: siteUrl.replace(/\/$/, ''), // 移除末尾斜杠
        siteName,
        icpNumber,
        contactEmail,
        contactGithub,
        footerText,
        footerLinks: {
            quickLinks: footerQuickLinks,
            mirrors: footerMirrors,
            about: footerAbout
        },
        enableAnalytics: analyticsEnabled,
        analyticsId,
        generatedAt: new Date().toISOString()
    };

    // 保存配置
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

        log('\n========================================', 'green');
        log('   ✅ 配置已保存成功！', 'green');
        log('========================================\n', 'green');

        log('📄 配置文件位置:', 'blue');
        log(`   ${CONFIG_FILE}\n`, 'cyan');

        log('📋 配置内容:', 'blue');
        console.log(JSON.stringify(config, null, 2));

        log('\n📌 下一步:', 'yellow');
        log('   1. 运行 npm run build 生成静态站点', 'cyan');
        log('   2. 所有页面将自动包含以上配置信息', 'cyan');
        log('   3. 如需修改，重新运行 npm run setup\n', 'cyan');

    } catch (error) {
        log(`\n❌ 保存配置失败: ${error.message}`, 'red');
        process.exit(1);
    }

    rl.close();
}

// 执行配置
setup().catch(error => {
    console.error('❌ 配置过程出错:', error);
    process.exit(1);
});
