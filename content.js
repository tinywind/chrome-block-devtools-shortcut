document.addEventListener(
  'keydown',
  (event) => {
    if (
      event.ctrlKey &&
      event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      event.code === 'KeyC'
    ) {
      event.preventDefault();
      try {
        document.execCommand('copy');
      } catch (_) {}
    }
  },
  true,
);
