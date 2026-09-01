
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return; // Ignore chrome-extension://, localmedia://, blob:, etc.
  }

});
