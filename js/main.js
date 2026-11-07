/* ============================================================
   普陀中学摄影社 — 交互脚本
   导航状态 / 光孔转动 / 滚动显现 / 移动端菜单 / 平滑锚点
   ============================================================ */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 导航滚动状态 ---------- */
  var nav = document.getElementById('nav');
  var lastY = -1;
  function onScrollNav() {
    if (!nav) return;
    var y = window.scrollY || window.pageYOffset;
    if (y === lastY) return;
    lastY = y;
    nav.classList.toggle('is-scrolled', y > 8);
  }

  /* ---------- 2. 光孔随滚动缓慢转动（对焦感） ---------- */
  var aperture = document.getElementById('aperture');
  function onScrollAperture() {
    if (!aperture || reduce) return;
    var y = window.scrollY || window.pageYOffset;
    var rot = Math.min(y * 0.06, 36);
    aperture.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScrollNav();
      onScrollAperture();
      ticking = false;
    });
  }, { passive: true });
  onScrollNav();
  onScrollAperture();

  /* ---------- 3. 滚动显现 ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // 同组元素依次入场
        var siblings = Array.prototype.slice.call(
          el.parentNode.querySelectorAll(':scope > .reveal')
        );
        var i = Math.max(siblings.indexOf(el), 0);
        el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. 移动端菜单 ---------- */
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');

  if (btn && menu) {
    function closeMenu() {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* ---------- 5. 锚点平滑滚动（兼容不支持 scroll-behavior 的浏览器） ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 64);
      });
    });
  }
})();
