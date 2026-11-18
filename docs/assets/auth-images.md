# 认证首页素材来源

## 暗色透视方块背景

暗色登录页移植自 Aceternity UI 的 Background Cubes Grid 公开组件中的 Perspective 示例。保留圆角方块、橙色波峰、鼠标波纹与空闲波动，并适配 Vue、亮暗分屏、减少动态效果及可见性暂停。Three.js 随应用打包，场景使用实例化绘制，帧率限制为 30 fps，渲染像素数设有上限。[组件及源码](https://ui.aceternity.com/components/background-cubes-grid)

## 瓦解画廊

登录页左下角画廊使用 [Disintegrating Gallery 公开预览](https://ui.aceternity.com/interactions/disintegrating-gallery) 中的五张 Unsplash 照片。本地 WebP 放在 `src/main/resources/static/assets/auth/gallery/`，页面直接从本站加载。

| 本地文件 | 原图 |
| --- | --- |
| `mountain-ridges.webp` | [蓝色山脊](https://images.unsplash.com/photo-1778431193202-b0e2345eeab9) |
| `turquoise-surf.webp` | [碧蓝海浪](https://images.unsplash.com/photo-1505144808419-1957a94ca61e) |
| `sunset-meadow.webp` | [日落草地](https://images.unsplash.com/photo-1470252649378-9c29740c9fa8) |
| `forest-path.webp` | [林间小径](https://images.unsplash.com/photo-1441974231531-c6227db76b6e) |
| `aerial-shore.webp` | [海岸俯瞰](https://images.unsplash.com/photo-1505142468610-359e7d316be0) |

[Unsplash License](https://unsplash.com/license)

## 虚拟键盘音效

键盘外观参考 Aceternity UI 的 [Keyboard](https://ui.aceternity.com/components/keyboard)。音效包为 CherryMX Black - ABS keycaps，使用安装说明提供的 [sound.ogg](https://ui.aceternity.com/sounds/sound.ogg) 和 [config.json](https://ui.aceternity.com/sounds/config.json)。两份资源放在 `src/main/resources/static/assets/auth/keyboard/`，前端打开桌面键盘时从本站加载。各键的采样偏移和时长取自配置，按下、松开分别播放片段。
