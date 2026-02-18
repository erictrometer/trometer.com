document.addEventListener('alpine:init', () => {
  Alpine.data('themeToggle', () => ({
    isDark: document.documentElement.classList.contains('dark'),
    toggle() {
      document.documentElement.classList.add('theme-transitioning');
      this.isDark = !this.isDark;
      document.documentElement.classList.toggle('dark', this.isDark);
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 1000);
    }
  }));
});

(function() {
  var header = document.getElementById('main-header');
  var lastScrollY = window.scrollY;
  var ticking = false;
  function updateHeader() {
    var scrollY = window.scrollY;
    if (scrollY > lastScrollY && scrollY > 80) {
      header.classList.add('-translate-y-full');
    } else {
      header.classList.remove('-translate-y-full');
    }
    lastScrollY = scrollY;
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
})();
