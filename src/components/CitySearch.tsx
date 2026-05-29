'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface CityResult {
  name: string;
  country: string;
}

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
  className?: string;
  placeholder?: string;
}

export default function CitySearch({ value, onChange, className, placeholder = 'Search city…' }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/cities?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          const list: CityResult[] = Array.isArray(d.cities) ? d.cities : [];
          setResults(list);
          setOpen(list.length > 0);
          setHighlighted(0);
        })
        .catch(() => {
          /* aborted or failed — ignore */
        });
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(city: CityResult) {
    setQuery(city.name);
    onChange(city.name);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlighted]) select(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length >= 2 && results.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded border border-white/15 bg-[#1a1a1a] shadow-xl">
          {results.map((city, i) => (
            <li
              key={`${city.name}-${city.country}-${i}`}
              onMouseDown={() => select(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${
                i === highlighted ? 'bg-volt/20 text-volt' : 'text-bone/80 hover:bg-white/5'
              }`}
            >
              <MapPin className="h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate">{city.name}</span>
              <span className="ml-auto shrink-0 pl-2 text-xs text-bone/40">{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
