export default function loadCssFile(url: string, id = 'default') {
  return new Promise<Event>(resolve => {
    const container = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    const version = `v${process.env.VERSION}`;
    link.id = id;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${url}?${version ?? ''}`;
    link.onload = event => {
      resolve(event);
    };
    container.appendChild(link);
  });
}
