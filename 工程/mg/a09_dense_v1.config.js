/* 单条后期试片：所有路径相对 工程/mg；不调用任何生成模型。 */
(function (root) {
  const config = {
    width: 1920, height: 1080, fps: 30, duration: 3,
    source: '../../素材/AI镜头/arena_A09_Flash1017_v4_00001.mp4',
    sourceSha256: '293c1f0fb4c60ddd6a4e87d0ccd8fd751b020da7914058c3992cc9623df21ede',
    music: '../../音频/江湖之间.mp4',
    musicStart: 70.4,
    lyric: '忘不了惊鸿一眼',
    output: '../../素材/AI镜头/A09_Flash1017_信息密度增强_v2_正式更新.mp4',
    checkPoster: '../../素材/示例镜头/预览帧/A09_信息密度增强_v2_检查.jpg',
    libraries: { animejs: '3.2.2', lottieWeb: '5.12.2' }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  else root.A09_CONFIG = config;
})(globalThis);
