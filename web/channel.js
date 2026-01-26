// 频道页面脚本
let homeData = null;
let channelData = null;
let currentPage = 1;
let totalPages = 1;
let pageSize = 20;
let currentChannelId = null;
let currentChannelName = null;
let currentChannelApiUrl = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initChannel();
});

function initChannel() {
    const urlParams = new URLSearchParams(window.location.search);
    currentChannelId = urlParams.get('channel_id');
    currentChannelName = urlParams.get('channel_name');
    
    if (!currentChannelId) {
        showError('频道ID不存在');
        return;
    }
    
    loadChannelData();
}

// 加载频道数据
function loadChannelData() {
    const apiUrl = getApiUrl();
    
    showLoading();
    
    // 先加载首页数据
    fetch(apiUrl)
        .then(response => {
            console.log('收到响应，状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log('响应文本长度:', text.length);
            try {
                const homeDataResult = JSON.parse(text);
                homeData = homeDataResult;
                console.log('Home data loaded:', homeData);
                
                // 根据channel_id找到对应的导航项
                const navigationItem = homeData.navigation_menu.find(item => item.channel_key === currentChannelId);
                if (!navigationItem) {
                    console.log('找不到频道:', currentChannelId);
                    throw new Error('找不到频道');
                }
                
                // 从home_data中获取频道数据（如果有的话）
                if (homeData[currentChannelId]) {
                    channelData = homeData[currentChannelId];
                    console.log('Channel data from home_data:', channelData);
                    currentPage = channelData.page || 1;
                    totalPages = channelData.totalPages || 1;
                    pageSize = channelData.pageSize || 20;
                    
                    renderChannel();
                    hideLoading();
                } else {
                    // 尝试加载独立的channel文件
                    const localChannelUrl = `${apiUrl}/channel_${currentChannelId}.json`;
                    console.log('频道API地址:', localChannelUrl);
                    return fetch(localChannelUrl).then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    });
                }
            } catch (e) {
                console.error('JSON解析失败:', e);
                throw new Error('数据解析失败');
            }
        })
        .then(channelDataResult => {
            if (channelDataResult) {
                channelData = channelDataResult;
                console.log('Channel data loaded:', channelData);
                currentPage = channelData.page || 1;
                totalPages = channelData.totalPages || 1;
                pageSize = channelData.pageSize || 20;
                
                renderChannel();
                hideLoading();
            }
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            hideLoading();
            showError('加载数据失败: ' + error.message);
        });
}

// 获取API基础URL
function getApiUrl() {
    return 'https://api.allorigins.win/raw?url=https://pastebin.com/raw/wHzzja05';
}

// 获取带CORS代理的URL
function getCorsProxyUrl(url) {
    return url;
}

// 渲染频道页面
function renderChannel() {
    const channelTitle = document.getElementById('channel-title');
    const channelAdContainer = document.getElementById('channel-ad-container');
    const movieGrid = document.getElementById('movie-grid');
    const paginationContainer = document.getElementById('pagination-container');
    const pageInfo = document.getElementById('page-info');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    
    // 设置频道标题
    channelTitle.textContent = currentChannelName || `频道 ${currentChannelId}`;
    
    // 加载频道广告（根据频道ID选择对应的广告）
    loadChannelAd(channelAdContainer);
    
    // 渲染电影列表
    if (channelData && channelData.items && channelData.items.length > 0) {
        movieGrid.innerHTML = channelData.items.map(movie => `
            <div class="movie-card" onclick="openPlayer('${movie.id}', '${encodeURIComponent(movie.title)}', '${movie.type || ''}', '${encodeURIComponent(movie.poster)}', '${encodeURIComponent(movie.video_url)}')">
                <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <div class="movie-title">${movie.title}</div>
            </div>
        `).join('');
    } else {
        movieGrid.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">暂无数据</div>';
    }
    
    // 显示翻页控制
    if (totalPages > 1) {
        paginationContainer.classList.remove('hidden');
        pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        
        // 更新按钮状态
        btnPrev.disabled = currentPage <= 1;
        btnPrev.style.opacity = currentPage <= 1 ? '0.5' : '1';
        
        btnNext.disabled = currentPage >= totalPages;
        btnNext.style.opacity = currentPage >= totalPages ? '0.5' : '1';
    } else {
        paginationContainer.classList.add('hidden');
    }
}

// 加载频道广告
function loadChannelAd(container) {
    console.log('Loading channel ad...');
    
    if (!homeData) {
        console.log('No home data available');
        return;
    }
    
    // 根据频道ID选择对应的广告
    let adData = null;
    const channelIndex = parseInt(currentChannelId.replace(/\D/g, '')) || 0;
    
    // 使用ad1、ad2、ad3循环分配给不同频道
    const ads = ['ad1', 'ad2', 'ad3'];
    const adKey = ads[channelIndex % 3];
    
    console.log('Channel ID:', currentChannelId, 'Ad key:', adKey);
    
    if (adKey && homeData[adKey] && homeData[adKey].enabled) {
        adData = homeData[adKey];
        console.log('Channel ad data:', adData);
        container.innerHTML = `
            <div class="ad-placeholder">广告加载中...</div>
        `;
        
        setTimeout(() => {
            container.innerHTML = `
                <iframe class="ad-webview" 
                        srcdoc="${createAdHTML(adData)}" 
                        scrolling="no" 
                        frameborder="0">
                </iframe>
            `;
            console.log('Channel ad loaded');
        }, 300);
    } else {
        console.log('Channel ad not enabled or no data');
        container.classList.add('hidden');
    }
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

// 上一页
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadChannelPage();
    }
}

// 下一页
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadChannelPage();
    }
}

// 加载指定页的数据
function loadChannelPage() {
    if (!currentChannelId) {
        showError('频道ID未设置');
        return;
    }
    
    showLoading();
    
    // 本地测试：使用本地channel文件
    const apiUrl = getApiUrl();
    const pageUrl = `${apiUrl}/channel_${currentChannelId}.json`;
    console.log('加载页面:', pageUrl);
    
    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            channelData = data;
            currentPage = data.page || 1;
            totalPages = data.totalPages || 1;
            
            renderChannel();
            hideLoading();
            
            // 滚动到顶部
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error('加载页面失败:', error);
            hideLoading();
            showError('加载页面失败: ' + error.message);
        });
}

// 打开播放器
function openPlayer(movieId, title, type, poster, videoUrl) {
    const params = new URLSearchParams();
    params.append('movie_id', movieId);
    params.append('title', decodeURIComponent(title));
    params.append('type', decodeURIComponent(type));
    params.append('poster', decodeURIComponent(poster));
    params.append('video_url', decodeURIComponent(videoUrl));
    
    window.location.href = `player.html?${params.toString()}`;
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

// 显示错误信息
function showError(message) {
    const channelContainer = document.getElementById('channel-container');
    channelContainer.innerHTML = `
        <div style="text-align:center;padding:40px;color:#fff;">
            <div style="font-size:18px;margin-bottom:16px;">${message}</div>
            <button onclick="window.location.href='index.html'" style="padding:12px 24px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;">返回首页</button>
        </div>
    `;
    hideLoading();
}
