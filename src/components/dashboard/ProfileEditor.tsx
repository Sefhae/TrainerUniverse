'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';
import type { Trainer } from '../../types';
import { AVAILABILITY_OPTIONS, SPECIALTY_OPTIONS } from '../../lib/constants';
import { cn, getApiError } from '../../lib/format';
import { useToast } from '../../hooks/useToast';
import ImageUpload from '../ImageUpload';
import Toggle from '../Toggle';

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
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

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
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => {
              const active = specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialties((list) => toggleInList(list, s))}
                  className={cn(
                    'chip border transition-colors duration-200',
                    active ? 'border-ink bg-ink text-volt' : 'border-ink/20 text-ink/60 hover:border-ink/50'
                  )}
                >
                  {s}
                </button>
              );
            })}
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
                description="Show a 'Remote Available' badge on your profile."
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

        <div className="flex items-center justify-end gap-3 border border-ink/10 bg-white p-4">
          <p className="mr-auto text-sm text-ink/50">Changes are saved to your public profile.</p>
          <button type="submit" disabled={saving} className="btn btn-dark">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-bone border-t-transparent" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
