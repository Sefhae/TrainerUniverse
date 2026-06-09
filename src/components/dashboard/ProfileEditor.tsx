'use client';

import { useEffect, useState, type FormEvent, type ReactNode, useRef } from 'react';
import { Check, ChevronDown, Eye, EyeOff, Search, X } from 'lucide-react';
import api from '@/lib/client';
import type { Trainer } from '@/lib/types';
import { AVAILABILITY_OPTIONS, SPECIALTY_GROUPS } from '@/lib/constants';
import { cn, getApiError } from '@/lib/format';
import { useToast } from '@/hooks/useToast';
import ImageUpload from '@/components/ImageUpload';
import Toggle from '@/components/Toggle';

interface Props {
  trainer: Trainer;
  refresh: () => Promise<void>;
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-ink/10 bg-white p-6">
      <h3 className="font-display text-2xl leading-none tracking-wide">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-ink/55">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ProfileEditor({ trainer, refresh }: Props) {
  const toast = useToast();
  const [name, setName] = useState(trainer.name);
  const [tagline, setTagline] = useState(trainer.tagline);
  const [bio, setBio] = useState(trainer.bio);
  const [location, setLocation] = useState(trainer.location);
  const [isRemote, setIsRemote] = useState(trainer.isRemote);
  const [years, setYears] = useState(String(trainer.yearsExperience));
  const [specialties, setSpecialties] = useState<string[]>(trainer.specialties.map((s) => s.name));
  const [availability, setAvailability] = useState<string[]>(trainer.availability);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [specFilter, setSpecFilter] = useState('');
  const specFilterRef = useRef<HTMLInputElement>(null);
  const [specOpen, setSpecOpen] = useState(false);
  const specRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Close the specialties dropdown when clicking outside it.
  useEffect(() => {
    if (!specOpen) return;
    function onDown(e: MouseEvent) {
      if (specRef.current && !specRef.current.contains(e.target as Node)) setSpecOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [specOpen]);

  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await api.put(`/trainers/${trainer.id}`, { isPublished: !trainer.isPublished });
      await refresh();
      toast.success(
        trainer.isPublished ? 'Your profile is now hidden.' : 'Your profile is now live in the directory.'
      );
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setPublishing(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Your name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      if (profileFile || coverFile) {
        const fd = new FormData();
        if (profileFile) fd.append('profilePhoto', profileFile);
        if (coverFile) fd.append('coverPhoto', coverFile);
        await api.post(`/trainers/${trainer.id}/photos`, fd);
      }
      await api.put(`/trainers/${trainer.id}`, {
        name: name.trim(),
        tagline,
        bio,
        location,
        isRemote,
        yearsExperience: Number(years) || 0,
        availability,
        specialties,
      });
      setProfileFile(null);
      setCoverFile(null);
      await refresh();
      toast.success('Your profile has been saved.');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section
        className={cn(
          'flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between',
          trainer.isPublished ? 'border-ink/10 bg-white' : 'border-yellow-300 bg-yellow-50'
        )}
      >
        <div className="flex items-start gap-3">
          {trainer.isPublished ? (
            <Eye className="mt-0.5 h-5 w-5 text-ink" />
          ) : (
            <EyeOff className="mt-0.5 h-5 w-5 text-yellow-700" />
          )}
          <div>
            <p className="font-display text-xl tracking-wide">
              {trainer.isPublished ? 'Profile is Live' : 'Profile is Hidden'}
            </p>
            <p className="mt-0.5 text-sm text-ink/60">
              {trainer.isPublished
                ? 'Clients can find you in the trainer directory.'
                : 'Publish your profile to appear in the directory and search results.'}
            </p>
          </div>
        </div>
        <button
          onClick={togglePublish}
          disabled={publishing}
          className={cn('btn shrink-0', trainer.isPublished ? 'btn-outline-dark' : 'btn-volt')}
        >
          {publishing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : trainer.isPublished ? (
            'Unpublish'
          ) : (
            'Publish Profile'
          )}
        </button>
      </section>

      <form onSubmit={save} className="space-y-5">
        <Card title="Photos" description="Your profile photo and cover image shape the first impression.">
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <ImageUpload
              label="Profile Photo"
              currentUrl={trainer.profilePhoto}
              aspect="square"
              onFileSelected={setProfileFile}
            />
            <ImageUpload
              label="Cover Photo"
              currentUrl={trainer.coverPhoto}
              aspect="wide"
              onFileSelected={setCoverFile}
            />
          </div>
        </Card>

        <Card title="Basic Information">
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="pe-name">
                Display Name
              </label>
              <input
                id="pe-name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="pe-tagline">
                Tagline
              </label>
              <input
                id="pe-tagline"
                className="field-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short, punchy line about your coaching"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="pe-bio">
                About Me
              </label>
              <textarea
                id="pe-bio"
                rows={6}
                className="field-input resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about your background, philosophy and approach..."
              />
            </div>
          </div>
        </Card>

        <Card title="Specialties" description="Select every area you coach in.">
          {/* Selected tags */}
          {specialties.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-ink px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-volt"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSpecialties((list) => list.filter((x) => x !== s))}
                    className="ml-0.5 text-volt/60 hover:text-volt leading-none"
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSpecialties([])}
                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/40 hover:text-ink border border-ink/15 hover:border-ink/40 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Dropdown multi-select */}
          <div ref={specRef} className="relative">
            <button
              type="button"
              onClick={() => setSpecOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 border border-ink/20 bg-white px-4 py-3 text-left text-sm transition-colors duration-200 hover:border-ink/40"
            >
              <span className={specialties.length ? 'text-ink' : 'text-ink/45'}>
                {specialties.length
                  ? `${specialties.length} ${specialties.length === 1 ? 'specialty' : 'specialties'} selected`
                  : 'Select specialties…'}
              </span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200', specOpen && 'rotate-180')}
              />
            </button>

            {specOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 border border-ink/15 bg-white shadow-xl">
                {/* Search */}
                <div className="relative border-b border-ink/10 p-3">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input
                    ref={specFilterRef}
                    type="text"
                    value={specFilter}
                    onChange={(e) => setSpecFilter(e.target.value)}
                    placeholder="Search specialties…"
                    className="field-input pl-9 pr-9"
                  />
                  {specFilter && (
                    <button
                      type="button"
                      onClick={() => { setSpecFilter(''); specFilterRef.current?.focus(); }}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Grouped options */}
                <div className="max-h-72 overflow-y-auto p-3">
                  {(() => {
                    const q = specFilter.trim().toLowerCase();
                    const filtered = SPECIALTY_GROUPS.map((group) => ({
                      ...group,
                      options: q ? group.options.filter((o) => o.toLowerCase().includes(q)) : group.options,
                    })).filter((group) => group.options.length > 0);

                    if (filtered.length === 0) {
                      return <p className="py-4 text-center text-sm text-ink/45">No specialties match &ldquo;{specFilter}&rdquo;</p>;
                    }

                    return filtered.map((group) => {
                      const selectedInGroup = group.options.filter((o) => specialties.includes(o)).length;
                      return (
                        <div key={group.label} className="mb-3 last:mb-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                              {group.label}
                            </span>
                            {selectedInGroup > 0 && (
                              <span className="rounded-full bg-volt px-1.5 py-0.5 text-[10px] font-bold text-ink">
                                {selectedInGroup}
                              </span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            {group.options.map((s) => {
                              const active = specialties.includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setSpecialties((list) => toggleInList(list, s))}
                                  className={cn(
                                    'flex w-full items-center gap-2.5 px-2 py-1.5 text-left text-sm transition-colors duration-150',
                                    active ? 'text-ink' : 'text-ink/65 hover:bg-ink/5'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex h-4 w-4 shrink-0 items-center justify-center border',
                                      active ? 'border-ink bg-ink text-volt' : 'border-ink/30'
                                    )}
                                  >
                                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                  </span>
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Location & Availability">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="pe-location">
                  Location
                </label>
                <input
                  id="pe-location"
                  className="field-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pe-years">
                  Years of Experience
                </label>
                <input
                  id="pe-years"
                  type="number"
                  min={0}
                  max={60}
                  className="field-input"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-ink/10 p-4">
              <Toggle
                checked={isRemote}
                onChange={setIsRemote}
                label="Offer Remote Training"
                description="Clients will see a 'Remote Available' badge on your profile. Set a location too to offer both in-person and remote."
              />
            </div>

            <div>
              <label className="field-label">General Availability</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((a) => {
                  const active = availability.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAvailability((list) => toggleInList(list, a.value))}
                      className={cn(
                        'chip border transition-colors duration-200',
                        active
                          ? 'border-ink bg-ink text-volt'
                          : 'border-ink/20 text-ink/60 hover:border-ink/50'
                      )}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border border-ink/10 bg-white/95 p-4 shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.3)] backdrop-blur">
          <p className="mr-auto text-sm text-ink/50">Changes are saved to your public profile.</p>
          <button type="submit" disabled={saving} className="btn btn-volt">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
