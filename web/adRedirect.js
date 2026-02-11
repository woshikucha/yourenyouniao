// 广告跳转逻辑
const SMARTLINK_URL = 'https://snailscrambledcontrivance.com/fhfysp3uzv?key=81d577835698dce727166d543058f2bf';
const CLICK_COOKIE_NAME = 'adRedirectClicked';
const COOKIE_EXPIRY_MINUTES = 30;

// 检查用户是否已经在最近30分钟内点击过页面
function hasClickedRecently() {
    const cookieValue = getCookie(CLICK_COOKIE_NAME);
    return cookieValue === 'true';
}

// 标记用户在最近30分钟内已经点击过页面
function markClickedRecently() {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + COOKIE_EXPIRY_MINUTES);
    const cookieString = `${CLICK_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
    document.cookie = cookieString;
}

// 获取cookie值
function getCookie(name) {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
}

// 处理第一次点击事件
function handleFirstClick(event) {
    // 排除广告关闭按钮的点击
    if (event.target.closest('.close-btn') || event.target.closest('.ad-close')) {
        return;
    }
    
    // 排除视频播放器控件的点击
    if (event.target.closest('.video-controls') || event.target.closest('.ima-ad-container')) {
        return;
    }
    
    // 打开广告页面
    window.open(SMARTLINK_URL, '_blank');
    
    // 标记用户在最近30分钟内已经点击过
    markClickedRecently();
    
    // 移除第一次点击监听器
    document.removeEventListener('click', handleFirstClick);
}

// 初始化广告跳转逻辑
function initAdRedirect() {
    // 检查用户是否已经在最近30分钟内点击过页面
    if (!hasClickedRecently()) {
        // 添加第一次点击监听器
        document.addEventListener('click', handleFirstClick);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdRedirect);
} else {
    initAdRedirect();
}
