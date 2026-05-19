'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays,
  LogOut, Trash2, Eye, EyeOff, ShieldCheck, Pencil, Plus, X, Star, Camera, UserCircle, KeyRound,
} from 'lucide-react';
import { useAdminAuth } from '../../../src/hooks/useAdminAuth';
import api from '../../../src/api/client';
import { cn } from '../../../src/lib/format';
import CitySearch from '../../../src/components/CitySearch';

type Section = 'overview' | 'trainers' | 'students' | 'sessions';

const SEEDED_TRAINER_EMAILS = new Set([
  'marcus@fitconnect.com', 'sofia@fitconnect.com', 'darnell@fitconnect.com',
  'elena@fitconnect.com', 'jordan@fitconnect.com', 'aisha@fitconnect.com',
  'tommy@fitconnect.com', 'grace@fitconnect.com',
]);

const SEEDED_STUDENT_EMAILS = new Set([
  'demo.student@fitconnect.com', 'alex@student.com', 'emma@student.com',
  'cem@student.com', 'sara@student.com',
]);

interface Stats { trainers: number; published: number; students: number; sessions: number; messages: number; }
interface AdminTrainer { id: number; name: string; email: string; specialties: string | null; is_published: number; student_count: number; session_count: number; created_at: string; }
interface AdminStudent { id: number; name: string; email: string; trainer_name: string | null; session_count: number; created_at: string; }
interface AdminSession { id: number; title: string; trainer_name: string; student_name: string; scheduled_at: string; duration_min: number; status: string; notes?: string; }
interface TrainerProfile { id: number; name: string; tagline: string; bio: string; location: string; is_remote: number; years_experience: number; email: string; profile_photo: string | null; cover_photo: string | null; }
interface PricingPackage { id: number; trainer_id: number; name: string; description: string; sessions: number; price: number; is_popular: number; }
interface StudentDetail { id: number; user_id: number; name: string; email: string; created_at: string; }

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'trainers', label: 'Trainers', icon: Users },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'sessions', label: 'Sessions', icon: CalendarDays },
];

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-volt" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'confirmed' ? 'bg-volt/20 text-volt' :
    status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
    'bg-yellow-500/20 text-yellow-400';
  return (
    <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', cls)}>
      {status}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-bone/40">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-bone placeholder-bone/30 focus:border-volt/50 focus:outline-none';

/* ─── Trainer Modal ─── */
function TrainerModal({ trainerId, onClose, onSaved }: { trainerId: number; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<'profile' | 'pricing' | 'credentials'>('profile');
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<'profile' | 'cover' | null>(null);
  const [creds, setCreds] = useState({ email: '', password: '', confirmPassword: '' });
  const [credsError, setCredsError] = useState('');
  const [credsSaved, setCredsSaved] = useState(false);

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);

  const [editingPkg, setEditingPkg] = useState<PricingPackage | null>(null);
  const [addingPkg, setAddingPkg] = useState(false);
  const emptyPkg = { name: '', description: '', sessions: 1, price: 0, isPopular: false };
  const [newPkg, setNewPkg] = useState(emptyPkg);

  useEffect(() => {
    Promise.all([
      api.get<TrainerProfile>(`/admin/trainers/${trainerId}`),
      api.get<PricingPackage[]>(`/admin/trainers/${trainerId}/packages`),
    ]).then(([p, pkg]) => {
      setProfile(p.data);
      setPackages(pkg.data);
      setCreds({ email: p.data.email, password: '', confirmPassword: '' });
    }).finally(() => setLoadingProfile(false));
  }, [trainerId]);

  async function uploadPhoto(type: 'profilePhoto' | 'coverPhoto', file?: File) {
    if (!file || !profile) return;
    setUploadingPhoto(type === 'profilePhoto' ? 'profile' : 'cover');
    try {
      const formData = new FormData();
      formData.append(type, file);
      const { data } = await api.post<{ profilePhoto?: string; coverPhoto?: string }>(
        `/admin/trainers/${trainerId}/photos`, formData
      );
      if (data.profilePhoto) setProfile({ ...profile, profile_photo: data.profilePhoto });
      if (data.coverPhoto) setProfile({ ...profile, cover_photo: data.coverPhoto });
    } finally {
      setUploadingPhoto(null);
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put(`/admin/trainers/${trainerId}/profile`, {
        name: profile.name,
        tagline: profile.tagline,
        bio: profile.bio,
        location: profile.location,
        yearsExperience: profile.years_experience,
        isRemote: profile.is_remote,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function saveCredentials() {
    setCredsError('');
    setCredsSaved(false);
    if (!creds.email) { setCredsError('Email is required.'); return; }
    if (creds.password && creds.password !== creds.confirmPassword) { setCredsError('Passwords do not match.'); return; }
    if (creds.password && creds.password.length < 6) { setCredsError('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      await api.put(`/admin/trainers/${trainerId}/credentials`, {
        email: creds.email,
        ...(creds.password ? { password: creds.password } : {}),
      });
      setCredsSaved(true);
      setCreds((c) => ({ ...c, password: '', confirmPassword: '' }));
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setCredsError(msg || 'Failed to update credentials.');
    } finally {
      setSaving(false);
    }
  }

  async function savePkg() {
    if (!editingPkg) return;
    setSaving(true);
    try {
      await api.put(`/admin/packages/${editingPkg.id}`, {
        name: editingPkg.name,
        description: editingPkg.description,
        sessions: editingPkg.sessions,
        price: editingPkg.price,
        isPopular: editingPkg.is_popular,
      });
      setPackages((p) => p.map((x) => x.id === editingPkg.id ? editingPkg : x));
      setEditingPkg(null);
    } finally {
      setSaving(false);
    }
  }

  async function deletePkg(id: number) {
    if (!confirm('Delete this package?')) return;
    await api.delete(`/admin/packages/${id}`);
    setPackages((p) => p.filter((x) => x.id !== id));
  }

  async function createPkg() {
    setSaving(true);
    try {
      const { data } = await api.post<{ id: number }>(`/admin/trainers/${trainerId}/packages`, {
        name: newPkg.name,
        description: newPkg.description,
        sessions: newPkg.sessions,
        price: newPkg.price,
        isPopular: newPkg.isPopular,
      });
      setPackages((p) => [...p, { id: Number(data.id), trainer_id: trainerId, name: newPkg.name, description: newPkg.description, sessions: newPkg.sessions, price: newPkg.price, is_popular: newPkg.isPopular ? 1 : 0 }]);
      setNewPkg(emptyPkg);
      setAddingPkg(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded border border-white/10 bg-[#111] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="font-display text-lg tracking-wide">{profile?.name ?? 'Trainer'}</p>
            <p className="text-xs text-bone/40">{profile?.email}</p>
          </div>
          <button onClick={onClose} className="p-1 text-bone/40 hover:text-bone"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex border-b border-white/10">
          {(['profile', 'pricing', 'credentials'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors', tab === t ? 'border-b-2 border-volt text-volt' : 'text-bone/40 hover:text-bone')}
            >
              {t === 'credentials' && <KeyRound className="h-3 w-3" />}
              {t === 'profile' ? 'Profile' : t === 'pricing' ? 'Pricing' : 'Credentials'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loadingProfile ? <Spinner /> : (
            <>
              {/* Profile Tab */}
              {tab === 'profile' && profile && (
                <div className="space-y-4">
                  {/* Photos */}
                  <div className="flex gap-5 pb-2">
                    {/* Profile photo */}
                    <div className="flex flex-col items-center gap-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-bone/40">Profile Photo</p>
                      <div className="relative h-20 w-20 overflow-hidden rounded border border-white/10 bg-white/5">
                        {profile.profile_photo ? (
                          <Image src={profile.profile_photo} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <UserCircle className="m-auto mt-4 h-10 w-10 text-bone/20" />
                        )}
                      </div>
                      <input ref={profilePhotoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => uploadPhoto('profilePhoto', e.target.files?.[0])} />
                      <button
                        onClick={() => profilePhotoRef.current?.click()}
                        disabled={!!uploadingPhoto}
                        className="flex items-center gap-1 text-[11px] text-volt hover:underline disabled:opacity-40"
                      >
                        <Camera className="h-3 w-3" />
                        {uploadingPhoto === 'profile' ? 'Uploading…' : 'Change'}
                      </button>
                    </div>
                    {/* Cover photo */}
                    <div className="flex flex-col items-center gap-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-bone/40">Cover Photo</p>
                      <div className="relative h-20 w-44 overflow-hidden rounded border border-white/10 bg-white/5">
                        {profile.cover_photo ? (
                          <Image src={profile.cover_photo} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <Camera className="m-auto mt-6 h-7 w-7 text-bone/20" />
                        )}
                      </div>
                      <input ref={coverPhotoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => uploadPhoto('coverPhoto', e.target.files?.[0])} />
                      <button
                        onClick={() => coverPhotoRef.current?.click()}
                        disabled={!!uploadingPhoto}
                        className="flex items-center gap-1 text-[11px] text-volt hover:underline disabled:opacity-40"
                      >
                        <Camera className="h-3 w-3" />
                        {uploadingPhoto === 'cover' ? 'Uploading…' : 'Change'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Name">
                      <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </Field>
                    <Field label="Location">
                      <CitySearch
                        className={inputCls}
                        value={profile.location ?? ''}
                        onChange={(city) => setProfile({ ...profile, location: city })}
                      />
                    </Field>
                  </div>
                  <Field label="Tagline">
                    <input className={inputCls} value={profile.tagline ?? ''} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} />
                  </Field>
                  <Field label="Bio">
                    <textarea className={cn(inputCls, 'h-28 resize-none')} value={profile.bio ?? ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Years of Experience">
                      <input type="number" min={0} className={inputCls} value={profile.years_experience} onChange={(e) => setProfile({ ...profile, years_experience: Number(e.target.value) })} />
                    </Field>
                    <Field label="Remote">
                      <div className="flex h-[38px] items-center">
                        <label className="flex cursor-pointer items-center gap-3">
                          <div
                            onClick={() => setProfile({ ...profile, is_remote: profile.is_remote ? 0 : 1 })}
                            className={cn('relative h-5 w-9 rounded-full transition-colors', profile.is_remote ? 'bg-volt' : 'bg-white/15')}
                          >
                            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', profile.is_remote ? 'left-[18px]' : 'left-0.5')} />
                          </div>
                          <span className="text-sm text-bone/70">{profile.is_remote ? 'Yes' : 'No'}</span>
                        </label>
                      </div>
                    </Field>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveProfile} disabled={saving} className="btn btn-volt btn-sm px-6">
                      {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              )}

              {/* Credentials Tab */}
              {tab === 'credentials' && (
                <div className="space-y-4">
                  <p className="text-xs text-bone/40">Change this trainer&apos;s login email or password. Leave password blank to keep the current one.</p>
                  {credsError && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{credsError}</p>}
                  {credsSaved && <p className="rounded border border-volt/30 bg-volt/10 px-3 py-2 text-xs text-volt">Credentials updated successfully.</p>}
                  <Field label="Email">
                    <input type="email" className={inputCls} value={creds.email} onChange={(e) => { setCreds((c) => ({ ...c, email: e.target.value })); setCredsSaved(false); }} />
                  </Field>
                  <Field label="New Password">
                    <input type="password" className={inputCls} placeholder="Leave blank to keep current password" value={creds.password} onChange={(e) => { setCreds((c) => ({ ...c, password: e.target.value })); setCredsSaved(false); }} />
                  </Field>
                  <Field label="Confirm New Password">
                    <input type="password" className={inputCls} placeholder="Repeat new password" value={creds.confirmPassword} onChange={(e) => { setCreds((c) => ({ ...c, confirmPassword: e.target.value })); setCredsSaved(false); }} />
                  </Field>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveCredentials} disabled={saving} className="btn btn-volt btn-sm px-6">
                      {saving ? 'Saving…' : 'Update Credentials'}
                    </button>
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {tab === 'pricing' && (
                <div className="space-y-3">
                  {packages.length === 0 && !addingPkg && (
                    <p className="py-4 text-center text-sm text-bone/40">No packages yet.</p>
                  )}

                  {packages.map((pkg) => (
                    <div key={pkg.id} className="rounded border border-white/10 bg-white/4">
                      {editingPkg?.id === pkg.id ? (
                        <div className="space-y-3 p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Name">
                              <input className={inputCls} value={editingPkg.name} onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })} />
                            </Field>
                            <Field label="Sessions (0 = unlimited)">
                              <input type="number" min={0} className={inputCls} value={editingPkg.sessions} onChange={(e) => setEditingPkg({ ...editingPkg, sessions: Number(e.target.value) })} />
                            </Field>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Price ($)">
                              <input type="number" min={0} step={0.01} className={inputCls} value={editingPkg.price} onChange={(e) => setEditingPkg({ ...editingPkg, price: Number(e.target.value) })} />
                            </Field>
                            <Field label="Popular">
                              <div className="flex h-[38px] items-center">
                                <label className="flex cursor-pointer items-center gap-3">
                                  <div
                                    onClick={() => setEditingPkg({ ...editingPkg, is_popular: editingPkg.is_popular ? 0 : 1 })}
                                    className={cn('relative h-5 w-9 rounded-full transition-colors', editingPkg.is_popular ? 'bg-volt' : 'bg-white/15')}
                                  >
                                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', editingPkg.is_popular ? 'left-[18px]' : 'left-0.5')} />
                                  </div>
                                  <span className="text-sm text-bone/70">{editingPkg.is_popular ? 'Yes' : 'No'}</span>
                                </label>
                              </div>
                            </Field>
                          </div>
                          <Field label="Description">
                            <input className={inputCls} value={editingPkg.description ?? ''} onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })} />
                          </Field>
                          <div className="flex gap-2 pt-1">
                            <button onClick={savePkg} disabled={saving} className="btn btn-volt btn-sm px-4">{saving ? 'Saving…' : 'Save'}</button>
                            <button onClick={() => setEditingPkg(null)} className="btn btn-sm border border-white/10 px-4 text-bone/60 hover:text-bone">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{pkg.name}</span>
                              {!!pkg.is_popular && <Star className="h-3 w-3 fill-volt text-volt" />}
                            </div>
                            <div className="mt-0.5 flex gap-3 text-xs text-bone/50">
                              <span>${pkg.price}</span>
                              <span>·</span>
                              <span>{pkg.sessions === 0 ? 'Unlimited' : `${pkg.sessions} session${pkg.sessions !== 1 ? 's' : ''}`}</span>
                              {pkg.description && <><span>·</span><span className="truncate max-w-[160px]">{pkg.description}</span></>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditingPkg(pkg)} className="p-1.5 text-bone/40 hover:text-volt"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deletePkg(pkg.id)} className="p-1.5 text-bone/40 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new package */}
                  {addingPkg ? (
                    <div className="rounded border border-volt/30 bg-white/4 p-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-volt">New Package</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Name">
                          <input className={inputCls} placeholder="e.g. Monthly" value={newPkg.name} onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} />
                        </Field>
                        <Field label="Sessions (0 = unlimited)">
                          <input type="number" min={0} className={inputCls} value={newPkg.sessions} onChange={(e) => setNewPkg({ ...newPkg, sessions: Number(e.target.value) })} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Price ($)">
                          <input type="number" min={0} step={0.01} className={inputCls} value={newPkg.price} onChange={(e) => setNewPkg({ ...newPkg, price: Number(e.target.value) })} />
                        </Field>
                        <Field label="Popular">
                          <div className="flex h-[38px] items-center">
                            <label className="flex cursor-pointer items-center gap-3">
                              <div
                                onClick={() => setNewPkg({ ...newPkg, isPopular: !newPkg.isPopular })}
                                className={cn('relative h-5 w-9 rounded-full transition-colors', newPkg.isPopular ? 'bg-volt' : 'bg-white/15')}
                              >
                                <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', newPkg.isPopular ? 'left-[18px]' : 'left-0.5')} />
                              </div>
                              <span className="text-sm text-bone/70">{newPkg.isPopular ? 'Yes' : 'No'}</span>
                            </label>
                          </div>
                        </Field>
                      </div>
                      <Field label="Description">
                        <input className={inputCls} placeholder="Short description" value={newPkg.description} onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })} />
                      </Field>
                      <div className="flex gap-2 pt-1">
                        <button onClick={createPkg} disabled={saving || !newPkg.name} className="btn btn-volt btn-sm px-4 disabled:opacity-40">{saving ? 'Adding…' : 'Add Package'}</button>
                        <button onClick={() => { setAddingPkg(false); setNewPkg(emptyPkg); }} className="btn btn-sm border border-white/10 px-4 text-bone/60 hover:text-bone">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingPkg(true)} className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-white/15 py-3 text-sm text-bone/40 transition-colors hover:border-volt/40 hover:text-volt">
                      <Plus className="h-4 w-4" /> Add Package
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Session Edit Modal ─── */
function SessionModal({ session, onClose, onSaved }: { session: AdminSession; onClose: () => void; onSaved: (updated: AdminSession) => void }) {
  const [form, setForm] = useState({
    title: session.title,
    scheduledAt: session.scheduled_at.slice(0, 16),
    durationMin: session.duration_min,
    status: session.status,
    notes: session.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/admin/sessions/${session.id}`, {
        title: form.title,
        scheduledAt: form.scheduledAt,
        durationMin: form.durationMin,
        status: form.status,
        notes: form.notes,
      });
      onSaved({ ...session, title: form.title, scheduled_at: form.scheduledAt, duration_min: form.durationMin, status: form.status, notes: form.notes });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded border border-white/10 bg-[#111] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <p className="font-display text-lg tracking-wide">Edit Session</p>
          <button onClick={onClose} className="p-1 text-bone/40 hover:text-bone"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-2 rounded border border-white/8 bg-white/4 px-4 py-3 text-xs text-bone/50">
            <span><span className="text-bone/30">Trainer: </span>{session.trainer_name}</span>
            <span><span className="text-bone/30">Student: </span>{session.student_name}</span>
          </div>
          <Field label="Title">
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Scheduled At">
              <input type="datetime-local" className={inputCls} value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </Field>
            <Field label="Duration (min)">
              <input type="number" min={15} step={15} className={inputCls} value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea className={cn(inputCls, 'h-20 resize-none')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes…" />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn btn-sm border border-white/10 px-5 text-bone/60 hover:text-bone">Cancel</button>
            <button onClick={save} disabled={saving} className="btn btn-volt btn-sm px-6">{saving ? 'Saving…' : 'Save Session'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Student Edit Modal ─── */
function StudentModal({ studentId, onClose, onSaved }: { studentId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<StudentDetail>(`/admin/students/${studentId}`).then(({ data }) => {
      setForm({ name: data.name, email: data.email, password: '', confirmPassword: '' });
    }).finally(() => setLoading(false));
  }, [studentId]);

  async function save() {
    setError('');
    setSaved(false);
    if (!form.name) { setError('Name is required.'); return; }
    if (!form.email) { setError('Email is required.'); return; }
    if (form.password && form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      await api.put(`/admin/students/${studentId}`, {
        name: form.name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      });
      setSaved(true);
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to update student.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded border border-white/10 bg-[#111] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <p className="font-display text-lg tracking-wide">Edit Student</p>
          <button onClick={onClose} className="p-1 text-bone/40 hover:text-bone"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          {loading ? <div className="flex justify-center py-6"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-volt" /></div> : (
            <>
              <p className="text-xs text-bone/40">Edit the student&apos;s name, email, or password. Leave password blank to keep the current one.</p>
              {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              {saved && <p className="rounded border border-volt/30 bg-volt/10 px-3 py-2 text-xs text-volt">Student updated successfully.</p>}
              <Field label="Full Name">
                <input className={inputCls} value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setSaved(false); }} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.email} onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setSaved(false); }} />
              </Field>
              <Field label="New Password">
                <input type="password" className={inputCls} placeholder="Leave blank to keep current password" value={form.password} onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setSaved(false); }} />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" className={inputCls} placeholder="Repeat new password" value={form.confirmPassword} onChange={(e) => { setForm((f) => ({ ...f, confirmPassword: e.target.value })); setSaved(false); }} />
              </Field>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={onClose} className="btn btn-sm border border-white/10 px-5 text-bone/60 hover:text-bone">Close</button>
                <button onClick={save} disabled={saving} className="btn btn-volt btn-sm px-6">{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Trainer Modal ─── */
function AddTrainerModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: AdminTrainer) => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function create() {
    setError('');
    if (!form.name || !form.email || form.password.length < 6) {
      setError('Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post<AdminTrainer>('/admin/trainers', form);
      onCreated(data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to create trainer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded border border-white/10 bg-[#111] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <p className="font-display text-lg tracking-wide">Add Trainer</p>
          <button onClick={onClose} className="p-1 text-bone/40 hover:text-bone"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-xs text-bone/40">The trainer will be created and <span className="text-volt">published immediately</span> — visible on Find a Trainer.</p>
          {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          <Field label="Full Name">
            <input className={inputCls} placeholder="e.g. John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} placeholder="trainer@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password">
            <input type="password" className={inputCls} placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn btn-sm border border-white/10 px-5 text-bone/60 hover:text-bone">Cancel</button>
            <button onClick={create} disabled={saving} className="btn btn-volt btn-sm px-6">{saving ? 'Creating…' : 'Create & Publish'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboardPage() {
  const { isAuthenticated, logout } = useAdminAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<AdminSession | null>(null);
  const [addingTrainer, setAddingTrainer] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/admin/login');
  }, [isAuthenticated, router]);

  const loadStats = useCallback(async () => {
    const { data } = await api.get<Stats>('/admin/stats');
    setStats(data);
  }, []);
  const loadTrainers = useCallback(async () => {
    const { data } = await api.get<AdminTrainer[]>('/admin/trainers');
    setTrainers(data);
  }, []);
  const loadStudents = useCallback(async () => {
    const { data } = await api.get<AdminStudent[]>('/admin/students');
    setStudents(data);
  }, []);
  const loadSessions = useCallback(async () => {
    const { data } = await api.get<AdminSession[]>('/admin/sessions');
    setSessions(data);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([loadStats(), loadTrainers(), loadStudents(), loadSessions()]).finally(() => setLoading(false));
  }, [isAuthenticated, loadStats, loadTrainers, loadStudents, loadSessions]);

  async function deleteTrainer(id: number) {
    if (!confirm('Delete this trainer and all their data?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/trainers/${id}`);
      setTrainers((p) => p.filter((t) => t.id !== id));
      loadStats();
    } finally { setDeleting(null); }
  }

  async function togglePublished(trainer: AdminTrainer) {
    setToggling(trainer.id);
    try {
      await api.put(`/admin/trainers/${trainer.id}`, { isPublished: !trainer.is_published });
      setTrainers((p) => p.map((t) => t.id === trainer.id ? { ...t, is_published: t.is_published ? 0 : 1 } : t));
    } finally { setToggling(null); }
  }

  async function deleteStudent(id: number) {
    if (!confirm('Delete this student and all their data?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/students/${id}`);
      setStudents((p) => p.filter((s) => s.id !== id));
      loadStats();
    } finally { setDeleting(null); }
  }

  async function deleteSession(id: number) {
    if (!confirm('Delete this session?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/sessions/${id}`);
      setSessions((p) => p.filter((s) => s.id !== id));
      loadStats();
    } finally { setDeleting(null); }
  }

  function handleLogout() {
    logout();
    router.replace('/admin/login');
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-bone">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/8 bg-ink">
        <div className="flex items-center gap-2.5 border-b border-white/8 px-5 py-5">
          <ShieldCheck className="h-5 w-5 text-volt" />
          <span className="font-display text-lg tracking-wide">Admin</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors',
                section === id ? 'bg-volt text-ink' : 'text-bone/55 hover:bg-white/5 hover:text-bone'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/8 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-bone/40 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">

          {/* ── Overview ── */}
          {section === 'overview' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Overview</h1>
              <p className="mt-1 text-sm text-bone/40">Platform-wide statistics</p>
              {loading ? <Spinner /> : stats && (
                <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: 'Trainers', value: stats.trainers },
                    { label: 'Published', value: stats.published },
                    { label: 'Students', value: stats.students },
                    { label: 'Sessions', value: stats.sessions },
                    { label: 'Messages', value: stats.messages },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-white/10 bg-white/4 p-5">
                      <p className="font-display text-4xl tabular-nums text-volt">{value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-bone/40">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <div className="border border-white/10">
                  <div className="border-b border-white/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-bone/40">Recent Trainers</p>
                  </div>
                  <div className="divide-y divide-white/8">
                    {trainers.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-bone/40">{t.email}</p>
                        </div>
                        <span className={cn('text-[10px] font-bold uppercase', t.is_published ? 'text-volt' : 'text-bone/30')}>
                          {t.is_published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-white/10">
                  <div className="border-b border-white/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-bone/40">Recent Students</p>
                  </div>
                  <div className="divide-y divide-white/8">
                    {students.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-bone/40">{s.email}</p>
                        </div>
                        <span className="text-xs text-bone/40">{s.trainer_name ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Trainers ── */}
          {section === 'trainers' && (
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-display text-4xl tracking-wide">Trainers</h1>
                  <p className="mt-1 text-sm text-bone/40">{trainers.length} total</p>
                </div>
                <button onClick={() => setAddingTrainer(true)} className="btn btn-volt btn-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Trainer
                </button>
              </div>
              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Name', 'Email', 'Password', 'Specialties', 'Status', 'Students', 'Sessions', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {trainers.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{t.id}</td>
                          <td className="px-4 py-3 font-semibold">{t.name}</td>
                          <td className="px-4 py-3 text-bone/60">{t.email}</td>
                          <td className="px-4 py-3 font-mono text-xs text-volt">{SEEDED_TRAINER_EMAILS.has(t.email) ? 'trainer123' : '—'}</td>
                          <td className="px-4 py-3 text-bone/50 text-xs">{t.specialties || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-[10px] font-bold uppercase', t.is_published ? 'text-volt' : 'text-bone/30')}>
                              {t.is_published ? 'Live' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{t.student_count}</td>
                          <td className="px-4 py-3 text-center">{t.session_count}</td>
                          <td className="px-4 py-3 text-xs text-bone/40">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingTrainerId(t.id)}
                                title="Edit profile & pricing"
                                className="p-1.5 text-bone/40 hover:text-volt"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => togglePublished(t)}
                                disabled={toggling === t.id}
                                title={t.is_published ? 'Unpublish' : 'Publish'}
                                className="p-1.5 text-bone/40 hover:text-volt disabled:opacity-40"
                              >
                                {t.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteTrainer(t.id)}
                                disabled={deleting === t.id}
                                className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Students ── */}
          {section === 'students' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Students</h1>
              <p className="mt-1 text-sm text-bone/40">{students.length} total</p>
              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Name', 'Email', 'Password', 'Trainer', 'Sessions', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{s.id}</td>
                          <td className="px-4 py-3 font-semibold">{s.name}</td>
                          <td className="px-4 py-3 text-bone/60">{s.email}</td>
                          <td className="px-4 py-3 font-mono text-xs text-volt">{SEEDED_STUDENT_EMAILS.has(s.email) ? 'student123' : '—'}</td>
                          <td className="px-4 py-3 text-bone/50">{s.trainer_name ?? '—'}</td>
                          <td className="px-4 py-3 text-center">{s.session_count}</td>
                          <td className="px-4 py-3 text-xs text-bone/40">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingStudentId(s.id)}
                                title="Edit student"
                                className="p-1.5 text-bone/40 hover:text-volt"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteStudent(s.id)}
                                disabled={deleting === s.id}
                                className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Sessions ── */}
          {section === 'sessions' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Sessions</h1>
              <p className="mt-1 text-sm text-bone/40">{sessions.length} total</p>
              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Title', 'Trainer', 'Student', 'Scheduled', 'Duration', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{s.id}</td>
                          <td className="px-4 py-3 font-semibold">{s.title}</td>
                          <td className="px-4 py-3 text-bone/60">{s.trainer_name}</td>
                          <td className="px-4 py-3 text-bone/60">{s.student_name}</td>
                          <td className="px-4 py-3 text-xs text-bone/50">
                            {new Date(s.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3 text-bone/50">{s.duration_min} min</td>
                          <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingSession(s)}
                                title="Edit session"
                                className="p-1.5 text-bone/40 hover:text-volt"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteSession(s.id)}
                                disabled={deleting === s.id}
                                className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      {editingTrainerId !== null && (
        <TrainerModal
          trainerId={editingTrainerId}
          onClose={() => setEditingTrainerId(null)}
          onSaved={() => { loadTrainers(); }}
        />
      )}
      {editingStudentId !== null && (
        <StudentModal
          studentId={editingStudentId}
          onClose={() => setEditingStudentId(null)}
          onSaved={() => { loadStudents(); }}
        />
      )}
      {editingSession !== null && (
        <SessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={(updated) => {
            setSessions((p) => p.map((s) => s.id === updated.id ? updated : s));
            setEditingSession(null);
          }}
        />
      )}
      {addingTrainer && (
        <AddTrainerModal
          onClose={() => setAddingTrainer(false)}
          onCreated={(t) => {
            setTrainers((p) => [t, ...p]);
            loadStats();
            setAddingTrainer(false);
          }}
        />
      )}
    </div>
  );
}
