# HTML版本视频应用

这是一个与Android应用功能完全一致的HTML5版本，使用纯HTML/CSS/JavaScript实现。

## 功能特性

- ✅ 开屏广告（支持倒计时和跳过，右上角关闭区域已缩小）
- ✅ 轮播图（自动播放、手动切换、触摸滑动）
- ✅ 导航菜单（可点击切换频道）
- ✅ 通知栏（滚动文字）
- ✅ 首页推荐模块（每个模块上方可显示广告）
- ✅ 频道页（支持翻页）
- ✅ 视频播放器
- ✅ 广告支持（开屏广告、播放页广告、模块广告ad1/ad2/ad3）
- ✅ 远程API读取（支持配置API地址）

## 文件结构

```
html/
├── index.html      # 主页面
├── player.html     # 播放器页面
├── channel.html    # 频道页面
├── styles.css      # 样式文件
├── app.js         # 主页脚本
├── player.js      # 播放器脚本
├── channel.js     # 频道页脚本
└── README.md       # 说明文档
```

## 使用方法

### 1. 本地文件模式

将 `html/` 目录下的所有文件复制到Web服务器，确保 `assets/home_data.json` 文件可访问。

### 2. 远程API模式

在浏览器中打开 `index.html` 后，可以通过以下方式配置API地址：

```javascript
// 在浏览器控制台执行
localStorage.setItem('api_url', 'https://your-api-domain.com');
```

或者修改 `app.js`、`player.js`、`channel.js` 中的默认API地址：

```javascript
function getApiUrl() {
    const apiUrl = localStorage.getItem('api_url') || 'https://your-api-domain.com';
    return apiUrl;
}
```

## 页面说明

### index.html - 主页
- 开屏广告（5秒倒计时，可跳过）
- 轮播图（3秒自动播放）
- 导航菜单（点击跳转到对应频道）
- 通知栏（滚动文字）
- 推荐模块（每个模块上方显示广告ad1/ad2/ad3）

### player.html - 播放器
- 视频播放器
- 播放页广告
- 返回按钮

### channel.html - 频道页
- 频道标题
- 频道广告
- 电影网格
- 翻页控制（上一页/下一页）

## 数据源

HTML版本与Android应用使用相同的数据源 `home_data.json` 和 `channel_*.json`，确保数据一致性。

## 数据格式

### home_data.json 格式

```json
{
  "banner_slides": [
    {
      "id": "1",
      "title": "电影标题",
      "type": "movie",
      "poster": "海报URL",
      "video_url": "视频URL",
      "order": 1
    }
  ],
  "navigation_menu": [
    {
      "id": "all",
      "name": "全部",
      "channel_key": "all",
      "api_endpoint": "API端点",
      "order": 1
    }
  ],
  "sections": [
    {
      "id": "section1",
      "name": "推荐模块",
      "display_name": "推荐模块",
      "section_type": "type",
      "movies": [
        {
          "title": "电影标题",
          "poster": "海报URL",
          "video_url": "视频URL"
        }
      ]
    }
  ],
  "splash_ad": {
    "id": "splash",
    "enabled": true,
    "ad_format": "image",
    "image_url": "图片URL",
    "link_url": "跳转链接",
    "duration": 5,
    "script_content": ""
  },
  "player_ad": {
    "id": "player",
    "enabled": true,
    "ad_format": "script",
    "image_url": "",
    "link_url": "",
    "duration": 5,
    "script_content": "<script>广告脚本</script>"
  },
  "ad1": {
    "id": "ad1",
    "enabled": true,
    "ad_format": "script",
    "image_url": "",
    "link_url": "",
    "duration": 5,
    "script_content": "<script>广告脚本</script>"
  },
  "ad2": {
    "id": "ad2",
    "enabled": true,
    "ad_format": "script",
    "image_url": "",
    "link_url": "",
    "duration": 5,
    "script_content": "<script>广告脚本</script>"
  },
  "ad3": {
    "id": "ad3",
    "enabled": true,
    "ad_format": "script",
    "image_url": "",
    "link_url": "",
    "duration": 5,
    "script_content": "<script>广告脚本</script>"
  },
  "notification_bar": {
    "id": "notification_bar",
    "text": "通知内容",
    "link_url": "",
    "enabled": true,
    "speed": 50
  },
  "search_enabled": true
}
```

### channel_*.json 格式

```json
{
  "channelId": "all",
  "page": 1,
  "pageSize": 20,
  "totalCount": 100,
  "totalPages": 5,
  "items": [
    {
      "id": "1",
      "title": "电影标题",
      "type": "movie",
      "poster": "海报URL",
      "video_url": "视频URL"
    }
  ]
}
```

## 广告配置

### 开屏广告
- 位置：`splash_ad`
- 格式：支持图片和脚本
- 倒计时：5秒可跳过
- 点击广告：跳转到指定链接

### 播放页广告
- 位置：`player_ad`
- 格式：支持脚本
- 显示位置：播放器上方

### 模块广告
- 位置：`ad1`, `ad2`, `ad3`
- 格式：支持脚本
- 显示位置：每个推荐模块上方
- 高度：300px
- 宽度：占满屏幕

### 频道广告
- 位置：根据频道ID循环使用ad1/ad2/ad3
- 格式：支持脚本
- 显示位置：频道标题下方

## 翻页功能

频道页支持翻页功能：
- 每页显示20条数据
- 显示当前页码和总页数
- 上一页/下一页按钮
- 自动禁用边界按钮

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器

## 响应式设计

- 桌面端：2列网格布局
- 移动端：2列网格布局
- 自适应屏幕宽度

## 性能优化

- 图片懒加载
- CSS动画优化
- 事件委托
- 防抖处理
- 页面可见性优化

## 注意事项

1. 确保所有图片URL可访问
2. 视频格式建议使用MP4
3. 广告脚本需要符合安全策略
4. 建议使用HTTPS协议
5. 远程API需要配置CORS

## API配置

### 默认配置
默认使用本地 `assets` 目录作为数据源。

### 远程API配置
在浏览器控制台执行：
```javascript
localStorage.setItem('api_url', 'https://your-api-domain.com');
```

刷新页面后生效。

### CORS配置
如果使用远程API，需要确保服务器配置了正确的CORS头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
