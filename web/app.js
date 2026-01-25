// 主页脚本
let homeData = null;
let currentBannerIndex = 0;
let bannerTimer = null;
let splashTimer = null;
let splashCountdown = 5;

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

// 获取API基础URL
function getApiUrl() {
    const apiUrl = localStorage.getItem('api_url') || 'https://pastebin.com/raw/wHzzja05';
    
    // 检查是否是pastebin的URL，如果是则使用CORS代理
    if (apiUrl.includes('pastebin.com/raw/')) {
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
    }
    
    return apiUrl;
}

// 加载首页数据
function loadHomeData() {
    const apiUrl = getApiUrl();
    console.log('开始加载首页数据，API地址:', apiUrl);
    
    fetch(apiUrl)
        .then(response => {
            console.log('收到响应，状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('数据加载成功:', data);
            homeData = data;
            checkSplashAd();
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            hideLoading();
            showHome();
        });
}

// 检查并显示开屏广告
function checkSplashAd() {
    console.log('检查开屏广告，homeData:', homeData);
    if (homeData && homeData.splash_ad && homeData.splash_ad.enabled) {
        console.log('开屏广告已启用');
        showSplashAd();
    } else {
        console.log('开屏广告未启用，直接显示主页');
        hideLoading();
        showHome();
    }
}

// 显示开屏广告
function showSplashAd() {
    console.log('显示开屏广告');
    const splashContainer = document.getElementById('splash-container');
    const splashImage = document.getElementById('splash-image');
    const splashCountdownText = document.getElementById('splash-countdown-text');
    const splashSkip = document.getElementById('splash-skip');
    
    splashContainer.classList.remove('hidden');
    
    const splashAd = homeData.splash_ad;
    console.log('开屏广告配置:', splashAd);
    
    if (splashAd.ad_format === 'image' && splashAd.image_url) {
        splashImage.src = splashAd.image_url;
    } else {
        splashImage.src = 'bg_splash.jpg';
    }
    
    splashCountdown = splashAd.duration || 5;
    splashCountdownText.textContent = splashCountdown;
    console.log('倒计时开始:', splashCountdown, '秒');
    
    splashSkip.addEventListener('click', closeSplashAd);
    splashImage.addEventListener('click', function() {
        if (splashAd.link_url) {
            window.open(splashAd.link_url, '_blank');
        }
    });
    
    splashTimer = setInterval(() => {
        splashCountdown--;
        splashCountdownText.textContent = splashCountdown;
        
        if (splashCountdown <= 0) {
            closeSplashAd();
        }
    }, 1000);
}

// 关闭开屏广告
function closeSplashAd() {
    if (splashTimer) {
        clearInterval(splashTimer);
    }
    
    const splashContainer = document.getElementById('splash-container');
    splashContainer.classList.add('hidden');
    
    hideLoading();
    showHome();
}

// 显示主页
function showHome() {
    const homeContainer = document.getElementById('home-container');
    homeContainer.classList.remove('hidden');
    
    renderBanner();
    renderNavigation();
    renderNotificationBar();
    renderModules();
    startBannerAutoPlay();
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

// 渲染轮播图
function renderBanner() {
    const bannerContainer = document.getElementById('banner-container');
    const bannerSlider = document.getElementById('banner-slider');
    const bannerIndicator = document.getElementById('banner-indicator');
    
    if (!homeData || !homeData.banner_slides || homeData.banner_slides.length === 0) {
        bannerContainer.classList.add('hidden');
        return;
    }
    
    bannerContainer.classList.remove('hidden');
    bannerSlider.innerHTML = '';
    bannerIndicator.innerHTML = '';
    
    homeData.banner_slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'banner-slide';
        slideDiv.innerHTML = `
            <img class="banner-image" src="${slide.poster}" alt="${slide.title}">
            <div class="banner-title">${slide.title}</div>
        `;
        slideDiv.addEventListener('click', () => openPlayer(slide));
        bannerSlider.appendChild(slideDiv);
        
        const dot = document.createElement('div');
        dot.className = `banner-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToBannerSlide(index));
        bannerIndicator.appendChild(dot);
    });
    
    updateBannerPosition();
}

// 更新轮播图位置
function updateBannerPosition() {
    const bannerSlider = document.getElementById('banner-slider');
    const dots = document.querySelectorAll('.banner-dot');
    
    bannerSlider.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentBannerIndex);
    });
}

// 跳转到指定轮播图
function goToBannerSlide(index) {
    currentBannerIndex = index;
    updateBannerPosition();
    resetBannerTimer();
}

// 下一张轮播图
function nextBannerSlide() {
    const totalSlides = homeData.banner_slides.length;
    currentBannerIndex = (currentBannerIndex + 1) % totalSlides;
    updateBannerPosition();
}

// 开始轮播图自动播放
function startBannerAutoPlay() {
    if (bannerTimer) {
        clearInterval(bannerTimer);
    }
    bannerTimer = setInterval(nextBannerSlide, 3000);
}

// 重置轮播图计时器
function resetBannerTimer() {
    if (bannerTimer) {
        clearInterval(bannerTimer);
    }
    startBannerAutoPlay();
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
    
    if (!homeData || !homeData.sections || homeData.sections.length === 0) {
        return;
    }
    
    modulesContainer.innerHTML = '';
    
    homeData.sections.forEach((module, index) => {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module-section';
        
        // 获取对应的广告
        const ads = ['ad1', 'ad2', 'ad3'];
        const adKey = ads[index];
        
        let adHTML = '';
        if (adKey && homeData[adKey] && homeData[adKey].enabled) {
            const adData = homeData[adKey];
            adHTML = `
                <div class="ad-container">
                    <iframe class="ad-webview" 
                            srcdoc="${createAdHTML(adData)}" 
                            scrolling="no" 
                            frameborder="0">
                    </iframe>
                </div>
            `;
        }
        
        let moviesHTML = '';
        if (module.movies && module.movies.length > 0) {
            moviesHTML = `
                <div class="movie-grid">
                    ${module.movies.map(movie => `
                        <div class="movie-card" onclick="openPlayer(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                            <img class="movie-poster" src="${movie.poster}" alt="${movie.title}">
                            <div class="movie-title">${movie.title}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        moduleDiv.innerHTML = `
            <div class="module-title">${module.name}</div>
            ${adHTML}
            ${moviesHTML}
        `;
        
        modulesContainer.appendChild(moduleDiv);
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

// 触摸滑动支持
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextBannerSlide();
        } else {
            const totalSlides = homeData.banner_slides.length;
            currentBannerIndex = (currentBannerIndex - 1 + totalSlides) % totalSlides;
            updateBannerPosition();
        }
        resetBannerTimer();
    }
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (bannerTimer) {
            clearInterval(bannerTimer);
        }
    } else {
        const homeContainer = document.getElementById('home-container');
        if (!homeContainer.classList.contains('hidden')) {
            startBannerAutoPlay();
        }
    }
});
