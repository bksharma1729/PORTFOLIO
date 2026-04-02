(function () {
  const storageKey = 'portfolio-theme';
  const root = document.documentElement;

  function getInitialTheme() {
    const storedTheme = window.localStorage.getItem(storageKey);
    return storedTheme === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    window.localStorage.setItem(storageKey, theme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const isLight = theme === 'light';
      button.setAttribute('aria-pressed', String(isLight));
      button.setAttribute('aria-label', isLight ? 'Switch to default theme' : 'Switch to white theme');
      button.dataset.theme = theme;
    });
  }

  function toggleTheme() {
    applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  }

  applyTheme(getInitialTheme());

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', toggleTheme);
    });
  });
})();
