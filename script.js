// DOM 元素
const toolTypeSelect = document.getElementById('toolType');
const osVersionGroup = document.getElementById('osVersionGroup');
const osVersionSelect = document.getElementById('osVersion');
const mirrorSourceSelect = document.getElementById('mirrorSource');
const generateBtn = document.getElementById('generateBtn');
const scriptSection = document.getElementById('scriptSection');
const scriptContent = document.getElementById('scriptContent');
const scriptInfo = document.getElementById('scriptInfo');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const speedTestSection = document.getElementById('speedTestSection');
const speedTestBtn = document.getElementById('speedTestBtn');
const speedTestBtnText = document.getElementById('speedTestBtnText');
const speedResults = document.getElementById('speedResults');

// 当前选择的配置
let currentConfig = null;
let isSpeedTesting = false;

// 工具类型改变时
toolTypeSelect.addEventListener('change', function() {
    const toolType = this.value;

    if (!toolType) {
        resetForm();
        return;
    }

    currentConfig = mirrorConfig[toolType];

    // 根据是否需要系统版本，显示/隐藏系统版本选择框
    if (currentConfig.requiresOS) {
        osVersionGroup.style.display = 'block';
        updateOSVersionOptions();
    } else {
        osVersionGroup.style.display = 'none';
        osVersionSelect.value = '';
    }

    // 更新镜像源选项
    updateMirrorOptions();

    // 重置脚本显示和测速区域
    scriptSection.style.display = 'none';
    speedTestSection.style.display = 'block';
    speedResults.innerHTML = '';

    // 检查是否可以生成脚本
    checkGenerateButton();
});

// 系统版本改变时
osVersionSelect.addEventListener('change', function() {
    checkGenerateButton();
});

// 镜像源改变时
mirrorSourceSelect.addEventListener('change', function() {
    checkGenerateButton();
});

// 更新系统版本选项
function updateOSVersionOptions() {
    osVersionSelect.innerHTML = '<option value="">-- 请选择 --</option>';

    if (currentConfig && currentConfig.osVersions) {
        for (const [key, label] of Object.entries(currentConfig.osVersions)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = label;
            osVersionSelect.appendChild(option);
        }
    }
}

// 更新镜像源选项
function updateMirrorOptions() {
    mirrorSourceSelect.innerHTML = '<option value="">-- 请选择 --</option>';

    if (currentConfig && currentConfig.mirrors) {
        for (const [key, mirror] of Object.entries(currentConfig.mirrors)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = mirror.name;
            mirrorSourceSelect.appendChild(option);
        }
    }
}

// 检查是否可以生成脚本
function checkGenerateButton() {
    const toolType = toolTypeSelect.value;
    const mirrorSource = mirrorSourceSelect.value;
    const osVersion = osVersionSelect.value;

    // 如果需要系统版本但未选择，禁用按钮
    if (currentConfig && currentConfig.requiresOS && !osVersion) {
        generateBtn.disabled = true;
        return;
    }

    // 如果工具类型和镜像源都已选择，启用按钮
    if (toolType && mirrorSource) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
    }
}

// 生成脚本
generateBtn.addEventListener('click', function() {
    const toolType = toolTypeSelect.value;
    const mirrorSourceKey = mirrorSourceSelect.value;
    const osVersion = osVersionSelect.value;

    if (!toolType || !mirrorSourceKey) return;

    const config = mirrorConfig[toolType];
    const mirror = config.mirrors[mirrorSourceKey];

    // 生成脚本内容
    const script = config.generateScript(mirror, osVersion);

    // 显示脚本
    scriptContent.textContent = script;
    scriptInfo.textContent = config.info;
    scriptSection.style.display = 'block';

    // 滚动到脚本区域
    scriptSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// 复制脚本
copyBtn.addEventListener('click', function() {
    const script = scriptContent.textContent;

    navigator.clipboard.writeText(script).then(function() {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ 已复制';
        copyBtn.style.backgroundColor = 'var(--accent-color)';
        copyBtn.style.color = 'white';

        setTimeout(function() {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(function(err) {
        alert('复制失败，请手动复制');
        console.error('复制失败:', err);
    });
});

// 下载脚本
downloadBtn.addEventListener('click', function() {
    const script = scriptContent.textContent;
    const toolType = toolTypeSelect.value;
    const mirrorSource = mirrorSourceSelect.value;

    // 根据工具类型确定文件扩展名
    const extension = (toolType === 'apt' || toolType === 'yum' || toolType === 'docker') ? '.sh' : '.txt';
    const filename = `mirror-${toolType}-${mirrorSource}${extension}`;

    // 创建 Blob 对象
    const blob = new Blob([script], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});

// 重置表单
function resetForm() {
    currentConfig = null;
    osVersionGroup.style.display = 'none';
    osVersionSelect.value = '';
    mirrorSourceSelect.innerHTML = '<option value="">-- 请先选择工具类型 --</option>';
    generateBtn.disabled = true;
    scriptSection.style.display = 'none';
}

// 关于链接点击事件
document.getElementById('aboutLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('中国镜像源一键配置工具\n\n使用纯静态技术构建\n帮助开发者快速配置国内镜像源\n\n技术栈：HTML + CSS + JavaScript');
});

// ==================== 测速功能 ====================

// 测速按钮点击事件
speedTestBtn.addEventListener('click', async function() {
    if (isSpeedTesting) return;

    const toolType = toolTypeSelect.value;
    if (!toolType || !currentConfig) {
        alert('请先选择工具类型');
        return;
    }

    isSpeedTesting = true;
    speedTestBtn.disabled = true;
    speedTestBtnText.textContent = '⏳ 测速中...';
    speedResults.innerHTML = '';

    const mirrors = currentConfig.mirrors;
    const results = [];

    // 对每个镜像源进行测速
    for (const [key, mirror] of Object.entries(mirrors)) {
        const latency = await testMirrorLatency(mirror.testUrl, key);
        results.push({
            key: key,
            name: mirror.name,
            latency: latency
        });

        // 显示实时结果
        updateSpeedResults(results);
    }

    // 排序并标记最快的
    results.sort((a, b) => {
        if (a.latency === -1) return 1;
        if (b.latency === -1) return -1;
        return a.latency - b.latency;
    });

    // 重新显示排序后的结果
    updateSpeedResults(results, true);

    isSpeedTesting = false;
    speedTestBtn.disabled = false;
    speedTestBtnText.textContent = '🔄 重新测速';
});

// 测试单个镜像源的延迟
async function testMirrorLatency(url, key) {
    const testCount = 3; // 测试3次取平均值
    let totalLatency = 0;
    let successCount = 0;

    for (let i = 0; i < testCount; i++) {
        try {
            const startTime = performance.now();

            // 使用 fetch 进行测试，设置超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

            await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors', // 避免 CORS 问题
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
            console.log(`${key} 测试失败 (${i + 1}/${testCount}):`, error.message);
        }

        // 添加小延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 返回平均延迟，如果全部失败返回 -1
    return successCount > 0 ? Math.round(totalLatency / successCount) : -1;
}

// 更新速度测试结果显示
function updateSpeedResults(results, isFinal = false) {
    speedResults.innerHTML = '';

    const fastest = isFinal && results.length > 0 && results[0].latency !== -1 ? results[0] : null;

    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'speed-item';

        if (isFinal && fastest && result.key === fastest.key) {
            item.classList.add('fastest');
        }

        const itemInfo = document.createElement('div');
        itemInfo.className = 'speed-item-info';

        const icon = document.createElement('span');
        icon.className = 'speed-icon';
        icon.textContent = getSpeedIcon(result.latency);

        const name = document.createElement('span');
        name.className = 'speed-item-name';
        name.textContent = result.name;

        if (isFinal && fastest && result.key === fastest.key) {
            const badge = document.createElement('span');
            badge.className = 'speed-badge fastest-badge';
            badge.textContent = '最快';
            name.appendChild(badge);
        }

        itemInfo.appendChild(icon);
        itemInfo.appendChild(name);

        const latency = document.createElement('div');
        latency.className = 'speed-item-latency';
        latency.classList.add(getLatencyClass(result.latency));

        if (result.latency === -1) {
            latency.innerHTML = '<span class="latency-label">超时</span>';
        } else if (result.latency === null) {
            latency.innerHTML = '<div class="loading-spinner"></div>';
        } else {
            latency.innerHTML = `<span>${result.latency}ms</span><span class="latency-label">延迟</span>`;
        }

        item.appendChild(itemInfo);
        item.appendChild(latency);
        speedResults.appendChild(item);
    });
}

// 根据延迟获取对应的图标
function getSpeedIcon(latency) {
    if (latency === -1) return '❌';
    if (latency === null) return '⏳';
    if (latency < 100) return '🚀';
    if (latency < 300) return '⚡';
    if (latency < 1000) return '✅';
    return '🐌';
}

// 根据延迟获取CSS类
function getLatencyClass(latency) {
    if (latency === -1 || latency === null) return '';
    if (latency < 200) return 'fast';
    if (latency < 500) return 'medium';
    return 'slow';
}
