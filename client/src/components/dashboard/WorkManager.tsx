import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';
import type { PreviousWork, Trainer } from '../../types';
import { cn, getApiError, resolveImage } from '../../lib/format';
import { useToast } from '../../hooks/useToast';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import ImageUpload from '../ImageUpload';
import Toggle from '../Toggle';

interface Props {
  trainer: Trainer;
  refresh: () => Promise<void>;
}

interface WorkForm {
  studentName: string;
  goal: string;
  duration: string;
  description: string;
  isVisible: boolean;
}

const EMPTY: WorkForm = {
  studentName: '',
  goal: '',
  duration: '',
  description: '',
  isVisible: true,
};

export default function WorkManager({ trainer, refresh }: Props) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PreviousWork | null>(null);
  const [form, setForm] = useState<WorkForm>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<PreviousWork | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setPhotoFile(null);
    setModalOpen(true);
  };

  const openEdit = (work: PreviousWork) => {
    setEditing(work);
    setForm({
      studentName: work.studentName,
      goal: work.goal,
      duration: work.duration,
      description: work.description,
      isVisible: work.isVisible,
    });
    setPhotoFile(null);
    setModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim()) {
      toast.error('Please enter the client name.');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('studentName', form.studentName.trim());
    fd.append('goal', form.goal.trim());
    fd.append('duration', form.duration.trim());
    fd.append('description', form.description.trim());
    fd.append('isVisible', String(form.isVisible));
    if (photoFile) fd.append('photo', photoFile);
    try {
      if (editing) {
        await api.put(`/trainers/${trainer.id}/work/${editing.id}`, fd);
      } else {
        await api.post(`/trainers/${trainer.id}/work`, fd);
      }
      await refresh();
      toast.success(editing ? 'Case study updated.' : 'Case study added.');
      setModalOpen(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (work: PreviousWork) => {
    setTogglingId(work.id);
    try {
      await api.put(`/trainers/${trainer.id}/work/${work.id}`, { isVisible: !work.isVisible });
      await refresh();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.delete(`/trainers/${trainer.id}/work/${deleting.id}`);
      await refresh();
      toast.success('Case study deleted.');
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
          <h2 className="font-display text-3xl tracking-wide">Previous Work</h2>
          <p className="mt-1 text-sm text-ink/55">
            Showcase client transformations and case studies on your profile.
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-dark btn-sm shrink-0">
          <Plus className="h-4 w-4" />
          Add Case Study
        </button>
      </header>

      {trainer.previousWork.length > 0 ? (
        <div className="space-y-4">
          {trainer.previousWork.map((work) => {
            const photo = resolveImage(work.photo);
            return (
              <div
                key={work.id}
                className="flex flex-col gap-4 border border-ink/10 bg-white p-4 sm:flex-row"
              >
                <div className="h-32 w-full shrink-0 overflow-hidden bg-ink/5 sm:w-32">
                  {photo ? (
                    <img src={photo} alt={work.studentName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink/15">
                      FC
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl leading-none tracking-wide">
                      {work.studentName || 'Client'}
                    </h3>
                    <span
                      className={cn(
                        'chip',
                        work.isVisible ? 'bg-volt text-ink' : 'bg-ink/10 text-ink/50'
                      )}
                    >
                      {work.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  {work.goal && <p className="mt-1 text-sm font-semibold text-ink/70">{work.goal}</p>}
                  {work.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink/55">{work.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleVisible(work)}
                      disabled={togglingId === work.id}
                      className="flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-ink hover:text-bone disabled:opacity-50"
                    >
                      {work.isVisible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {work.isVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => openEdit(work)}
                      className="flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-ink hover:text-bone"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleting(work)}
                      className="flex items-center gap-1.5 border border-red-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-600 transition-colors duration-200 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <h3 className="font-display text-2xl tracking-wide">No Case Studies Yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink/55">
            Add client transformations to build trust with prospective clients.
          </p>
          <button onClick={openAdd} className="btn btn-dark mt-5">
            <Plus className="h-4 w-4" />
            Add Your First Case Study
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Case Study' : 'New Case Study'}
        subtitle="Share a client transformation — with their consent."
      >
        <form onSubmit={submit} className="space-y-4">
          <ImageUpload
            label="Photo"
            currentUrl={editing?.photo}
            aspect="square"
            onFileSelected={setPhotoFile}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="work-name">
                Client Name
              </label>
              <input
                id="work-name"
                className="field-input"
                value={form.studentName}
                onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                placeholder="First name only"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="work-duration">
                Duration
              </label>
              <input
                id="work-duration"
                className="field-input"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 6 months"
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="work-goal">
              Goal Achieved
            </label>
            <input
              id="work-goal"
              className="field-input"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="e.g. Lost 30 lbs and built lasting habits"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="work-desc">
              Description
            </label>
            <textarea
              id="work-desc"
              rows={3}
              className="field-input resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Tell the story behind this transformation..."
            />
          </div>
          <div className="border border-ink/10 p-4">
            <Toggle
              checked={form.isVisible}
              onChange={(v) => setForm((f) => ({ ...f, isVisible: v }))}
              label="Show on public profile"
              description="Hidden case studies stay private to your dashboard."
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
                'Add Case Study'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Case Study?"
        message={`The case study for "${deleting?.studentName || 'this client'}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
