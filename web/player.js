// 播放器页面脚本
let homeData = null;
let currentMovie = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initPlayer();
});

function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movie_id');
    const movieTitle = urlParams.get('title');
    const movieType = urlParams.get('type');
    const moviePoster = urlParams.get('poster');
    const videoUrl = urlParams.get('video_url');
    
    currentMovie = {
        id: movieId,
        title: movieTitle,
        type: movieType,
        poster: moviePoster,
        video_url: videoUrl
    };
    
    loadHomeData();
}

// 加载首页数据（获取广告配置）
function loadHomeData() {
    const apiUrl = getApiUrl();
    
    fetch(`${apiUrl}/home_data.json`)
        .then(response => response.json())
        .then(data => {
            homeData = data;
            renderPlayer();
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            renderPlayer();
        });
}

// 获取API基础URL
function getApiUrl() {
    return 'https://api.allorigins.win/raw?url=https://pastebin.com/raw/wHzzja05';
}

// 渲染播放器
function renderPlayer() {
    const playerVideo = document.getElementById('player-video');
    const playerTitle = document.getElementById('player-title');
    const playerType = document.getElementById('player-type');
    const playerAdContainer = document.getElementById('player-ad-container');
    
    if (!currentMovie) {
        playerTitle.textContent = '加载失败';
        return;
    }
    
    playerTitle.textContent = currentMovie.title;
    playerType.textContent = currentMovie.type || '';
    
    const videoUrl = currentMovie.video_url;
    const isHls = videoUrl.includes('.m3u8') || videoUrl.includes('m3u8');
    
    if (isHls && typeof Hls !== 'undefined' && Hls.isSupported()) {
        playerVideo.innerHTML = `
            <video id="video-player" controls style="width:100%;height:100%;background:#000;"></video>
        `;
        
        setTimeout(() => {
            const video = document.getElementById('video-player');
            if (video) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play();
                });
            }
        }, 100);
    } else if (isHls) {
        playerVideo.innerHTML = `
            <video id="video-player" controls style="width:100%;height:100%;background:#000;">
                <source src="${videoUrl}" type="application/x-mpegURL">
            </video>
        `;
    } else {
        playerVideo.innerHTML = `
            <video id="video-player" controls style="width:100%;height:100%;background:#000;">
                <source src="${videoUrl}" type="video/mp4">
            </video>
        `;
    }
    
    // 延迟加载播放页广告
    setTimeout(() => {
        console.log('Loading player ad...');
        if (homeData && homeData.player_ad && homeData.player_ad.enabled) {
            const adData = homeData.player_ad;
            console.log('Player ad data:', adData);
            playerAdContainer.innerHTML = `
                <div class="ad-container">
                    <iframe class="ad-webview" 
                            srcdoc="${createAdHTML(adData)}" 
                            scrolling="no" 
                            frameborder="0">
                    </iframe>
                </div>
            `;
            playerAdContainer.classList.remove('hidden');
            console.log('Player ad loaded');
        } else {
            console.log('Player ad not enabled or no data');
            playerAdContainer.classList.add('hidden');
        }
    }, 300);
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

// 返回主页
function goBack() {
    window.location.href = 'index.html';
}

// 视频播放完成处理
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('ended', function() {
                console.log('视频播放完成');
            });
            
            videoPlayer.addEventListener('error', function(e) {
                console.error('视频播放错误:', e);
            });
        }
    }, 100);
});
