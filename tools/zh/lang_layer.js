/* 中英双语切换层 —— TMT (The Tree of Life)
 * 由汉化流程注入。约定：
 *   - 中文版在站点根目录（index.html + js/ 已是中文源码）
 *   - 英文原版在 en/ 子目录（index.html + js/ 原样）
 *   - localStorage key: 'totl_lang'  ('zh' | 'en')
 *   - 设置面板按钮调用 switchLanguage()
 */
(function () {
  var KEY = 'totl_lang';

  function current() {
    try { return localStorage.getItem(KEY) || 'zh'; } catch (e) { return 'zh'; }
  }

  // 页面加载时：根据偏好，若当前页语言与偏好不符则跳转一次。
  // 通过 URL 参数 ?lang= 显式指定时优先，避免死循环。
  function boot() {
    var params = new URLSearchParams(location.search);
    var forced = params.get('lang');
    var pref = forced || current();
    var isEnPage = location.pathname.replace(/\\/g, '/').indexOf('/en/') !== -1 ||
                   /\/index\.en\.html$/.test(location.pathname);

    if (pref === 'en' && !isEnPage) {
      location.replace('en/index.html?lang=en');
      return;
    }
    if (pref === 'zh' && isEnPage) {
      location.replace('../index.html?lang=zh');
      return;
    }
    try { localStorage.setItem(KEY, pref); } catch (e) {}
  }

  // 设置面板按钮：切换语言并跳转
  window.switchLanguage = function () {
    var next = current() === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    var isEnPage = location.pathname.replace(/\\/g, '/').indexOf('/en/') !== -1 ||
                   /\/index\.en\.html$/.test(location.pathname);
    if (next === 'en') {
      location.href = isEnPage ? 'index.html?lang=en' : 'en/index.html?lang=en';
    } else {
      location.href = isEnPage ? '../index.html?lang=zh' : 'index.html?lang=zh';
    }
  };

  window.getLangLabel = function () {
    return current() === 'zh' ? '中文' : 'English';
  };

  boot();
})();
