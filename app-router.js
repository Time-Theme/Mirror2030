// 镜像加速站 - 增强版路由系统
// 支持真实URL路径，可分享、可刷新、SEO友好

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
        baseUrl: window.location.origin,
        scriptsPath: '/scripts/',
        useHistoryAPI: true  // 启用 History API（真实URL）
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

    // ========== URL 路由系统 ==========

    /**
     * 更新浏览器URL（不刷新页面）
     * @param {string} path - URL路径，如 '/tools/npm/aliyun/'
     * @param {string} title - 页面标题
     */
    function updateURL(path, title) {
        if (!config.useHistoryAPI) return;

        const fullURL = config.baseUrl + path;

        // 更新浏览器历史记录
        if (window.history && window.history.pushState) {
            window.history.pushState({ path: path }, title, path);
            document.title = title + ' - 镜像加速站';
        }
    }

    /**
     * 从当前URL解析路由信息
     * @returns {Object} 路由信息 { page, tool, mirror, os }
     */
    function parseCurrentURL() {
        const path = window.location.pathname;

        // 匹配模式: /tools/{tool}/{mirror}/
        const toolMirrorMatch = path.match(/^\/tools\/([^\/]+)\/([^\/]+)\/?$/);
        if (toolMirrorMatch) {
            return {
                page: 'result',
                tool: toolMirrorMatch[1],
                mirror: toolMirrorMatch[2],
                os: null
            };
        }

        // 匹配模式: /tools/{tool}/{os}/{mirror}/
        const toolOsMirrorMatch = path.match(/^\/tools\/([^\/]+\/([^\/]+)\/([^\/]+)\/?$/);
        if (toolOsMirrorMatch) {
            return {
                page: 'result',
                tool: toolOsMirrorMatch[1],
                os: toolOsMirrorMatch[2],
                mirror: toolOsMirrorMatch[3]
            };
        }

        // 匹配模式: /tools/{tool}/
        const toolMatch = path.match(/^\/tools\/([^\/]+)\/?$/);
        if (toolMatch) {
            return {
                page: 'mirror',
                tool: toolMatch[1]
            };
        }

        // 主要页面
        if (path.startsWith('/tutorials')) return { page: 'tutorials' };
        if (path.startsWith('/monitor')) return { page: 'monitor' };
        if (path.startsWith('/about')) return { page: 'about' };

        // 默认首页
        return { page: 'home' };
    }

    /**
     * 根据路由信息恢复应用状态
     * @param {Object} route - 路由信息
     */
    function restoreStateFromRoute(route) {
        if (route.page === 'home' || !route.page) {
            showSection('category');
            updateURL('/', '首页');
            return;
        }

        if (route.page === 'tutorials') {
            navigateToPage('tutorials');
            return;
        }

        if (route.page === 'monitor') {
            navigateToPage('monitor');
            return;
        }

        if (route.page === 'about') {
            navigateToPage('about');
            return;
        }

        // 工具页面
        if (route.tool) {
            const tool = mirrorConfig.tools[route.tool];
            if (!tool) {
                console.warn('工具不存在:', route.tool);
                showSection('category');
                return;
            }

            state.selectedCategory = tool.category;
            state.selectedTool = route.tool;

            if (route.mirror) {
                // 有镜像源，显示结果页
                const mirror = tool.mirrors[route.mirror];
                if (!mirror) {
                    console.warn('镜像源不存在:', route.mirror);
                    selectTool(route.tool, tool);
                    return;
                }

                state.selectedOsVersion = route.os;
                state.selectedMirror = route.mirror;

                generateResult(tool, mirror);
                showSection('result');
            } else {
                // 只有工具，显示镜像选择页
                selectTool(route.tool, tool);
            }
        }
    }

    // 监听浏览器前进/后退按钮
    window.addEventListener('popstate', function(event) {
        const route = parseCurrentURL();
        restoreStateFromRoute(route);
    });

    // 修改 init 函数，支持从URL恢复状态
    function init() {
        setupEventListeners();

        // 从URL恢复状态（如果有）
        const route = parseCurrentURL();
        if (route.page !== 'home' && route.tool) {
            restoreStateFromRoute(route);
        } else {
            showSection('category');
        }

        // 初始化搜索功能
        setupSearch();
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

        // 复制按钮
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

        // 显示对应section并更新URL
        switch(page) {
            case 'home':
                if (sections.category) sections.category.classList.add('active');
                updateURL('/', '首页');
                break;
            case 'tutorials':
                if (sections.tutorials) sections.tutorials.classList.add('active');
                updateURL('/tutorials/', '教程中心');
                break;
            case 'monitor':
                if (sections.monitor) sections.monitor.classList.add('active');
                updateURL('/monitor/', '镜像库监控');
                break;
            case 'about':
                if (sections.about) sections.about.classList.add('active');
                updateURL('/about/', '关于我们');
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 显示指定步骤
    function showSection(step) {
        Object.values(sections).forEach(section => {
            section.classList.remove('active');
        });

        if (sections[step]) {
            sections[step].classList.add('active');
            state.currentStep = step;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // 跳转到指定步骤
    function goToStep(step) {
        switch(step) {
            case 'category':
                showSection('category');
                updateURL('/', '首页');
                break;
            case 'tool':
                if (state.selectedTool) {
                    const tool = mirrorConfig.tools[state.selectedTool];
                    selectTool(state.selectedTool, tool);
                }
                break;
            case 'mirror':
                if (state.selectedTool) {
                    showSection('mirror');
                    updateURL(`/tools/${state.selectedTool}/`, mirrorConfig.tools[state.selectedTool].fullName);
                }
                break;
        }
    }

    // 选择分类
    function selectCategory(categoryKey) {
        state.selectedCategory = categoryKey;
        const category = mirrorConfig.categories[categoryKey];

        const toolGrid = document.getElementById('toolGrid');
        toolGrid.innerHTML = '';

        category.tools.forEach(toolKey => {
            const tool = mirrorConfig.tools[toolKey];
            const card = createToolCard(toolKey, tool);
            toolGrid.appendChild(card);
        });

        document.getElementById('tool-category-title').textContent = `选择 ${category.name}`;
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

    // 选择工具
    function selectTool(toolKey, tool) {
        state.selectedTool = toolKey;
        state.selectedOsVersion = null;

        document.getElementById('mirror-tool-title').textContent = `${tool.fullName} - 选择镜像源`;

        const osVersionSection = document.getElementById('osVersionSection');
        if (tool.requiresOS) {
            osVersionSection.style.display = 'block';
            generateOsVersionCards(tool);
        } else {
            osVersionSection.style.display = 'none';
        }

        generateMirrorCards(tool);
        showSection('mirror');

        // 更新URL
        updateURL(`/tools/${toolKey}/`, tool.fullName);

        // 500ms后自动开始后台测速
        setTimeout(() => autoSpeedTest(), 500);
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
                grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
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

    // 选择镜像源
    function selectMirror(mirrorKey, mirror, tool) {
        state.selectedMirror = mirrorKey;

        if (tool.requiresOS && !state.selectedOsVersion) {
            alert('请先选择系统版本');
            return;
        }

        generateResult(tool, mirror);
        showSection('result');

        // 更新URL
        const toolKey = state.selectedTool;
        const osVersion = state.selectedOsVersion;

        let path;
        if (osVersion) {
            path = `/tools/${toolKey}/${osVersion}/${mirrorKey}/`;
        } else {
            path = `/tools/${toolKey}/${mirrorKey}/`;
        }

        const title = `${tool.fullName} ${mirror.name}镜像配置`;
        updateURL(path, title);
    }

    // 生成结果
    function generateResult(tool, mirror) {
        const toolKey = state.selectedTool;
        const mirrorKey = state.selectedMirror;
        const osVersion = state.selectedOsVersion;

        const scriptFileName = mirrorConfig.getScriptFileName(toolKey, mirrorKey, osVersion);

        // 一键脚本命令
        const oneClickCommand = `curl -sSL ${config.baseUrl}${config.scriptsPath}${scriptFileName} | bash`;
        document.getElementById('oneClickCommand').textContent = oneClickCommand;

        // 脚本预览链接
        const scriptPreviewLink = document.getElementById('scriptPreviewLink');
        scriptPreviewLink.href = `${config.baseUrl}${config.scriptsPath}${scriptFileName}`;

        // 手动配置命令
        const manualCommands = tool.getManualCommands(mirror, osVersion);
        document.getElementById('manualSteps').innerHTML = `<pre>${manualCommands}</pre>`;

        // 下载脚本信息
        document.getElementById('scriptFileName').textContent = scriptFileName;

        state.currentScriptFileName = scriptFileName;
        state.currentScript = tool.generateScript(mirror, osVersion);

        // 初始化标签页交互
        setTimeout(() => setupTabs(), 100);
    }

    // 测速功能
    async function runSpeedTest() {
        const tool = mirrorConfig.tools[state.selectedTool];
        if (!tool) return;

        const btn = document.getElementById('speedTestBtn');
        const btnText = document.getElementById('speedTestText');

        btn.disabled = true;
        btnText.textContent = '测速中...';

        state.speedTestResults = {};

        const mirrors = tool.mirrors;
        for (const [key, mirror] of Object.entries(mirrors)) {
            const latency = await testLatency(mirror.testUrl);
            state.speedTestResults[key] = latency;
        }

        let fastestKey = null;
        let fastestLatency = Infinity;
        for (const [key, latency] of Object.entries(state.speedTestResults)) {
            if (latency > 0 && latency < fastestLatency) {
                fastestLatency = latency;
                fastestKey = key;
            }
        }

        generateMirrorCards(tool);

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

    // 复制和下载功能
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        navigator.clipboard.writeText(text).then(() => {
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

    // 标签页交互
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

                this.classList.add('active');
                const targetPanel = document.querySelector(`[data-panel="${tabName}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // 搜索功能
    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', function() {
            const keyword = this.value.toLowerCase().trim();

            if (!keyword) {
                searchResults.classList.remove('show');
                searchResults.innerHTML = '';
                return;
            }

            const matchedTools = [];
            for (const [toolKey, tool] of Object.entries(mirrorConfig.tools)) {
                const searchText = `${tool.name} ${tool.fullName}`.toLowerCase();
                if (searchText.includes(keyword)) {
                    matchedTools.push({ key: toolKey, tool: tool });
                }
            }

            displaySearchResults(matchedTools, keyword);
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) {
                searchResults.classList.remove('show');
            }
        });

        searchInput.addEventListener('focus', function() {
            if (this.value.trim() && searchResults.innerHTML) {
                searchResults.classList.add('show');
            }
        });

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
            searchResults.innerHTML = `
                <div class="search-no-results">
                    😕 未找到匹配的工具，试试 "npm", "docker", "python" 等关键词
                </div>
            `;
            searchResults.classList.add('show');
            return;
        }

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

            const resultItem = searchResults.querySelector('.search-result-item');
            resultItem.addEventListener('click', function() {
                state.selectedCategory = match.tool.category;
                selectTool(match.key, match.tool);
                searchInput.value = '';
                searchResults.classList.remove('show');
            });
            return;
        }

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

    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark style="background: #fef08a; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    // 自动后台测速
    async function autoSpeedTest() {
        if (!state.selectedTool) return;

        const tool = mirrorConfig.tools[state.selectedTool];
        if (!tool) return;

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
        generateMirrorCards(tool);

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

    // 启动应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
