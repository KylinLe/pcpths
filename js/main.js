/* ============================================================
   普陀中学摄影社 — 交互脚本
   导航状态 / 光孔转动 / 滚动显现 / 移动端菜单 / 通知栏 / 下载弹窗 / Safari 提醒弹窗 / 按钮按压反馈 / 平滑锚点
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

  /* ---------- 5. 通知栏（主页可多条堆叠；关闭后同浏览器持久记住，顶栏「通知」可重新显示全部） ---------- */
  var notices = Array.prototype.slice.call(document.querySelectorAll('.notice'));
  if (notices.length) {
    var noticesBox = document.getElementById('notices');
    var storageKey = 'pcpths-notices-closed';
    var closedIds = [];
    try {
      var stored = localStorage.getItem(storageKey) || '';
      // 迁移旧版记录（sessionStorage 仅本次浏览有效 → 持久化）
      if (!stored) stored = sessionStorage.getItem(storageKey) || '';
      if (sessionStorage.getItem('pcpths-plan-notice') === 'closed') {
        stored = stored ? stored + ',notice-plans' : 'notice-plans';
      }
      if (stored) localStorage.setItem(storageKey, stored);
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem('pcpths-plan-notice');
      closedIds = stored.split(',').filter(Boolean);
    } catch (e) {}

    function syncNotices() {
      var visible = notices.filter(function (n) { return document.documentElement.contains(n); });
      document.body.style.setProperty('--notices-h', (visible.length * 44) + 'px');
      document.body.classList.toggle('has-notice', visible.length > 0);
      // 容器始终保留在 DOM 中，以便「通知」入口随时重新显示
    }

    function closeNotice(n) {
      n.remove();
      try {
        var list = (localStorage.getItem(storageKey) || '').split(',').filter(Boolean);
        if (n.id && list.indexOf(n.id) === -1) list.push(n.id);
        localStorage.setItem(storageKey, list.join(','));
      } catch (e) {}
      syncNotices();
    }

    notices.forEach(function (n) {
      if (n.id && closedIds.indexOf(n.id) !== -1) { n.remove(); return; }
      var btn = n.querySelector('.notice-close');
      if (btn) btn.addEventListener('click', function () { closeNotice(n); });
    });

    /* 顶栏「通知」入口：重新显示全部通知，并重播滑入动画作为弹出反馈 */
    Array.prototype.slice.call(document.querySelectorAll('.notices-toggle')).forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        notices.forEach(function (n) {
          if (!document.documentElement.contains(n) && noticesBox) noticesBox.appendChild(n);
        });
        try { localStorage.removeItem(storageKey); } catch (err) {}
        syncNotices();
        if (noticesBox) {
          noticesBox.classList.remove('repop');
          void noticesBox.offsetWidth; /* 强制回流，让动画可重新播放 */
          noticesBox.classList.add('repop');
        }
      });
    });

    syncNotices();
  }

  /* ---------- 6. 下载弹窗（仅带 data-file 的 .dl-btn 触发，弹窗内显示对应文件名） ---------- */
  var dlBtns = Array.prototype.slice.call(document.querySelectorAll('.dl-btn[data-file]'));
  var dlModal = document.getElementById('dlModal');

  if (dlBtns.length && dlModal) {
    var dlClose = document.getElementById('dlModalClose');
    var dlMask = dlModal.querySelector('.modal-mask');
    var dlFile = document.getElementById('dlFile');

    function openModal(name) {
      if (dlFile && name) dlFile.textContent = name;
      dlModal.classList.add('is-open');
    }
    function closeModal() { dlModal.classList.remove('is-open'); }

    dlBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        openModal(b.getAttribute('data-file') || '');
      });
    });
    if (dlClose) dlClose.addEventListener('click', closeModal);
    if (dlMask) dlMask.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dlModal.classList.contains('is-open')) closeModal();
    });
  }

  /* ---------- 7. 苹果版下载：Safari 提醒弹窗，确定后下载并进入安装指南 ---------- */
  var iosBtn = document.getElementById('iosDlBtn');
  var iosModal = document.getElementById('iosModal');

  if (iosBtn && iosModal) {
    var iosConfirm = document.getElementById('iosModalConfirm');
    var iosMask = iosModal.querySelector('.modal-mask');

    function openIosModal() { iosModal.classList.add('is-open'); }
    function closeIosModal() { iosModal.classList.remove('is-open'); }

    iosBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openIosModal();
    });

    if (iosConfirm) iosConfirm.addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = iosBtn.getAttribute('href') || 'downloads/普陀中学摄影社.mobileconfig';
      a.setAttribute('download', '');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.location.href = 'guide/ios-install.html';
    });

    if (iosMask) iosMask.addEventListener('click', closeIosModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && iosModal.classList.contains('is-open')) closeIosModal();
    });
  }

  /* ---------- 8. 按钮按压反馈（按下高亮并放大，光标离开前保持） ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.platform-btn, .plan-item .go, .dl-btn, .modal-btn')).forEach(function (b) {
    b.addEventListener('pointerdown', function () { b.classList.add('is-pressed'); });
    b.addEventListener('pointerleave', function () { b.classList.remove('is-pressed'); });
    b.addEventListener('pointercancel', function () { b.classList.remove('is-pressed'); });
    b.addEventListener('focusout', function () { b.classList.remove('is-pressed'); });
  });

  /* ---------- 9. 锚点平滑滚动（兼容不支持 scroll-behavior 的浏览器） ---------- */
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
