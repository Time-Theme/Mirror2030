// 镜像加速站 - 主应用逻辑
(function() {
    'use strict';

    // 应用状态
    const state = {
        currentStep: 'category',
        selectedCategory: null,
        selectedTool: null,
        selectedOsVersion: null,
        selectedMirror: null,
        speedTestResults: {}
    };

    // 配置
    const config = {
        // 修改为你的实际域名
        baseUrl: window.location.origin,
        scriptsPath: '/scripts/'
    };

    // DOM 元素
    const sections = {
        category: document.getElementById('step-category'),
        tool: document.getElementById('step-tool'),
        mirror: document.getElementById('step-mirror'),
        result: document.getElementById('step-result'),
        tutorials: document.getElementById('section-tutorials'),
        monitor: document.getElementById('section-monitor'),
        about: document.getElementById('section-about')
    };

    // 初始化应用
    function init() {
        setupEventListeners();
        showSection('category');
    }

    // 设置事件监听
    function setupEventListeners() {
        // 导航链接
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const nav = this.dataset.nav;
                navigateToPage(nav);
            });
        });

        // 分类卡片点击
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                selectCategory(category);
            });
        });

        // 面包屑导航
        document.querySelectorAll('.breadcrumb-item[data-step]').forEach(item => {
            item.addEventListener('click', function() {
                const step = this.dataset.step;
                goToStep(step);
            });
        });

        // 测速按钮
        const speedTestBtn = document.getElementById('speedTestBtn');
        if (speedTestBtn) {
            speedTestBtn.addEventListener('click', runSpeedTest);
        }

        // 结果页面按钮
        const btnDownload = document.getElementById('btnDownload');
        if (btnDownload) {
            btnDownload.addEventListener('click', downloadScript);
        }

        const btnCopyManual = document.getElementById('btnCopyManual');
        if (btnCopyManual) {
            btnCopyManual.addEventListener('click', copyManualCommands);
        }

        // 配置文件相关按钮
        const btnCopyConfigFile = document.getElementById('btnCopyConfigFile');
        if (btnCopyConfigFile) {
            btnCopyConfigFile.addEventListener('click', copyConfigFile);
        }

        const btnDownloadConfigFile = document.getElementById('btnDownloadConfigFile');
        if (btnDownloadConfigFile) {
            btnDownloadConfigFile.addEventListener('click', downloadConfigFile);
        }

        // 复制按钮（一键脚本）
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                copyToClipboard(targetId);
            });
        });
    }

    // 导航到不同页面
    function navigateToPage(page) {
        // 更新导航栏active状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.nav === page) {
                link.classList.add('active');
            }
        });

        // 隐藏所有section
        Object.values(sections).forEach(section => {
            if (section) section.classList.remove('active');
        });

        // 显示对应section
        switch(page) {
            case 'home':
                if (sections.category) sections.category.classList.add('active');
                break;
            case 'tutorials':
                if (sections.tutorials) sections.tutorials.classList.add('active');
                break;
            case 'monitor':
                if (sections.monitor) sections.monitor.classList.add('active');
                break;
            case 'about':
                if (sections.about) sections.about.classList.add('active');
                break;
        }

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 显示指定步骤
    function showSection(step) {
        // 隐藏所有section
        Object.values(sections).forEach(section => {
            section.classList.remove('active');
        });

        // 显示当前section
        if (sections[step]) {
            sections[step].classList.add('active');
            state.currentStep = step;

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // 跳转到指定步骤
    function goToStep(step) {
        switch(step) {
            case 'category':
                showSection('category');
                break;
            case 'tool':
                if (state.selectedCategory) {
                    showSection('tool');
                }
                break;
            case 'mirror':
                if (state.selectedTool) {
                    showSection('mirror');
                }
                break;
        }
    }

    // ========== 步骤1: 选择分类 ==========
    function selectCategory(categoryKey) {
        state.selectedCategory = categoryKey;
        const category = mirrorConfig.categories[categoryKey];

        // 生成工具卡片
        const toolGrid = document.getElementById('toolGrid');
        toolGrid.innerHTML = '';

        category.tools.forEach(toolKey => {
            const tool = mirrorConfig.tools[toolKey];
            const card = createToolCard(toolKey, tool);
            toolGrid.appendChild(card);
        });

        // 更新标题
        document.getElementById('tool-category-title').textContent = `选择 ${category.name}`;

        // 进入工具选择步骤
        showSection('tool');
    }

    // 创建工具卡片
    function createToolCard(toolKey, tool) {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-name">${tool.fullName}</div>
        `;

        card.addEventListener('click', function() {
            selectTool(toolKey, tool);
        });

        return card;
    }

    // ========== 步骤2: 选择工具 ==========
    function selectTool(toolKey, tool) {
        state.selectedTool = toolKey;
        state.selectedOsVersion = null;

        // 更新标题
        document.getElementById('mirror-tool-title').textContent = `${tool.fullName} - 选择镜像源`;

        // 如果需要系统版本，显示版本选择
        const osVersionSection = document.getElementById('osVersionSection');
        if (tool.requiresOS) {
            osVersionSection.style.display = 'block';
            generateOsVersionCards(tool);
        } else {
            osVersionSection.style.display = 'none';
        }

        // 生成镜像源卡片
        generateMirrorCards(tool);

        // 进入镜像源选择步骤
        showSection('mirror');
    }

    // 生成系统版本卡片
    function generateOsVersionCards(tool) {
        const grid = document.getElementById('osVersionGrid');
        grid.innerHTML = '';

        Object.entries(tool.osVersions).forEach(([key, label]) => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.textContent = label;
            card.dataset.version = key;

            card.addEventListener('click', function() {
                // 移除其他选中状态
                grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                // 添加选中状态
                this.classList.add('selected');
                state.selectedOsVersion = key;
            });

            grid.appendChild(card);
        });
    }

    // 生成镜像源卡片
    function generateMirrorCards(tool) {
        const grid = document.getElementById('mirrorGrid');
        grid.innerHTML = '';

        Object.entries(tool.mirrors).forEach(([key, mirror]) => {
            const card = document.createElement('div');
            card.className = 'mirror-card';
            card.dataset.mirror = key;

            const speedResult = state.speedTestResults[key];
            let latencyHTML = '';
            if (speedResult) {
                const latencyClass = speedResult < 200 ? 'fast' : '';
                latencyHTML = `<div class="mirror-latency ${latencyClass}">${speedResult}ms</div>`;
            }

            card.innerHTML = `
                <div class="mirror-name">${mirror.name}</div>
                ${latencyHTML}
            `;

            card.addEventListener('click', function() {
                selectMirror(key, mirror, tool);
            });

            grid.appendChild(card);
        });
    }

    // ========== 步骤3: 选择镜像源 ==========
    function selectMirror(mirrorKey, mirror, tool) {
        state.selectedMirror = mirrorKey;

        // 如果需要系统版本但未选择，提示用户
        if (tool.requiresOS && !state.selectedOsVersion) {
            alert('请先选择系统版本');
            return;
        }

        // 生成结果
        generateResult(tool, mirror);

        // 进入结果步骤
        showSection('result');
    }

    // ========== 步骤4: 生成结果 ==========
    function generateResult(tool, mirror) {
        const toolKey = state.selectedTool;
        const mirrorKey = state.selectedMirror;
        const osVersion = state.selectedOsVersion;

        // 生成脚本文件名
        const scriptFileName = mirrorConfig.getScriptFileName(toolKey, mirrorKey, osVersion);

        // 1. 一键脚本命令（标签页版本）
        const oneClickCommand = `curl -sSL ${config.baseUrl}${config.scriptsPath}${scriptFileName} | bash`;
        document.getElementById('oneClickCommand').textContent = oneClickCommand;

        // 脚本预览链接（标签页版本）
        const scriptPreviewLink = document.getElementById('scriptPreviewLink');
        scriptPreviewLink.href = `${config.baseUrl}${config.scriptsPath}${scriptFileName}`;

        // 2. 手动配置命令（标签页版本）
        const manualCommands = tool.getManualCommands(mirror, osVersion);
        document.getElementById('manualSteps').innerHTML = `<pre>${manualCommands}</pre>`;

        // 3. 配置文件生成（新增）
        const configFileTab = document.querySelector('[data-tab="configfile"]');
        const configFilePanel = document.querySelector('[data-panel="configfile"]');

        if (tool.generateConfigFile) {
            const configFileContent = tool.generateConfigFile(mirror, osVersion);
            const configFileName = getConfigFileName(toolKey);
            const configFilePath = getConfigFilePath(toolKey);

            document.getElementById('configFileContent').textContent = configFileContent;
            document.getElementById('configFileName').textContent = configFileName;
            document.getElementById('configFilePath').textContent = configFilePath;

            // 保存到state用于下载
            state.currentConfigFile = configFileContent;
            state.currentConfigFileName = configFileName;

            // 显示配置文件标签页
            if (configFileTab) configFileTab.style.display = 'flex';
            if (configFilePanel) configFilePanel.style.display = 'block';
        } else {
            // 隐藏配置文件标签页（工具不支持配置文件）
            if (configFileTab) configFileTab.style.display = 'none';
            if (configFilePanel) configFilePanel.style.display = 'none';
        }

        // 4. 下载脚本信息（标签页版本）
        document.getElementById('scriptFileName').textContent = scriptFileName;

        // 保存到state用于下载
        state.currentScriptFileName = scriptFileName;
        state.currentScript = tool.generateScript(mirror, osVersion);
    }

    // 获取配置文件名
    function getConfigFileName(toolKey) {
        const fileNameMap = {
            'npm': '.npmrc',
            'yarn': '.yarnrc',
            'pnpm': '.npmrc',
            'pip': 'pip.conf',
            'maven': 'settings.xml',
            'docker': 'daemon.json',
            'conda': '.condarc',
            'cargo': 'config.toml',
            'gradle': 'build.gradle',
            'cran': '.Rprofile'
        };
        return fileNameMap[toolKey] || 'config.txt';
    }

    // 获取配置文件路径
    function getConfigFilePath(toolKey) {
        const pathMap = {
            'npm': '~/.npmrc 或项目根目录',
            'yarn': '~/.yarnrc 或项目根目录',
            'pnpm': '~/.npmrc 或项目根目录',
            'pip': '~/.pip/pip.conf (Linux/macOS) 或 %APPDATA%\\pip\\pip.ini (Windows)',
            'maven': '~/.m2/settings.xml',
            'docker': '/etc/docker/daemon.json',
            'conda': '~/.condarc',
            'cargo': '~/.cargo/config.toml',
            'gradle': '项目根目录/build.gradle 或 settings.gradle',
            'cran': '~/.Rprofile'
        };
        return pathMap[toolKey] || '根据工具要求放置';
    }

    // ========== 测速功能 ==========
    async function runSpeedTest() {
        const tool = mirrorConfig.tools[state.selectedTool];
        if (!tool) return;

        const btn = document.getElementById('speedTestBtn');
        const btnText = document.getElementById('speedTestText');

        btn.disabled = true;
        btnText.textContent = '测速中...';

        state.speedTestResults = {};

        // 测试每个镜像源
        const mirrors = tool.mirrors;
        for (const [key, mirror] of Object.entries(mirrors)) {
            const latency = await testLatency(mirror.testUrl);
            state.speedTestResults[key] = latency;
        }

        // 找出最快的
        let fastestKey = null;
        let fastestLatency = Infinity;
        for (const [key, latency] of Object.entries(state.speedTestResults)) {
            if (latency > 0 && latency < fastestLatency) {
                fastestLatency = latency;
                fastestKey = key;
            }
        }

        // 重新生成镜像源卡片，显示测速结果
        generateMirrorCards(tool);

        // 标记最快的
        if (fastestKey) {
            const fastestCard = document.querySelector(`.mirror-card[data-mirror="${fastestKey}"]`);
            if (fastestCard) {
                fastestCard.classList.add('fastest');
            }
        }

        btn.disabled = false;
        btnText.textContent = '✓ 测速完成';
    }

    // 测试延迟
    async function testLatency(url) {
        const testCount = 3;
        let totalLatency = 0;
        let successCount = 0;

        for (let i = 0; i < testCount; i++) {
            try {
                const startTime = performance.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const endTime = performance.now();
                const latency = endTime - startTime;

                totalLatency += latency;
                successCount++;
            } catch (error) {
                // 测试失败
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return successCount > 0 ? Math.round(totalLatency / successCount) : -1;
    }

    // ========== 复制和下载功能 ==========
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        navigator.clipboard.writeText(text).then(() => {
            // 找到对应的复制按钮
            const btn = document.querySelector(`[data-target="${elementId}"]`);
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span>✓</span>';
                btn.style.background = 'rgba(16, 185, 129, 0.3)';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 2000);
            }
        }).catch(err => {
            alert('复制失败，请手动复制');
        });
    }

    function copyManualCommands() {
        const text = document.getElementById('manualSteps').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btnCopyManual');
            const originalText = btn.textContent;
            btn.textContent = '✓ 已复制';
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }).catch(err => {
            alert('复制失败，请手动复制');
        });
    }

    function downloadScript() {
        const script = state.currentScript;
        const filename = state.currentScriptFileName;

        if (!script || !filename) return;

        const blob = new Blob([script], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    function copyConfigFile() {
        const text = state.currentConfigFile;
        if (!text) {
            alert('配置文件内容为空');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btnCopyConfigFile');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>✓</span> 已复制';
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }).catch(err => {
            alert('复制失败，请手动复制');
        });
    }

    function downloadConfigFile() {
        const content = state.currentConfigFile;
        const filename = state.currentConfigFileName;

        if (!content || !filename) return;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // ========== 标签页交互 ==========
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;

                // 移除所有标签的激活状态
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

                // 激活当前点击的标签
                this.classList.add('active');
                const targetPanel = document.querySelector(`[data-panel="${tabName}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // ========== 搜索功能 ==========
    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        if (!searchInput || !searchResults) return;

        // 输入事件 - 显示搜索结果
        searchInput.addEventListener('input', function() {
            const keyword = this.value.toLowerCase().trim();

            if (!keyword) {
                // 清空搜索，隐藏结果
                searchResults.classList.remove('show');
                searchResults.innerHTML = '';
                return;
            }

            // 搜索工具
            const matchedTools = [];
            for (const [toolKey, tool] of Object.entries(mirrorConfig.tools)) {
                const searchText = `${tool.name} ${tool.fullName}`.toLowerCase();
                if (searchText.includes(keyword)) {
                    matchedTools.push({ key: toolKey, tool: tool });
                }
            }

            // 显示搜索结果
            displaySearchResults(matchedTools, keyword);
        });

        // 点击外部关闭搜索结果
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) {
                searchResults.classList.remove('show');
            }
        });

        // 聚焦时如果有内容则显示结果
        searchInput.addEventListener('focus', function() {
            if (this.value.trim() && searchResults.innerHTML) {
                searchResults.classList.add('show');
            }
        });

        // 支持回车搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });
    }

    function displaySearchResults(matchedTools, keyword) {
        const searchResults = document.getElementById('searchResults');
        const searchInput = document.getElementById('searchInput');

        if (matchedTools.length === 0) {
            // 无匹配结果
            searchResults.innerHTML = `
                <div class="search-no-results">
                    😕 未找到匹配的工具，试试 "npm", "docker", "python" 等关键词
                </div>
            `;
            searchResults.classList.add('show');
            return;
        }

        // 单个匹配 - 显示提示并自动跳转
        if (matchedTools.length === 1) {
            const match = matchedTools[0];
            searchResults.innerHTML = `
                <div class="search-hint">
                    <span class="search-hint-icon">⚡</span>
                    <span>按回车键快速跳转</span>
                </div>
                <div class="search-result-item" data-tool-key="${match.key}">
                    <span class="search-result-icon">${match.tool.icon}</span>
                    <div style="display: inline-block;">
                        <div class="search-result-name">${highlightKeyword(match.tool.fullName, keyword)}</div>
                        <div class="search-result-desc">点击配置镜像源</div>
                    </div>
                </div>
            `;
            searchResults.classList.add('show');

            // 绑定点击事件
            const resultItem = searchResults.querySelector('.search-result-item');
            resultItem.addEventListener('click', function() {
                state.selectedCategory = match.tool.category;
                selectTool(match.key, match.tool);
                searchInput.value = '';
                searchResults.classList.remove('show');
            });
            return;
        }

        // 多个匹配 - 显示列表
        let html = `
            <div class="search-hint">
                <span class="search-hint-icon">💡</span>
                <span>找到 ${matchedTools.length} 个匹配结果</span>
            </div>
        `;

        matchedTools.forEach(match => {
            html += `
                <div class="search-result-item" data-tool-key="${match.key}">
                    <span class="search-result-icon">${match.tool.icon}</span>
                    <div style="display: inline-block;">
                        <div class="search-result-name">${highlightKeyword(match.tool.fullName, keyword)}</div>
                        <div class="search-result-desc">${match.tool.category === 'system' ? '系统包管理器' : match.tool.category === 'language' ? '编程语言' : match.tool.category === 'container' ? '容器工具' : '其他工具'}</div>
                    </div>
                </div>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.classList.add('show');

        // 绑定所有结果项的点击事件
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const toolKey = this.dataset.toolKey;
                const match = matchedTools.find(m => m.key === toolKey);
                if (match) {
                    state.selectedCategory = match.tool.category;
                    selectTool(match.key, match.tool);
                    searchInput.value = '';
                    searchResults.classList.remove('show');
                }
            });
        });
    }

    // 高亮关键词
    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark style="background: #fef08a; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    // ========== 自动后台测速 ==========
    async function autoSpeedTest() {
        if (!state.selectedTool) return;

        const tool = mirrorConfig.tools[state.selectedTool];
        if (!tool) return;

        // 快速测速（只测1次，500ms超时）
        const mirrors = tool.mirrors;
        const results = {};

        for (const [key, mirror] of Object.entries(mirrors)) {
            try {
                const startTime = performance.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 500);

                await fetch(mirror.testUrl, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const endTime = performance.now();
                results[key] = Math.round(endTime - startTime);
            } catch (error) {
                results[key] = -1;
            }
        }

        state.speedTestResults = results;

        // 更新镜像源卡片显示
        generateMirrorCards(tool);

        // 找出最快的并标记
        let fastestKey = null;
        let fastestLatency = Infinity;
        for (const [key, latency] of Object.entries(results)) {
            if (latency > 0 && latency < fastestLatency) {
                fastestLatency = latency;
                fastestKey = key;
            }
        }

        if (fastestKey) {
            const fastestCard = document.querySelector(`.mirror-card[data-mirror="${fastestKey}"]`);
            if (fastestCard) {
                fastestCard.classList.add('fastest');
            }
        }
    }

    // 修改 selectTool 函数，添加自动测速
    const originalSelectTool = selectTool;
    selectTool = function(toolKey, tool) {
        originalSelectTool(toolKey, tool);
        // 500ms后自动开始后台测速
        setTimeout(() => autoSpeedTest(), 500);
    };

    // 修改 generateResult 函数，添加标签页初始化
    const originalGenerateResult = generateResult;
    generateResult = function(tool, mirror) {
        originalGenerateResult(tool, mirror);
        // 初始化标签页交互
        setTimeout(() => setupTabs(), 100);
    };

    // 在init中添加搜索功能初始化
    const originalInit = init;
    init = function() {
        originalInit();
        setupSearch();
    };

    // 启动应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
