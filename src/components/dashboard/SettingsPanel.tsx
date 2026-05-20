'use client';

import { useLanguage, useT } from '../../hooks/useLanguage';
import { cn } from '../../lib/format';

export default function SettingsPanel() {
  const t = useT();
  const { lang, setLang } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="border border-ink/10 bg-white p-6">
        <h2 className="font-display text-2xl tracking-wide">{t.dashboard.settings}</h2>
        <p className="mt-1 text-sm text-ink/50">{t.dashboard.settingsDesc}</p>
      </div>

      <div className="border border-ink/10 bg-white p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">
          {t.dashboard.language}
        </h3>
        <p className="mt-1 mb-4 text-sm text-ink/55">
          {t.dashboard.languageDesc}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setLang('en')}
            className={cn(
              'px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] border transition-colors duration-200',
              lang === 'en'
                ? 'bg-ink text-volt border-ink'
                : 'bg-white text-ink/50 border-ink/20 hover:border-ink/50 hover:text-ink'
            )}
          >
            English
          </button>
          <button
            onClick={() => setLang('tr')}
            className={cn(
              'px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] border transition-colors duration-200',
              lang === 'tr'
                ? 'bg-ink text-volt border-ink'
                : 'bg-white text-ink/50 border-ink/20 hover:border-ink/50 hover:text-ink'
            )}
          >
            Türkçe
          </button>
        </div>
      </div>
    </div>
  );
}
