// 批量配置和其他增强功能
(function() {
    'use strict';

    // 预设方案配置
    const presets = {
        frontend: ['npm', 'yarn', 'pnpm'],
        python: ['pip', 'conda'],
        java: ['maven', 'gradle'],
        fullstack: ['npm', 'pip', 'docker']
    };

    // ========== 进度条控制 ==========
    function updateProgress(step) {
        const progressContainer = document.getElementById('progressContainer');
        const steps = progressContainer.querySelectorAll('.progress-step');

        steps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            stepEl.classList.remove('active', 'completed');

            if (stepNum < step) {
                stepEl.classList.add('completed');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
            }
        });
    }

    function showProgress() {
        document.getElementById('progressContainer').style.display = 'block';
    }

    function hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
    }

    // ========== 批量配置弹窗 ==========
    function openBatchModal() {
        const modal = document.getElementById('batchConfigModal');
        modal.classList.add('active');
        generateToolsChecklist();
    }

    function closeBatchModal() {
        const modal = document.getElementById('batchConfigModal');
        modal.classList.remove('active');
    }

    function generateToolsChecklist() {
        const checklist = document.getElementById('toolsChecklist');
        checklist.innerHTML = '';

        const tools = mirrorConfig.tools;
        for (const [key, tool] of Object.entries(tools)) {
            // 跳过需要系统版本的工具
            if (tool.requiresOS) continue;

            const checkbox = document.createElement('label');
            checkbox.className = 'tool-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" value="${key}">
                <span>${tool.icon} ${tool.name}</span>
            `;
            checklist.appendChild(checkbox);
        }
    }

    function getSelectedTools() {
        const checkboxes = document.querySelectorAll('#toolsChecklist input:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function generateBatchScript() {
        const selectedTools = getSelectedTools();
        const mirror = document.getElementById('batchMirrorSelect').value;

        if (selectedTools.length === 0) {
            alert('请至少选择一个工具');
            return;
        }

        let batchScript = `#!/bin/bash
# 批量配置脚本 - ${selectedTools.length}个工具
# 由 镜像加速站 自动生成
# 生成时间: ${new Date().toLocaleString('zh-CN')}

echo "=========================================="
echo "开始批量配置镜像源..."
echo "工具数量: ${selectedTools.length}"
echo "镜像源: ${mirror}"
echo "=========================================="
echo ""

`;

        selectedTools.forEach((toolKey, index) => {
            const tool = mirrorConfig.tools[toolKey];
            const mirrorObj = tool.mirrors[mirror];

            if (!mirrorObj) return;

            batchScript += `# [${index + 1}/${selectedTools.length}] 配置 ${tool.name}\n`;
            batchScript += `echo "正在配置 ${tool.name}..."\n`;
            batchScript += tool.getManualCommands(mirrorObj).split('\n').map(line =>
                line.startsWith('#') ? line : line.trim()
            ).filter(line => line && !line.startsWith('#')).join('\n');
            batchScript += `\necho "✓ ${tool.name} 配置完成"\n`;
            batchScript += `echo ""\n\n`;
        });

        batchScript += `echo "=========================================="
echo "✅ 批量配置完成！"
echo "已配置 ${selectedTools.length} 个工具"
echo "=========================================="
`;

        // 下载脚本
        const blob = new Blob([batchScript], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-config-${mirror}.sh`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        closeBatchModal();
        alert(`批量配置脚本已生成！\n包含 ${selectedTools.length} 个工具的配置命令。`);
    }

    // ========== 预设方案选择 ==========
    function selectPreset(presetName) {
        const tools = presets[presetName];
        const checkboxes = document.querySelectorAll('#toolsChecklist input[type="checkbox"]');

        // 先取消所有选中
        checkboxes.forEach(cb => cb.checked = false);

        // 选中预设工具
        tools.forEach(toolKey => {
            const checkbox = document.querySelector(`#toolsChecklist input[value="${toolKey}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // 高亮预设卡片
        document.querySelectorAll('.preset-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
    }

    // ========== 键盘导航 ==========
    function setupKeyboardNavigation() {
        // ESC关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('batchConfigModal');
                if (modal.classList.contains('active')) {
                    closeBatchModal();
                }
            }
        });

        // Tab导航
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((el, index) => {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // Tab导航逻辑已由浏览器原生处理
                }

                if (e.key === 'Enter') {
                    // Enter键触发点击
                    if (el.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        el.click();
                    }
                }
            });
        });

        // 工具卡片键盘导航
        document.addEventListener('keydown', (e) => {
            const activeSection = document.querySelector('.section.active');
            if (!activeSection) return;

            const cards = activeSection.querySelectorAll('.tool-card, .tool-card-compact, .mirror-card');
            const currentFocus = document.activeElement;
            const currentIndex = Array.from(cards).indexOf(currentFocus.closest('.tool-card, .tool-card-compact, .mirror-card'));

            if (currentIndex === -1) return;

            let nextIndex = currentIndex;

            // 方向键导航
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (currentIndex + 1) % cards.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
            }

            if (nextIndex !== currentIndex) {
                cards[nextIndex].focus();
            }
        });
    }

    // ========== 事件监听器 ==========
    function setupEventListeners() {
        // 批量配置按钮
        const btnBatchConfig = document.getElementById('btnBatchConfig');
        if (btnBatchConfig) {
            btnBatchConfig.addEventListener('click', openBatchModal);
        }

        // 关闭弹窗
        const closeBatchModalBtn = document.getElementById('closeBatchModal');
        if (closeBatchModalBtn) {
            closeBatchModalBtn.addEventListener('click', closeBatchModal);
        }

        const cancelBatchBtn = document.getElementById('cancelBatch');
        if (cancelBatchBtn) {
            cancelBatchBtn.addEventListener('click', closeBatchModal);
        }

        // 点击弹窗外部关闭
        const modal = document.getElementById('batchConfigModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeBatchModal();
                }
            });
        }

        // 生成批量脚本
        const generateBtn = document.getElementById('generateBatchScript');
        if (generateBtn) {
            generateBtn.addEventListener('click', generateBatchScript);
        }

        // 预设方案选择
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', function() {
                const preset = this.dataset.preset;
                selectPreset(preset);
            });
        });
    }

    // ========== 系统镜像选择器 ==========
    const osVersionsData = {
        ubuntu: {
            name: 'Ubuntu',
            versions: [
                { name: 'Ubuntu 24.04 LTS (Noble)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/24.04/' },
                    { name: '阿里云', url: 'https://mirrors.aliyun.com/ubuntu-releases/24.04/' },
                    { name: '腾讯云', url: 'https://mirrors.cloud.tencent.com/ubuntu-releases/24.04/' }
                ]},
                { name: 'Ubuntu 22.04 LTS (Jammy)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/22.04/' },
                    { name: '阿里云', url: 'https://mirrors.aliyun.com/ubuntu-releases/22.04/' },
                    { name: '腾讯云', url: 'https://mirrors.cloud.tencent.com/ubuntu-releases/22.04/' }
                ]},
                { name: 'Ubuntu 20.04 LTS (Focal)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.04/' },
                    { name: '阿里云', url: 'https://mirrors.aliyun.com/ubuntu-releases/20.04/' },
                    { name: '腾讯云', url: 'https://mirrors.cloud.tencent.com/ubuntu-releases/20.04/' }
                ]}
            ]
        },
        debian: {
            name: 'Debian',
            versions: [
                { name: 'Debian 12 (Bookworm)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/debian-cd/current/' },
                    { name: '中科大', url: 'https://mirrors.ustc.edu.cn/debian-cd/current/' }
                ]},
                { name: 'Debian 11 (Bullseye)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/debian-cd/11.9.0/' },
                    { name: '中科大', url: 'https://mirrors.ustc.edu.cn/debian-cd/11.9.0/' }
                ]}
            ]
        },
        centos: {
            name: 'CentOS',
            versions: [
                { name: 'CentOS Stream 9', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/centos-stream/9-stream/BaseOS/x86_64/iso/' },
                    { name: '阿里云', url: 'https://mirrors.aliyun.com/centos-stream/9-stream/BaseOS/x86_64/iso/' }
                ]},
                { name: 'CentOS 7 (归档)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/centos/7.9.2009/isos/x86_64/' },
                    { name: '阿里云', url: 'https://mirrors.aliyun.com/centos/7.9.2009/isos/x86_64/' }
                ]}
            ]
        },
        fedora: {
            name: 'Fedora',
            versions: [
                { name: 'Fedora 39', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/fedora/releases/39/Workstation/x86_64/iso/' },
                    { name: '中科大', url: 'https://mirrors.ustc.edu.cn/fedora/releases/39/Workstation/x86_64/iso/' }
                ]}
            ]
        },
        opensuse: {
            name: 'openSUSE',
            versions: [
                { name: 'openSUSE Leap 15.5', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/distribution/leap/15.5/iso/' },
                    { name: '中科大', url: 'https://mirrors.ustc.edu.cn/opensuse/distribution/leap/15.5/iso/' }
                ]}
            ]
        },
        arch: {
            name: 'Arch Linux',
            versions: [
                { name: 'Arch Linux (最新)', mirrors: [
                    { name: '清华大学', url: 'https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/latest/' },
                    { name: '中科大', url: 'https://mirrors.ustc.edu.cn/archlinux/iso/latest/' }
                ]}
            ]
        },
        windows: {
            name: 'Windows',
            versions: [
                { name: 'Windows 11', mirrors: [
                    { name: '微软官方', url: 'https://www.microsoft.com/zh-cn/software-download/windows11' }
                ]},
                { name: 'Windows 10', mirrors: [
                    { name: '微软官方', url: 'https://www.microsoft.com/zh-cn/software-download/windows10' }
                ]}
            ]
        }
    };

    function showOsVersions(osKey) {
        const osData = osVersionsData[osKey];
        if (!osData) return;

        // 更新active状态
        document.querySelectorAll('.os-category-card').forEach(card => {
            card.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // 显示版本面板
        const panel = document.getElementById('osVersionPanel');
        const title = document.getElementById('osVersionTitle');
        const list = document.getElementById('osVersionList');

        title.textContent = `${osData.name} 镜像下载`;

        // 生成版本列表
        list.innerHTML = osData.versions.map(version => `
            <div class="os-version-item">
                <div class="os-version-name">${version.name}</div>
                <div class="os-mirror-links">
                    ${version.mirrors.map(mirror => `
                        <div class="mirror-link-item">
                            <span>📥 ${mirror.name}</span>
                            <a href="${mirror.url}" target="_blank">访问下载</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        panel.style.display = 'block';

        // 平滑滚动到面板
        setTimeout(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // 导出函数
    window.showOsVersions = showOsVersions;

    // ========== 扩展原有函数 ==========
    // 监听步骤变化，更新进度条
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(step) {
            originalShowSection(step);

            // 更新进度条
            if (step !== 'category') {
                showProgress();
                if (step === 'tool') updateProgress(1);
                else if (step === 'mirror') updateProgress(2);
                else if (step === 'result') updateProgress(3);
            } else {
                hideProgress();
            }
        };
    }

    // ========== 初始化 ==========
    function init() {
        setupEventListeners();
        setupKeyboardNavigation();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 导出函数供其他脚本使用
    window.batchConfig = {
        openBatchModal,
        closeBatchModal,
        updateProgress,
        showProgress,
        hideProgress
    };

})();
