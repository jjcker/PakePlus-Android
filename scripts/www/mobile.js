/* ============================================================
   mobile.js — 手机版专属适配
   ------------------------------------------------------------
   1. 取消 1920×1080 固定舞台缩放，改用响应式手机布局
   2. 手机菜单（保存 / 返回存档 / 称号 / 关于）
   3. 触摸细节：阻止双击缩放、长按菜单、软键盘回车收起
   电脑端仍保留等比缩放，方便在宽屏上预览。
   ============================================================ */
(function(){
  'use strict';

  var MOBILE_MAX_WIDTH = 1024;

  function isMobileLayout(){
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var narrow = window.innerWidth <= MOBILE_MAX_WIDTH;
    var screenW = (window.screen && window.screen.width) || 9999;
    var smallScreen = screenW <= MOBILE_MAX_WIDTH;
    return narrow || smallScreen || (coarse && window.innerWidth <= 1366);
  }

  function syncMobileClass(){
    var mobile = isMobileLayout();
    document.documentElement.classList.toggle('mobile', mobile);
    document.body.classList.toggle('mobile', mobile);
    document.body.classList.toggle('touch-ui', !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
    return mobile;
  }

  /* 覆盖 main.js 的固定画布缩放（其 resize 监听会调用这个同名全局函数） */
  window.fitGameStage = function fitGameStage(){
    if(syncMobileClass()){
      window.__gameScale = 1;
      document.body.style.transform = 'none';
      document.documentElement.style.setProperty('--app-vh', (window.innerHeight * 0.01) + 'px');
      return;
    }
    var w = window.innerWidth || 1920;
    var h = window.innerHeight || 1080;
    var s = Math.min(w / 1920, h / 1080);
    window.__gameScale = s;
    document.body.style.transform = 'scale(' + (Math.round(s * 10000) / 10000) + ')';
  };

  /* DOM 就绪后立即应用一次（main.js 已先执行过一次旧版缩放） */
  function boot(){
    syncMobileClass();
    window.fitGameStage();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
  window.addEventListener('resize', window.fitGameStage);
  window.addEventListener('orientationchange', function(){
    setTimeout(window.fitGameStage, 120);
  });

  /* ---------- 手机菜单 ---------- */
  window.openMobileMenu = function(){
    if(!document.getElementById('gameScreen').style.display ||
       document.getElementById('gameScreen').style.display === 'none') return;
    closeMobileMenu();
    var timeEl = document.getElementById('mobileMenuTime');
    var src = document.getElementById('uiTimeBtn');
    if(timeEl && src) timeEl.textContent = src.textContent || '—';
    document.getElementById('mobileMenuModal').classList.add('show');
  };
  window.closeMobileMenu = function(){
    var el = document.getElementById('mobileMenuModal');
    if(el) el.classList.remove('show');
  };
  window.mobileMenuSave = function(){
    closeMobileMenu();
    if(typeof manualSave === 'function') manualSave();
  };
  window.mobileMenuSaves = function(){
    closeMobileMenu();
    if(typeof backToSaveScreen === 'function') backToSaveScreen();
  };
  window.mobileMenuTitle = function(){
    closeMobileMenu();
    if(typeof openTitle === 'function') openTitle();
  };
  window.mobileMenuAbout = function(){
    closeMobileMenu();
    if(typeof showAbout === 'function') showAbout();
  };
  window.mobileMenuDebug = function(){
    closeMobileMenu();
    /* 手机版测试用：跳过密码输入，直接打开原调试面板 */
    if(typeof openDebugModal === 'function') openDebugModal();
  };

  /* 点遮罩空白处关闭菜单 */
  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'mobileMenuModal') closeMobileMenu();
  });

  /* ---------- 触摸细节 ---------- */
  /* 防止地图/按钮长按弹出系统菜单 */
  document.addEventListener('contextmenu', function(e){
    if(document.body.classList.contains('mobile')) e.preventDefault();
  }, {passive:false});

  /* ============================================================
     抑制下拉刷新 / 橡皮筋回弹
     ------------------------------------------------------------
     打包成 App 后，WebView 在页面顶部继续下拉会触发原生下拉刷新，
     松手后页面被顶下去，战斗中很容易误触。
     这里在“所有可滚动容器都已经到顶”时拦截向下拖拽的 touchmove，
     既不影响列表内部滚动，也不会再触发 WebView 的刷新手势。
     ============================================================ */
  var pullStartY = 0, pullStartX = 0, pullTracking = false;

  function scrollableAncestorCanScrollUp(node){
    for(var el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement){
      var cs;
      try{ cs = window.getComputedStyle(el); }catch(e){ continue; }
      if(!/(auto|scroll|overlay)/.test(cs.overflowY)) continue;
      if(el.scrollHeight <= el.clientHeight + 1) continue;
      if(el.scrollTop > 0) return true;
    }
    var se = document.scrollingElement || document.documentElement;
    return (se && se.scrollTop > 0) || window.scrollY > 0;
  }

  document.addEventListener('touchstart', function(e){
    if(!document.body.classList.contains('mobile') || e.touches.length !== 1){
      pullTracking = false;
      return;
    }
    pullStartY = e.touches[0].clientY;
    pullStartX = e.touches[0].clientX;
    pullTracking = true;
  }, {passive:true});

  document.addEventListener('touchmove', function(e){
    if(!pullTracking || !document.body.classList.contains('mobile') || e.touches.length !== 1) return;
    var t = e.touches[0];
    var dy = t.clientY - pullStartY;
    var dx = t.clientX - pullStartX;
    /* 只拦截“向下拖、且所有内容已经到顶”的手势 */
    if(dy <= 0 || Math.abs(dx) > Math.abs(dy)) return;
    if(scrollableAncestorCanScrollUp(e.target)) return;
    if(e.cancelable) e.preventDefault();
  }, {passive:false});

  function endPull(){ pullTracking = false; }
  document.addEventListener('touchend', endPull, {passive:true});
  document.addEventListener('touchcancel', endPull, {passive:true});

  /* 手机软键盘：回车后收起键盘，避免挡住弹窗按钮 */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' || !document.body.classList.contains('mobile')) return;
    var t = e.target;
    if(t && /^(INPUT|TEXTAREA)$/.test(t.tagName || '')){
      t.blur();
    }
  });

  /* 剧情弹窗在手机上可能被键盘顶起，聚焦结束时复位滚动 */
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', function(){
      if(!document.body.classList.contains('mobile')) return;
      document.documentElement.style.setProperty('--vvh', window.visualViewport.height + 'px');
    });
  }
})();
