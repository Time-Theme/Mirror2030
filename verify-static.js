#!/usr/bin/env node

/**
 * 静态站点功能验证脚本
 * 检查生成的静态页面是否包含所有必要功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 静态站点功能验证\n');
console.log('='.repeat(60));

const distDir = path.join(__dirname, 'dist');
let passCount = 0;
let failCount = 0;

// 检查项目
const checks = [
    {
        name: '检查 dist 目录是否存在',
        test: () => fs.existsSync(distDir)
    },
    {
        name: '检查 static-enhance.js 是否已复制',
        test: () => fs.existsSync(path.join(distDir, 'static-enhance.js'))
    },
    {
        name: '检查首页是否引入 static-enhance.js',
        test: () => {
            const indexPath = path.join(distDir, 'index.html');
            if (!fs.existsSync(indexPath)) return false;
            const content = fs.readFileSync(indexPath, 'utf8');
            return content.includes('static-enhance.js');
        }
    },
    {
        name: '检查工具页面是否存在（/tools/npm/index.html）',
        test: () => fs.existsSync(path.join(distDir, 'tools', 'npm', 'index.html'))
    },
    {
        name: '检查工具页面是否包含测速按钮',
        test: () => {
            const toolPagePath = path.join(distDir, 'tools', 'npm', 'index.html');
            if (!fs.existsSync(toolPagePath)) return false;
            const content = fs.readFileSync(toolPagePath, 'utf8');
            return content.includes('一键测速所有镜像源');
        }
    },
    {
        name: '检查工具页面是否包含测速脚本',
        test: () => {
            const toolPagePath = path.join(distDir, 'tools', 'npm', 'index.html');
            if (!fs.existsSync(toolPagePath)) return false;
            const content = fs.readFileSync(toolPagePath, 'utf8');
            return content.includes('testCurrentToolSpeed');
        }
    },
    {
        name: '检查镜像卡片是否不显示完整URL',
        test: () => {
            const toolPagePath = path.join(distDir, 'tools', 'npm', 'index.html');
            if (!fs.existsSync(toolPagePath)) return false;
            const content = fs.readFileSync(toolPagePath, 'utf8');
            // 检查是否不包含 registry.npmmirror.com 这样的URL直接显示
            const hasUrlInP = content.match(/<p>https?:\/\//);
            return !hasUrlInP;
        }
    },
    {
        name: '检查镜像卡片是否包含延迟显示区域',
        test: () => {
            const toolPagePath = path.join(distDir, 'tools', 'npm', 'index.html');
            if (!fs.existsSync(toolPagePath)) return false;
            const content = fs.readFileSync(toolPagePath, 'utf8');
            return content.includes('mirror-latency');
        }
    },
    {
        name: '检查 config.js 是否已复制',
        test: () => fs.existsSync(path.join(distDir, 'config.js'))
    },
    {
        name: '检查 style.css 是否已复制',
        test: () => fs.existsSync(path.join(distDir, 'style.css'))
    }
];

// 执行检查
console.log('\n开始检查...\n');

checks.forEach((check, index) => {
    process.stdout.write(`[${index + 1}/${checks.length}] ${check.name} ... `);

    try {
        const result = check.test();
        if (result) {
            console.log('✅ 通过');
            passCount++;
        } else {
            console.log('❌ 失败');
            failCount++;
        }
    } catch (error) {
        console.log(`❌ 错误: ${error.message}`);
        failCount++;
    }
});

// 总结
console.log('\n' + '='.repeat(60));
console.log('📊 检查结果');
console.log('='.repeat(60));
console.log(`✅ 通过: ${passCount}/${checks.length}`);
console.log(`❌ 失败: ${failCount}/${checks.length}`);

if (failCount === 0) {
    console.log('\n🎉 所有检查通过！静态站点功能完整！');
    console.log('\n📌 下一步:');
    console.log('   1. 运行 npm run preview 进行本地测试');
    console.log('   2. 访问 http://localhost:8000/tools/npm/');
    console.log('   3. 点击"测速"按钮验证功能');
    console.log('   4. 部署到生产环境\n');
    process.exit(0);
} else {
    console.log('\n⚠️  有检查项未通过，请执行以下步骤：');
    console.log('   1. 确保运行了 npm run build');
    console.log('   2. 检查是否有构建错误');
    console.log('   3. 查看 STATIC_FIX_SUMMARY.md 了解详情\n');
    process.exit(1);
}
