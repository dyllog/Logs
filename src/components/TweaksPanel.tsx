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
    <div className="tweaks">
      <h4><span>Tweaks</span></h4>
      <div className="tw-row">
        <span>Dark mode</span>
        <div className={`sw ${dark ? 'on' : ''}`} onClick={() => setDark(d => !d)} />
      </div>
      <div className="label mt-8" style={{ fontSize: 9, lineHeight: 1.5 }}>
        Archival registers — same ruleset, inverted.
      </div>
    </div>
  );
}
