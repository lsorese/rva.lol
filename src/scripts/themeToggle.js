(function() {
    function toggleTheme() {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  
    function initializeTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
      initializeTheme();
    });
  })();
  