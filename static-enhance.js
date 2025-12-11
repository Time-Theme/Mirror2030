/**
 * 静态页面增强脚本
 * 为生成的静态页面添加搜索、导航等功能
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化导航功能
    initNavigation();

    // 2. 初始化搜索功能（如果页面有搜索框）
    initSearch();
});

/**
 * 初始化导航功能
 * 不再拦截导航链接，让它们正常跳转
 */
function initNavigation() {
    // 移除了之前的 data-nav 拦截逻辑
    // 现在所有导航链接都通过标准 href 属性正常跳转
    // 这个函数保留用于未来可能的导航增强功能
}

/**
 * 初始化搜索功能
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    // 输入事件 - 显示搜索结果
    searchInput.addEventListener('input', function() {
        const keyword = this.value.toLowerCase().trim();

        if (!keyword) {
            searchResults.classList.remove('show');
            searchResults.innerHTML = '';
            return;
        }

        // 搜索工具（使用全局 mirrorConfig）
        if (typeof mirrorConfig === 'undefined') {
            console.warn('mirrorConfig 未加载，搜索功能不可用');
            return;
        }

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

/**
 * 显示搜索结果
 */
function displaySearchResults(matchedTools, keyword) {
    const searchResults = document.getElementById('searchResults');

    if (matchedTools.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                没有找到 "${keyword}" 相关的工具
            </div>
        `;
        searchResults.classList.add('show');
        return;
    }

    let html = '<div class="search-hint"><span class="search-hint-icon">💡</span> 找到 ' + matchedTools.length + ' 个相关工具</div>';

    matchedTools.forEach(({key, tool}) => {
        html += `
            <div class="search-result-item" onclick="window.location.href='/tools/${key}/'">
                <div>
                    <span class="search-result-icon">${tool.icon}</span>
                    <span class="search-result-name">${highlightKeyword(tool.fullName, keyword)}</span>
                    <div class="search-result-desc">${tool.name}</div>
                </div>
            </div>
        `;
    });

    searchResults.innerHTML = html;
    searchResults.classList.add('show');
}

/**
 * 高亮关键词
 */
function highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<strong style="color: #0066ff;">$1</strong>');
}
