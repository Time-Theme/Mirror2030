#!/usr/bin/env node

/**
 * 增强版脚本生成器
 *
 * 新增功能:
 * 1. 自动验证脚本语法
 * 2. 生成脚本对比报告
 * 3. 检测系统版本差异
 * 4. 生成测试矩阵
 */

const fs = require('fs');
const path = require('path');

// 加载配置
const configPath = path.join(__dirname, 'config.js');
let mirrorConfig;

try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const module = { exports: {} };
    eval(configContent);
    mirrorConfig = module.exports;
} catch (error) {
    console.error('❌ 无法加载 config.js:', error.message);
    process.exit(1);
}

const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
}

// 验证脚本基本语法
function validateScript(script, filename) {
    const issues = [];

    // 检查是否有 shebang
    if (!script.startsWith('#!/bin/bash') && !script.startsWith('#!/bin/sh')) {
        issues.push('缺少 shebang (#!/bin/bash)');
    }

    // 检查是否有基本的错误处理
    if (!script.includes('echo')) {
        issues.push('缺少用户提示信息');
    }

    // 检查危险命令（应该有 sudo）
    const dangerousCommands = ['rm -rf', 'mv /etc', 'cp /etc'];
    dangerousCommands.forEach(cmd => {
        if (script.includes(cmd) && !script.includes('sudo')) {
            issues.push(`危险命令 "${cmd}" 未使用 sudo`);
        }
    });

    return {
        valid: issues.length === 0,
        issues: issues
    };
}

// 生成差异对比报告
function generateDiffReport(toolKey, tool) {
    if (!tool.requiresOS || !tool.osVersions) {
        return null;
    }

    const report = {
        tool: toolKey,
        osVersions: Object.keys(tool.osVersions),
        differences: []
    };

    // 对比不同系统版本的脚本差异
    const mirrors = Object.keys(tool.mirrors);
    const osVersions = Object.keys(tool.osVersions);

    if (osVersions.length < 2) {
        return null;
    }

    mirrors.forEach(mirrorKey => {
        const mirror = tool.mirrors[mirrorKey];
        const scripts = {};

        osVersions.forEach(osKey => {
            scripts[osKey] = tool.generateScript(mirror, osKey);
        });

        // 简单的差异检测
        const scriptKeys = Object.keys(scripts);
        const baseScript = scripts[scriptKeys[0]];
        let hasDifferences = false;

        for (let i = 1; i < scriptKeys.length; i++) {
            if (scripts[scriptKeys[i]] !== baseScript) {
                hasDifferences = true;
                break;
            }
        }

        if (hasDifferences) {
            report.differences.push({
                mirror: mirrorKey,
                note: '不同系统版本的脚本内容存在差异（符合预期）'
            });
        } else {
            report.differences.push({
                mirror: mirrorKey,
                note: '⚠️ 所有系统版本的脚本内容相同（可能需要检查）'
            });
        }
    });

    return report;
}

// 生成测试矩阵
function generateTestMatrix() {
    const matrix = [];

    Object.entries(mirrorConfig.tools).forEach(([toolKey, tool]) => {
        Object.entries(tool.mirrors).forEach(([mirrorKey, mirror]) => {
            if (tool.requiresOS && tool.osVersions) {
                Object.entries(tool.osVersions).forEach(([osKey, osName]) => {
                    matrix.push({
                        tool: toolKey,
                        toolName: tool.name,
                        mirror: mirrorKey,
                        mirrorName: mirror.name,
                        os: osKey,
                        osName: osName,
                        scriptFile: mirrorConfig.getScriptFileName(toolKey, mirrorKey, osKey),
                        testCommand: `# 测试 ${tool.name} on ${osName} with ${mirror.name}`,
                        category: tool.category
                    });
                });
            } else {
                matrix.push({
                    tool: toolKey,
                    toolName: tool.name,
                    mirror: mirrorKey,
                    mirrorName: mirror.name,
                    os: null,
                    osName: 'All',
                    scriptFile: mirrorConfig.getScriptFileName(toolKey, mirrorKey),
                    testCommand: `# 测试 ${tool.name} with ${mirror.name}`,
                    category: tool.category
                });
            }
        });
    });

    return matrix;
}

// 主函数
function main() {
    console.log('\n🚀 开始生成镜像源脚本（增强版）...\n');

    let totalCount = 0;
    let successCount = 0;
    const validationResults = [];
    const diffReports = [];

    // 生成脚本
    Object.entries(mirrorConfig.tools).forEach(([toolKey, tool]) => {
        console.log(`📦 处理工具: ${tool.fullName}`);

        if (tool.requiresOS && tool.osVersions) {
            // 需要系统版本
            Object.entries(tool.mirrors).forEach(([mirrorKey, mirror]) => {
                Object.entries(tool.osVersions).forEach(([osKey, osName]) => {
                    try {
                        const script = tool.generateScript(mirror, osKey);
                        const filename = mirrorConfig.getScriptFileName(toolKey, mirrorKey, osKey);
                        const filepath = path.join(scriptsDir, filename);

                        // 验证脚本
                        const validation = validateScript(script, filename);
                        validationResults.push({
                            file: filename,
                            ...validation
                        });

                        fs.writeFileSync(filepath, script, 'utf8');

                        const statusIcon = validation.valid ? '✓' : '⚠️';
                        console.log(`   ${statusIcon} ${filename} ${osName}`);

                        if (!validation.valid) {
                            validation.issues.forEach(issue => {
                                console.log(`      → ${issue}`);
                            });
                        }

                        totalCount++;
                        successCount++;
                    } catch (error) {
                        console.error(`   ❌ ${toolKey}-${osKey}-${mirrorKey}:`, error.message);
                        totalCount++;
                    }
                });
            });

            // 生成差异报告
            const diffReport = generateDiffReport(toolKey, tool);
            if (diffReport) {
                diffReports.push(diffReport);
            }
        } else {
            // 不需要系统版本
            Object.entries(tool.mirrors).forEach(([mirrorKey, mirror]) => {
                try {
                    const script = tool.generateScript(mirror, null);
                    const filename = mirrorConfig.getScriptFileName(toolKey, mirrorKey);
                    const filepath = path.join(scriptsDir, filename);

                    const validation = validateScript(script, filename);
                    validationResults.push({
                        file: filename,
                        ...validation
                    });

                    fs.writeFileSync(filepath, script, 'utf8');

                    const statusIcon = validation.valid ? '✓' : '⚠️';
                    console.log(`   ${statusIcon} ${filename}`);

                    if (!validation.valid) {
                        validation.issues.forEach(issue => {
                            console.log(`      → ${issue}`);
                        });
                    }

                    totalCount++;
                    successCount++;
                } catch (error) {
                    console.error(`   ❌ ${toolKey}-${mirrorKey}:`, error.message);
                    totalCount++;
                }
            });
        }

        console.log('');
    });

    // 生成测试矩阵
    const testMatrix = generateTestMatrix();
    const matrixFile = path.join(scriptsDir, 'test-matrix.json');
    fs.writeFileSync(matrixFile, JSON.stringify(testMatrix, null, 2), 'utf8');

    // 生成差异报告文件
    if (diffReports.length > 0) {
        const diffReportFile = path.join(scriptsDir, 'diff-report.json');
        fs.writeFileSync(diffReportFile, JSON.stringify(diffReports, null, 2), 'utf8');
        console.log('✓ 生成系统版本差异报告 diff-report.json\n');
    }

    // 生成索引文件
    const indexData = {
        generatedAt: new Date().toISOString(),
        totalScripts: successCount,
        tools: Object.keys(mirrorConfig.tools).length,
        categories: Object.keys(mirrorConfig.categories),
        scripts: fs.readdirSync(scriptsDir).filter(f => f.endsWith('.sh')),
        validation: {
            total: validationResults.length,
            valid: validationResults.filter(r => r.valid).length,
            issues: validationResults.filter(r => !r.valid).length
        }
    };

    fs.writeFileSync(
        path.join(scriptsDir, 'index.json'),
        JSON.stringify(indexData, null, 2),
        'utf8'
    );

    // 计算总大小
    let totalSize = 0;
    fs.readdirSync(scriptsDir).forEach(file => {
        const filepath = path.join(scriptsDir, file);
        const stat = fs.statSync(filepath);
        totalSize += stat.size;
    });

    // 输出统计
    console.log('='.repeat(60));
    console.log('📊 生成统计');
    console.log('='.repeat(60));
    console.log(`总计生成:     ${successCount}/${totalCount} 个脚本`);
    console.log(`验证通过:     ${validationResults.filter(r => r.valid).length} 个`);
    console.log(`验证警告:     ${validationResults.filter(r => !r.valid).length} 个`);
    console.log(`支持工具:     ${Object.keys(mirrorConfig.tools).length} 种`);
    console.log(`支持镜像源:   ${new Set(testMatrix.map(t => t.mirror)).size} 个`);
    console.log(`测试组合:     ${testMatrix.length} 个`);
    console.log(`总大小:       ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`保存位置:     ${scriptsDir}`);
    console.log('='.repeat(60));

    // 显示系统版本差异化工具
    console.log('\n📋 系统版本差异化工具:');
    Object.entries(mirrorConfig.tools)
        .filter(([_, tool]) => tool.requiresOS)
        .forEach(([toolKey, tool]) => {
            const osCount = Object.keys(tool.osVersions || {}).length;
            const mirrorCount = Object.keys(tool.mirrors).length;
            const scriptCount = osCount * mirrorCount;
            console.log(`   ${tool.icon} ${tool.name}: ${osCount} 个系统版本 × ${mirrorCount} 个镜像 = ${scriptCount} 个脚本`);
        });

    // 显示验证问题
    const issueScripts = validationResults.filter(r => !r.valid);
    if (issueScripts.length > 0) {
        console.log('\n⚠️  存在验证问题的脚本:');
        issueScripts.forEach(result => {
            console.log(`   ${result.file}`);
            result.issues.forEach(issue => {
                console.log(`      → ${issue}`);
            });
        });
    }

    console.log('\n✅ 所有脚本生成完成！');
    console.log('\n💡 生成的文件:');
    console.log('   ├── scripts/*.sh          - 配置脚本');
    console.log('   ├── scripts/index.json    - 脚本索引');
    console.log('   ├── scripts/test-matrix.json  - 测试矩阵');
    if (diffReports.length > 0) {
        console.log('   └── scripts/diff-report.json  - 差异报告');
    }

    console.log('\n🚀 下一步:');
    console.log('   1. 运行 node generate-sitemap.js 生成 sitemap.xml');
    console.log('   2. 运行 node generate-static.js 生成静态站点');
    console.log('   3. 部署 dist/ 目录到你的服务器或 CDN\n');
}

// 执行
try {
    main();
} catch (error) {
    console.error('❌ 生成失败:', error);
    console.error(error.stack);
    process.exit(1);
}
