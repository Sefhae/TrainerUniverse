'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/client';
import type { PricingPackage, Trainer } from '../../lib/types';
import { cn, formatPrice, getApiError } from '../../lib/format';
import { useToast } from '../../hooks/useToast';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import Toggle from '../Toggle';

interface Props {
  trainer: Trainer;
  refresh: () => Promise<void>;
}

interface PackageForm {
  name: string;
  description: string;
  sessions: string;
  price: string;
  isPopular: boolean;
}

const EMPTY: PackageForm = { name: '', description: '', sessions: '1', price: '80', isPopular: false };

export default function PricingManager({ trainer, refresh }: Props) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPackage | null>(null);
  const [form, setForm] = useState<PackageForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<PricingPackage | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (pkg: PricingPackage) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description,
      sessions: String(pkg.sessions),
      price: String(pkg.price),
      isPopular: pkg.isPopular,
    });
    setModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Package name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      sessions: Math.max(0, Number(form.sessions) || 0),
      price: Math.max(0, Number(form.price) || 0),
      isPopular: form.isPopular,
    };
    try {
      if (editing) {
        await api.put(`/trainers/${trainer.id}/packages/${editing.id}`, payload);
      } else {
        await api.post(`/trainers/${trainer.id}/packages`, payload);
      }
      await refresh();
      toast.success(editing ? 'Package updated.' : 'Package added.');
      setModalOpen(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.delete(`/trainers/${trainer.id}/packages/${deleting.id}`);
      await refresh();
      toast.success('Package deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-wide">Pricing Packages</h2>
          <p className="mt-1 text-sm text-ink/55">
            Create the session bundles clients can choose from on your profile.
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-dark btn-sm shrink-0">
          <Plus className="h-4 w-4" />
          Add Package
        </button>
      </header>

      {trainer.packages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {trainer.packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col border border-ink/10 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl leading-none tracking-wide">{pkg.name}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                    {pkg.sessions === 0
                      ? 'Unlimited sessions'
                      : pkg.sessions === 1
                        ? 'Single session'
                        : `${pkg.sessions} sessions`}
                  </p>
                </div>
                {pkg.isPopular && (
                  <span className="chip bg-volt text-ink">Popular</span>
                )}
              </div>
              <p className="mt-3 font-display text-4xl leading-none text-ink">
                {formatPrice(pkg.price)}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60">{pkg.description}</p>
              <div className="mt-5 flex gap-2 border-t border-ink/10 pt-4">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-ink hover:text-bone"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleting(pkg)}
                  className="flex items-center gap-1.5 border border-red-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-600 transition-colors duration-200 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <h3 className="font-display text-2xl tracking-wide">No Packages Yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink/55">
            Add your first pricing package so clients know how to train with you.
          </p>
          <button onClick={openAdd} className="btn btn-dark mt-5">
            <Plus className="h-4 w-4" />
            Add Your First Package
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Package' : 'New Package'}
        subtitle="Define what clients get and what it costs."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="pkg-name">
              Package Name
            </label>
            <input
              id="pkg-name"
              className="field-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. 5-Session Starter"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="pkg-sessions">
                Sessions
              </label>
              <input
                id="pkg-sessions"
                type="number"
                min={0}
                className="field-input"
                value={form.sessions}
                onChange={(e) => setForm((f) => ({ ...f, sessions: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-ink/45">Use 0 for unlimited.</p>
            </div>
            <div>
              <label className="field-label" htmlFor="pkg-price">
                Price (USD)
              </label>
              <input
                id="pkg-price"
                type="number"
                min={0}
                className="field-input"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="pkg-desc">
              Description
            </label>
            <textarea
              id="pkg-desc"
              rows={3}
              className="field-input resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What's included in this package?"
            />
          </div>
          <div className="border border-ink/10 p-4">
            <Toggle
              checked={form.isPopular}
              onChange={(v) => setForm((f) => ({ ...f, isPopular: v }))}
              label="Mark as Most Popular"
              description="Highlights this package on your public profile."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-outline-dark flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-volt flex-1">
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              ) : editing ? (
                'Save Changes'
              ) : (
                'Add Package'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Package?"
        message={`"${deleting?.name}" will be permanently removed from your profile.`}
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
