# 登录页影视图片来源

下载日期：2026-10-24。三张均来自照片详情页标注的免费 Unsplash License，不是 Unsplash+ 素材。仅作为登录/注册页插图，不表示摄影师或设备品牌对本站背书。

| 本地文件（src/main/resources/static/assets/auth/） | 摄影师 | 原始作品页 | 本地版本 |
| --- | --- | --- | --- |
| studio-desk.webp | Jakub Żerdzicki | [Filmmaker's desk with camera, lenses, and monitors](https://unsplash.com/photos/filmmakers-desk-with-camera-lenses-and-monitors-_XaZCGUFXeE) | 1600 x 2399，WebP |
| studio-lighting.webp | Hossein Nasr | [Professional lighting equipment on a film set](https://unsplash.com/photos/professional-lighting-equipment-on-a-film-set-BKrrf8FAKEo) | 1600 x 1067，WebP |
| studio-editing.webp | Jefferson Sees | [Desk with multiple computer monitors and plants](https://unsplash.com/photos/desk-with-multiple-computer-monitors-and-plants-thpCFCYfoqA) | 1600 x 2395，WebP |

授权依据：[Unsplash License](https://unsplash.com/license)。原作品版权、摄影师署名与作品链接保留在本文档；图片展示区域不叠加文字或按钮。照片通过原站图片CDN的WebP/宽度参数下载，未使用电影海报、剧照或第三方转载图。没有在项目中调用Unsplash API或建立图库服务。

网站从本站 `/assets/auth/` 提供图片，不请求外站图片或使用访客账号/凭据下载。图片仅在显示登录/注册页时开始加载，随JAR一同分发，保持现有仅同源图片的CSP策略。更换图片时应同步核对来源和授权并更新本记录。
