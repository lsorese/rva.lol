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
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'light'); // Default to light mode
      }
      updateToggleText(savedTheme || 'light'); // Default to light mode
    }

    function updateToggleText(theme) {
      const toggle = document.getElementById('theme-toggle');
      toggle.textContent = theme === 'dark' ? 'light' : 'dark';
    }

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    initializeTheme();
  })();
}