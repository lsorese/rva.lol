if (typeof document !== 'undefined') {
  (function() {
    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleText(newTheme);
    }

    function initializeTheme() {
      let prefersDark;
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
      updateToggleText(savedTheme || (prefersDark ? 'dark' : 'light'));
    }

    function updateToggleText(theme) {
      const toggle = document.getElementById('theme-toggle');
      toggle.textContent = theme === 'dark' ? 'light' : 'dark';
    }

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    initializeTheme();
  })();
}