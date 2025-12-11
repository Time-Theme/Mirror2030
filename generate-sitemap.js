#!/usr/bin/env node

/**
 * 一键生成 sitemap.xml
 * 自动扫描所有工具、镜像源、系统版本组合，生成完整的URL列表
 */

const fs = require('fs');
const path = require('path');

// 导入配置
const mirrorConfig = require('./config.js');

// 配置你的域名
const SITE_URL = 'https://mirror2030.com'; // 修改为你的实际域名
const OUTPUT_FILE = 'sitemap.xml';

// 生成当前日期 (ISO格式)
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// 生成 sitemap.xml
function generateSitemap() {
    console.log('🚀 开始生成 sitemap.xml...\n');

    const urls = [];

    // 1. 首页
    urls.push({
        loc: SITE_URL + '/',
        lastmod: getCurrentDate(),
        changefreq: 'daily',
        priority: '1.0'
    });

    // 2. 主要页面
    const mainPages = [
        { path: '/#tutorials', priority: '0.9', changefreq: 'weekly' },
        { path: '/#monitor', priority: '0.8', changefreq: 'daily' },
        { path: '/#about', priority: '0.7', changefreq: 'monthly' }
    ];

    mainPages.forEach(page => {
        urls.push({
            loc: SITE_URL + page.path,
            lastmod: getCurrentDate(),
            changefreq: page.changefreq,
            priority: page.priority
        });
    });

    // 2.5 教程页面
    const tutorials = [
        { path: '/tutorials/npm.html', title: 'NPM镜像配置教程' },
        { path: '/tutorials/pip.html', title: 'PIP镜像配置教程' },
        { path: '/tutorials/docker.html', title: 'Docker镜像配置教程' },
        { path: '/tutorials/apt.html', title: 'APT镜像配置教程' },
        { path: '/tutorials/maven.html', title: 'Maven镜像配置教程' },
        { path: '/tutorials/go.html', title: 'Go Modules配置教程' }
    ];

    tutorials.forEach(tutorial => {
        urls.push({
            loc: SITE_URL + tutorial.path,
            lastmod: getCurrentDate(),
            changefreq: 'weekly',
            priority: '0.9'
        });
    });

    // 3. 所有工具页面
    Object.keys(mirrorConfig.tools).forEach(toolKey => {
        const tool = mirrorConfig.tools[toolKey];

        urls.push({
            loc: `${SITE_URL}/#tool=${toolKey}`,
            lastmod: getCurrentDate(),
            changefreq: 'weekly',
            priority: '0.8'
        });

        // 4. 每个工具的每个镜像源组合
        Object.keys(tool.mirrors).forEach(mirrorKey => {
            if (tool.requiresOS && tool.osVersions) {
                // 需要系统版本的工具（如 APT, YUM）
                Object.keys(tool.osVersions).forEach(osVersion => {
                    urls.push({
                        loc: `${SITE_URL}/#tool=${toolKey}&mirror=${mirrorKey}&os=${osVersion}`,
                        lastmod: getCurrentDate(),
                        changefreq: 'monthly',
                        priority: '0.7'
                    });
                });
            } else {
                // 不需要系统版本的工具
                urls.push({
                    loc: `${SITE_URL}/#tool=${toolKey}&mirror=${mirrorKey}`,
                    lastmod: getCurrentDate(),
                    changefreq: 'monthly',
                    priority: '0.7'
                });
            }
        });
    });

    // 5. 所有生成的脚本文件
    const scriptsDir = path.join(__dirname, 'scripts');
    if (fs.existsSync(scriptsDir)) {
        const scriptFiles = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.sh'));

        scriptFiles.forEach(file => {
            urls.push({
                loc: `${SITE_URL}/scripts/${file}`,
                lastmod: getCurrentDate(),
                changefreq: 'monthly',
                priority: '0.5'
            });
        });
    }

    // 生成 XML 内容
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    // 写入文件
    fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

    console.log('✅ sitemap.xml 生成成功！');
    console.log(`📊 共生成 ${urls.length} 个URL条目\n`);
    console.log('📋 统计信息:');
    console.log(`   - 主要页面: 4 个`);
    console.log(`   - 工具页面: ${Object.keys(mirrorConfig.tools).length} 个`);
    console.log(`   - 配置组合: ${urls.filter(u => u.priority === '0.7').length} 个`);
    console.log(`   - 脚本文件: ${urls.filter(u => u.priority === '0.5').length} 个`);
    console.log('\n📍 文件位置:', path.resolve(OUTPUT_FILE));
    console.log('\n💡 下一步:');
    console.log('   1. 修改脚本中的 SITE_URL 为你的实际域名');
    console.log('   2. 上传 sitemap.xml 到网站根目录');
    console.log('   3. 提交到 Google Search Console: https://search.google.com/search-console');
    console.log('   4. 提交到 百度站长平台: https://ziyuan.baidu.com/');
}

// XML 转义
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// 执行生成
try {
    generateSitemap();
} catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
}
