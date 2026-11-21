"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * The language switcher in the header. It links to each language's home page; a page that has better targets (an
 * article and its translations) renders <SwitcherTargets>, which points the links there instead. The article also
 * lists its translations as plain links, so nothing depends on JavaScript.
 */

type Targets = Record<string, string>;
const TargetsContext = createContext<{ targets: Targets | null; set: (t: Targets | null) => void }>({ targets: null, set: () => {} });

export function SwitcherProvider({ children }: { children: React.ReactNode }) {
  const [targets, set] = useState<Targets | null>(null);
  return <TargetsContext.Provider value={{ targets, set }}>{children}</TargetsContext.Provider>;
}

/** Points the switcher at these URLs (language → href) while the page is shown. Renders nothing. */
export function SwitcherTargets({ targets }: { targets: Targets }) {
  const { set } = useContext(TargetsContext);
  const key = JSON.stringify(targets);
  useEffect(() => {
    set(JSON.parse(key) as Targets);
    return () => set(null);
  }, [key, set]);
  return null;
}

export interface SwitcherLanguage {
  lang: string;
  name: string;
  dir: "ltr" | "rtl";
  /** This language's home page. */
  href: string;
}

export function LanguageSwitcher({ current, languages }: { current: string; languages: SwitcherLanguage[] }) {
  const { targets } = useContext(TargetsContext);
  const ref = useRef<HTMLDetailsElement>(null);
  const active = languages.find((l) => l.lang === current) ?? languages[0];

  // Close on Escape (focus back on the toggle) and on a click outside.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <details className="langswitch" ref={ref}>
      <summary aria-label={`Language: ${active.name}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
        </svg>
        <span lang={active.lang} dir={active.dir}>{active.name}</span>
      </summary>
      <ul className="langswitch-list">
        {languages.map((l) => (
          <li key={l.lang}>
            {/* A plain link: each language has its own root layout, so this is a full page load either way. */}
            <a
              href={targets?.[l.lang] ?? l.href}
              hrefLang={l.lang}
              lang={l.lang}
              dir={l.dir}
              aria-current={l.lang === current ? "true" : undefined}
            >
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
