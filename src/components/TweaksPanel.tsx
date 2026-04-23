import { useState, useEffect } from 'react';

export default function TweaksPanel() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('logs.dark');
    if (stored === '1') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('logs.dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <div className="tweaks" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <div className={`sw ${dark ? 'on' : ''}`} onClick={() => setDark(d => !d)} />
    </div>
  );
}
