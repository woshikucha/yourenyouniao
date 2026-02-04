// 主页脚本
let homeData = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化应用');
    initApp();
});

function initApp() {
    console.log('初始化应用');
    showLoading();
    loadHomeData();
}

// 获取API基础URL - 直接访问（适合服务器部署）
function getApiUrl() {
    // 直接访问远程API（无代理）
    return 'https://pastebin.com/raw/wHzzja05';
    
    // 本地测试（取消注释使用）
    /*
    return 'home_data.json';
    */
}

// 加载首页数据
function loadHomeData() {
    const apiUrl = getApiUrl();
    console.log('====================================');
    console.log('开始加载首页数据，API地址:', apiUrl);
    console.log('当前时间:', new Date().toLocaleString());
    console.log('====================================');
    
    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log('⏰ 远程API请求超时，切换到本地备份');
        controller.abort();
    }, 10000); // 10秒超时
    
    console.log('🚀 发起远程API请求...');
    
    fetch(apiUrl, {
        signal: controller.signal,
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    })
    .then(response => {
        clearTimeout(timeoutId);
        console.log('✅ 收到远程API响应');
        console.log('状态码:', response.status);
        console.log('状态文本:', response.statusText);
        console.log('Content-Type:', response.headers.get('Content-Type'));
        console.log('响应URL:', response.url);
        
        if (!response.ok) {
            console.log('❌ 远程API响应失败:', response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log('📝 远程API响应文本长度:', text.length);
        console.log('📝 响应文本前200字符:', text.substring(0, 200));
        try {
            const data = JSON.parse(text);
            console.log('🎉 远程API数据解析成功');
            console.log('数据类型:', typeof data);
            if (typeof data === 'object') {
                console.log('数据键名:', Object.keys(data));
            }
            homeData = data;
            hideLoading();
            showHome();
        } catch (e) {
            console.log('❌ 远程API数据解析失败:', e.message);
            console.log('完整响应:', text);
            // 尝试使用本地备份数据
            loadLocalBackupData();
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        console.log('💥 远程API请求失败:', error.message);
        console.log('错误类型:', error.name);
        if (error.name === 'AbortError') {
            console.log('⚠️ 请求被中止（可能是超时）');
        }
        // 尝试使用本地备份数据
        loadLocalBackupData();
    });
}

// 加载本地备份数据
function loadLocalBackupData() {
    console.log('尝试加载本地备份数据');
    fetch('home_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Local backup error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        try {
            const data = JSON.parse(text);
            console.log('本地备份数据加载成功');
            homeData = data;
            hideLoading();
            showHome();
        } catch (e) {
            console.error('本地备份数据解析失败:', e);
            hideLoading();
            showHome();
        }
    })
    .catch(error => {
        console.error('加载本地备份数据失败:', error);
        hideLoading();
        showHome();
    });
}

// 显示主页
function showHome() {
    const homeContainer = document.getElementById('home-container');
    homeContainer.classList.remove('hidden');
    
    renderNavigation();
    renderNotificationBar();
    renderModules();
}

// 渲染导航菜单
function renderNavigation() {
    const navigationContainer = document.getElementById('navigation-container');
    
    if (!homeData || !homeData.navigation_menu || homeData.navigation_menu.length === 0) {
        navigationContainer.classList.add('hidden');
        return;
    }
    
    navigationContainer.classList.remove('hidden');
    navigationContainer.innerHTML = '';
    
    homeData.navigation_menu.forEach(item => {
        const navItem = document.createElement('div');
        navItem.className = 'navigation-item';
        navItem.textContent = item.name;
        navItem.addEventListener('click', () => openChannel(item.channel_key, item.name));
        navigationContainer.appendChild(navItem);
    });
}

// 渲染通知栏
function renderNotificationBar() {
    const notificationBar = document.getElementById('notification-bar');
    const notificationText = document.getElementById('notification-text');
    
    if (!homeData || !homeData.notification_bar || !homeData.notification_bar.enabled) {
        notificationBar.classList.add('hidden');
        return;
    }
    
    notificationBar.classList.remove('hidden');
    notificationText.textContent = homeData.notification_bar.text;
}

// 渲染推荐模块
function renderModules() {
    const modulesContainer = document.getElementById('modules-container');
    
    console.log('Rendering modules, homeData:', homeData);
    
    if (!homeData || !homeData.sections || homeData.sections.length === 0) {
        console.log('No sections to render');
        return;
    }
    
    modulesContainer.innerHTML = '';
    
    homeData.sections.forEach((module, index) => {
        console.log('Rendering module:', module.name, 'index:', index);
        
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module-section';
        
        // 获取对应的广告
        const ads = ['ad1', 'ad2', 'ad3'];
        const adKey = ads[index];
        
        console.log('Ad key for module:', adKey, 'Ad data:', homeData[adKey]);
        
        let adHTML = '';
        if (adKey && homeData[adKey] && homeData[adKey].enabled) {
            const adData = homeData[adKey];
            console.log('Ad enabled:', adKey, 'Ad format:', adData.ad_format);
            adHTML = `
                <div class="ad-container ad-lazy" data-ad-key="${adKey}">
                    <div class="ad-placeholder">广告加载中...</div>
                </div>
            `;
        } else {
            console.log('Ad not enabled or missing:', adKey);
        }
        
        let moviesHTML = '';
        if (module.movies && module.movies.length > 0) {
            console.log('Module has', module.movies.length, 'movies');
            moviesHTML = `
                <div class="movie-grid">
                    ${module.movies.map(movie => `
                        <div class="movie-card" onclick="openPlayer(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                            <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" loading="lazy">
                            <div class="movie-title">${movie.title}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            console.log('Module has no movies');
        }
        
        moduleDiv.innerHTML = `
            <div class="module-title">${module.name}</div>
            ${adHTML}
            ${moviesHTML}
        `;
        
        modulesContainer.appendChild(moduleDiv);
    });
    
    console.log('Total modules rendered:', homeData.sections.length);
    
    // 延迟加载广告
    setTimeout(loadLazyAds, 500);
}

// 懒加载广告
function loadLazyAds() {
    const adContainers = document.querySelectorAll('.ad-lazy');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const adKey = container.getAttribute('data-ad-key');
                
                console.log('Loading ad:', adKey);
                
                if (!container.classList.contains('ad-loaded') && homeData[adKey]) {
                    container.classList.add('ad-loaded');
                    const adData = homeData[adKey];
                    console.log('Ad data:', adData);
                    container.innerHTML = `
                        <iframe class="ad-webview" 
                                srcdoc="${createAdHTML(adData)}" 
                                scrolling="no" 
                                frameborder="0">
                        </iframe>
                    `;
                }
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1
    });
    
    adContainers.forEach(container => {
        observer.observe(container);
    });
}

// 创建广告HTML
function createAdHTML(adData) {
    const content = adData.script_content || '';
    const adFormat = adData.ad_format || 'script';
    
    if (adFormat === 'script') {
        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body style="margin:0;padding:0;background:transparent;width:100%;overflow:hidden;">${content}</body></html>`;
    } else {
        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body style="margin:0;padding:0;background:transparent;width:100%;overflow:hidden;"><img src="${adData.image_url}" style="width:100%;height:100%;object-fit:cover;"></body></html>`;
    }
}

// 打开播放器
function openPlayer(movie) {
    const params = new URLSearchParams();
    params.append('movie_id', movie.id);
    params.append('title', movie.title);
    params.append('type', movie.type || '');
    params.append('poster', movie.poster);
    params.append('video_url', movie.video_url);
    
    window.location.href = `player.html?${params.toString()}`;
}

// 打开频道
function openChannel(channelId, channelName) {
    const params = new URLSearchParams();
    params.append('channel_id', channelId);
    params.append('channel_name', channelName);
    
    window.location.href = `channel.html?${params.toString()}`;
}

// 显示加载动画
function showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.classList.remove('hidden');
}

// 隐藏加载动画
function hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.classList.add('hidden');
}

// 关闭悬浮下载按钮
function closeFloatingDownload() {
    const floatingDownload = document.getElementById('floating-download');
    if (floatingDownload) {
        floatingDownload.style.display = 'none';
    }
}
