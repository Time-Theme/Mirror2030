#!/usr/bin/env node

/**
 * 一键构建脚本
 * 自动执行所有生成步骤
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 镜像加速站 - 一键构建系统\n');
console.log('='.repeat(60));

// 检查是否存在站点配置
const configPath = path.join(__dirname, 'site-config.json');
if (!fs.existsSync(configPath)) {
    console.log('\n⚠️  未找到站点配置文件！\n');
    console.log('首次构建需要先配置站点信息（域名、备案号等）');
    console.log('请先运行: npm run setup\n');
    console.log('如果想跳过配置使用默认值，请按 Ctrl+C 取消，然后直接运行构建步骤。\n');

    // 询问是否立即运行配置
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('是否现在运行配置向导? (y/n): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y') {
            console.log('\n启动配置向导...\n');
            try {
                execSync('node setup.js', { stdio: 'inherit' });
                console.log('\n配置完成，继续构建...\n');
                runBuild();
            } catch (error) {
                console.error('配置过程出错');
                process.exit(1);
            }
        } else {
            console.log('\n使用默认配置继续构建...\n');
            runBuild();
        }
    });
} else {
    // 显示当前配置
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('\n📋 当前站点配置:');
    console.log(`   域名: ${config.siteUrl}`);
    console.log(`   站点名: ${config.siteName}`);
    if (config.icpNumber) {
        console.log(`   备案号: ${config.icpNumber}`);
    }
    console.log('');
    runBuild();
}

function runBuild() {
    const steps = [
        {
            name: '生成配置脚本',
            command: 'node generate-scripts-enhanced.js',
            required: true
        },
        {
            name: '生成静态站点',
            command: 'node generate-static.js',
            required: true
        },
        {
            name: '生成 sitemap.xml',
            command: 'node generate-sitemap.js',
            required: true
        },
        {
            name: '复制 sitemap 到 dist',
            command: process.platform === 'win32'
                ? 'copy sitemap.xml dist\\sitemap.xml'
                : 'cp sitemap.xml dist/sitemap.xml',
            required: false
        },
        {
            name: '复制 robots.txt 到 dist',
            command: process.platform === 'win32'
                ? 'copy robots.txt dist\\robots.txt'
                : 'cp robots.txt dist/robots.txt',
            required: false
        },
        {
            name: '复制 app-enhanced.js 到 dist',
            command: process.platform === 'win32'
                ? 'copy app-enhanced.js dist\\app-enhanced.js'
                : 'cp app-enhanced.js dist/app-enhanced.js',
            required: false
        },
        {
            name: '复制 tutorials 目录到 dist',
            command: process.platform === 'win32'
                ? 'xcopy /E /I /Y tutorials dist\\tutorials'
                : 'cp -r tutorials dist/',
            required: false
        }
    ];

    let successCount = 0;
    let failedCount = 0;

    steps.forEach((step, index) => {
        console.log(`\n[${index + 1}/${steps.length}] ${step.name}...`);
        console.log('='.repeat(60));

        try {
            const output = execSync(step.command, {
                encoding: 'utf8',
                stdio: 'inherit'
            });

            console.log(`✅ ${step.name} 完成`);
            successCount++;
        } catch (error) {
            if (step.required) {
                console.error(`❌ ${step.name} 失败（必需步骤）`);
                console.error(error.message);
                failedCount++;
                process.exit(1);
            } else {
                console.warn(`⚠️  ${step.name} 失败（可选步骤，继续...）`);
                failedCount++;
            }
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 构建总结');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount}/${steps.length} 步`);
    if (failedCount > 0) {
        console.log(`⚠️  失败: ${failedCount}/${steps.length} 步`);
    }

    // 检查输出目录
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir, { recursive: true });
        console.log(`\n📁 生成的文件数量: ${files.length}`);

        // 计算总大小
        let totalSize = 0;
        function calcSize(dir) {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                    calcSize(itemPath);
                } else {
                    totalSize += stat.size;
                }
            });
        }
        calcSize(distDir);
        console.log(`📊 总大小: ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    }

    console.log('\n🚀 下一步操作:');
    console.log('   1. 检查 dist/ 目录内容');
    console.log('   2. 本地测试: npm run preview');
    console.log('   3. 部署到你的服务器或 CDN:');
    console.log('      - Cloudflare Pages: 连接 Git 仓库自动部署');
    console.log('      - Vercel: vercel --prod');
    console.log('      - 自己的服务器: 上传 dist/ 目录内容');
    console.log('\n✅ 构建完成！\n');
}

