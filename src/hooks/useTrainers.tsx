'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import api from '../api/client';
import type { TrainerSummary, TrainersResponse } from '../types';
import { PRICE_MAX, PRICE_MIN } from '../lib/constants';

export interface TrainerFilters {
  specialty: string[];
  minPrice: number;
  maxPrice: number;
  mode: 'all' | 'remote' | 'in-person';
  minRating: number;
  availability: string[];
  experience: string[];
  sort: string;
  city: string;
  state: string;
}

const DEFAULT_SORT = 'top-rated';

function csv(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

export function parseFilters(params: URLSearchParams): TrainerFilters {
  return {
    specialty: csv(params, 'specialty'),
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : PRICE_MIN,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : PRICE_MAX,
    mode: (params.get('mode') as TrainerFilters['mode']) || 'all',
    minRating: params.get('minRating') ? Number(params.get('minRating')) : 0,
    availability: csv(params, 'availability'),
    experience: csv(params, 'experience'),
    sort: params.get('sort') || DEFAULT_SORT,
    city: params.get('city') || '',
    state: params.get('state') || '',
  };
}

function filtersToParams(f: TrainerFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.specialty.length) p.set('specialty', f.specialty.join(','));
  if (f.minPrice > PRICE_MIN) p.set('minPrice', String(f.minPrice));
  if (f.maxPrice < PRICE_MAX) p.set('maxPrice', String(f.maxPrice));
  if (f.mode !== 'all') p.set('mode', f.mode);
  if (f.minRating > 0) p.set('minRating', String(f.minRating));
  if (f.availability.length) p.set('availability', f.availability.join(','));
  if (f.experience.length) p.set('experience', f.experience.join(','));
  if (f.sort !== DEFAULT_SORT) p.set('sort', f.sort);
  if (f.city) p.set('city', f.city);
  if (f.state) p.set('state', f.state);
  return p;
}

export function countActiveFilters(f: TrainerFilters): number {
  let n = 0;
  n += f.specialty.length;
  n += f.availability.length;
  n += f.experience.length;
  if (f.minPrice > PRICE_MIN || f.maxPrice < PRICE_MAX) n += 1;
  if (f.mode !== 'all') n += 1;
  if (f.minRating > 0) n += 1;
  if (f.city) n += 1;
  if (f.state) n += 1;
  return n;
}

export function useTrainers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [trainers, setTrainers] = useState<TrainerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const queryKey = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<TrainersResponse>('/trainers', { params: new URLSearchParams(queryKey) })
      .then((res) => {
        if (cancelled) return;
        setTrainers(res.data.trainers);
        setTotal(res.data.total);
      })
      .catch(() => {
        if (cancelled) return;
        setError('We could not load trainers right now. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const setFilters = useCallback(
    (partial: Partial<TrainerFilters>) => {
      const next = { ...parseFilters(searchParams), ...partial };
      const params = filtersToParams(next);
      router.push(pathname + (params.toString() ? '?' + params.toString() : ''));
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    const sort = parseFilters(searchParams).sort;
    const params = filtersToParams({ ...parseFilters(new URLSearchParams()), sort });
    router.push(pathname + (params.toString() ? '?' + params.toString() : ''));
  }, [searchParams, router, pathname]);

  return {
    trainers,
    total,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount: countActiveFilters(filters),
  };
}
