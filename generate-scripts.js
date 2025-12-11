#!/usr/bin/env node

/**
 * 镜像源脚本预生成工具
 *
 * 功能：根据 config.js 配置，自动生成所有可能组合的脚本文件
 *
 * 使用方法：
 *   node generate-scripts.js
 *
 * 输出：
 *   所有脚本文件将保存到 ./scripts/ 目录
 */

const fs = require('fs');
const path = require('path');

// 加载配置（需要调整导入方式）
const configPath = path.join(__dirname, 'config.js');
let mirrorConfig;

// 读取并解析 config.js
try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    // 创建一个简单的模拟环境来执行配置文件
    const module = { exports: {} };
    eval(configContent);
    mirrorConfig = module.exports;
} catch (error) {
    console.error('❌ 无法加载 config.js:', error.message);
    process.exit(1);
}

// 创建 scripts 目录
const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('✓ 创建 scripts 目录');
}

// 统计信息
let totalCount = 0;
let successCount = 0;
const stats = {
    simple: 0,   // 不需要系统版本的工具
    complex: 0   // 需要系统版本的工具
};

console.log('\n🚀 开始生成镜像源脚本...\n');

// 遍历所有工具
for (const [toolKey, tool] of Object.entries(mirrorConfig.tools)) {
    console.log(`📦 处理工具: ${tool.fullName}`);

    const mirrors = tool.mirrors;

    if (tool.requiresOS) {
        // 需要系统版本的工具（如 apt, yum）
        for (const [mirrorKey, mirror] of Object.entries(mirrors)) {
            for (const [osKey, osName] of Object.entries(tool.osVersions)) {
                try {
                    const script = tool.generateScript(mirror, osKey);
                    const filename = mirrorConfig.getScriptFileName(toolKey, mirrorKey, osKey);
                    const filepath = path.join(scriptsDir, filename);

                    fs.writeFileSync(filepath, script, 'utf8');
                    console.log(`   ✓ ${filename}`);

                    totalCount++;
                    successCount++;
                    stats.complex++;
                } catch (error) {
                    console.error(`   ❌ 生成失败: ${toolKey}-${osKey}-${mirrorKey}`, error.message);
                    totalCount++;
                }
            }
        }
    } else {
        // 不需要系统版本的工具（如 npm, pip, docker）
        for (const [mirrorKey, mirror] of Object.entries(mirrors)) {
            try {
                const script = tool.generateScript(mirror, null);
                const filename = mirrorConfig.getScriptFileName(toolKey, mirrorKey);
                const filepath = path.join(scriptsDir, filename);

                fs.writeFileSync(filepath, script, 'utf8');
                console.log(`   ✓ ${filename}`);

                totalCount++;
                successCount++;
                stats.simple++;
            } catch (error) {
                console.error(`   ❌ 生成失败: ${toolKey}-${mirrorKey}`, error.message);
                totalCount++;
            }
        }
    }

    console.log('');
}

// 生成索引文件（可选）
try {
    const indexData = {
        generatedAt: new Date().toISOString(),
        totalScripts: successCount,
        tools: Object.keys(mirrorConfig.tools),
        scripts: fs.readdirSync(scriptsDir).filter(f => f.endsWith('.sh'))
    };

    fs.writeFileSync(
        path.join(scriptsDir, 'index.json'),
        JSON.stringify(indexData, null, 2),
        'utf8'
    );
    console.log('✓ 生成索引文件 index.json\n');
} catch (error) {
    console.error('⚠️  索引文件生成失败:', error.message);
}

// 计算总大小
let totalSize = 0;
fs.readdirSync(scriptsDir).forEach(file => {
    const filepath = path.join(scriptsDir, file);
    const stat = fs.statSync(filepath);
    totalSize += stat.size;
});

// 输出统计信息
console.log('='.repeat(50));
console.log('📊 生成统计');
console.log('='.repeat(50));
console.log(`总计生成: ${successCount}/${totalCount} 个脚本`);
console.log(`简单工具: ${stats.simple} 个脚本`);
console.log(`复杂工具: ${stats.complex} 个脚本`);
console.log(`总大小:   ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`保存位置: ${scriptsDir}`);
console.log('='.repeat(50));

if (successCount === totalCount) {
    console.log('\n✅ 所有脚本生成完成！');
} else {
    console.log(`\n⚠️  部分脚本生成失败 (${totalCount - successCount} 个)`);
}

console.log('\n💡 使用提示:');
console.log('   1. 将 scripts 目录部署到你的网站根目录');
console.log('   2. 确保脚本文件可通过 HTTP 访问');
console.log('   3. 用户可通过以下命令使用:');
console.log('      curl -sSL your-domain.com/scripts/npm-aliyun.sh | bash\n');
