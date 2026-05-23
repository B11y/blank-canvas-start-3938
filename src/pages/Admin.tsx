import { useEffect, useState, FormEvent } from 'react';
import { supabase, type SupabaseProject, type SupabaseProjectImage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/seo/SEOHead';
import { toast } from 'sonner';
import { Pencil, Trash2, LogOut, Plus, X, ImagePlus, ArrowUp, ArrowDown } from 'lucide-react';

const ADMIN_PASSWORD = 'IM2024admin';
const AUTH_KEY = 'admin_authed';

type FormState = {
  title: string;
  description: string;
  image_url: string;
  category: string;
  date: string;
  client: string;
  tools: string;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  image_url: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  client: '',
  tools: '',
};

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      setError('Wrong password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 p-8 border border-border rounded-lg bg-card">
        <h1 className="text-2xl font-light">Admin Login</h1>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Images for the project currently being edited
  const [images, setImages] = useState<SupabaseProjectImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  // Local image URLs for a new (not-yet-created) project
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const load = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });
    if (error) toast.error(error.message);
    else setProjects(data ?? []);
  };

  const loadImages = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    if (error) toast.error(error.message);
    else setImages(data ?? []);
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImages([]);
    setPendingImages([]);
    setNewImageUrl('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      const { error } = await supabase.from('projects').update(form).eq('id', editingId);
      if (error) toast.error(error.message);
      else {
        toast.success('Project updated');
        reset();
        load();
      }
    } else {
      const { data, error } = await supabase.from('projects').insert(form).select().single();
      if (error) {
        toast.error(error.message);
      } else {
        // Insert any pending images
        if (data && pendingImages.length) {
          const rows = pendingImages.map((url, i) => ({
            project_id: data.id,
            image_url: url,
            sort_order: i,
          }));
          const { error: imgErr } = await supabase.from('project_images').insert(rows);
          if (imgErr) toast.error('Project added, but images failed: ' + imgErr.message);
        }
        toast.success('Project added');
        reset();
        load();
      }
    }
    setLoading(false);
  };

  const edit = async (p: SupabaseProject) => {
    setEditingId(p.id);
    setForm({
      title: p.title ?? '',
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      category: p.category ?? '',
      date: p.date ?? '',
      client: p.client ?? '',
      tools: p.tools ?? '',
    });
    setPendingImages([]);
    await loadImages(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? Its images will be removed too.')) return;
    // Delete images first (in case no cascade)
    await supabase.from('project_images').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Project deleted');
      load();
    }
  };

  const addImage = async () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (editingId) {
      const nextOrder = images.length;
      const { error } = await supabase
        .from('project_images')
        .insert({ project_id: editingId, image_url: url, sort_order: nextOrder });
      if (error) return toast.error(error.message);
      setNewImageUrl('');
      loadImages(editingId);
    } else {
      setPendingImages([...pendingImages, url]);
      setNewImageUrl('');
    }
  };

  const removeImage = async (img: SupabaseProjectImage) => {
    const { error } = await supabase.from('project_images').delete().eq('id', img.id);
    if (error) return toast.error(error.message);
    if (editingId) loadImages(editingId);
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(pendingImages.filter((_, i) => i !== idx));
  };

  const moveImage = async (img: SupabaseProjectImage, dir: -1 | 1) => {
    const sorted = [...images];
    const idx = sorted.findIndex((i) => i.id === img.id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const other = sorted[target];
    await Promise.all([
      supabase.from('project_images').update({ sort_order: other.sort_order }).eq('id', img.id),
      supabase.from('project_images').update({ sort_order: img.sort_order }).eq('id', other.id),
    ]);
    if (editingId) loadImages(editingId);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  return (
    <>
      <SEOHead title="Admin" description="Manage portfolio projects" />
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-light">Projects Admin</h1>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <form onSubmit={submit} className="space-y-4 p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <Plus className="w-5 h-5" /> {editingId ? 'Edit project' : 'Add new project'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="branding, social-media, …" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image_url">Cover image URL (used as thumbnail)</Label>
              <Input id="image_url" type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          {/* Gallery images manager */}
          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Gallery images
            </Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://image-url.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" onClick={addImage} variant="outline">Add</Button>
            </div>

            {/* Existing images (when editing) */}
            {editingId && images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group border border-border rounded overflow-hidden bg-muted">
                    <img src={img.image_url} alt="" className="w-full h-28 object-cover" />
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button type="button" onClick={() => moveImage(img, -1)} disabled={i === 0}
                        className="bg-black/60 text-white rounded p-1 disabled:opacity-30">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => moveImage(img, 1)} disabled={i === images.length - 1}
                        className="bg-black/60 text-white rounded p-1 disabled:opacity-30">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => removeImage(img)}
                        className="bg-black/60 text-white rounded p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending images (new project) */}
            {!editingId && pendingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pendingImages.map((url, i) => (
                  <div key={i} className="relative group border border-border rounded overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-28 object-cover" />
                    <button type="button" onClick={() => removePendingImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingId && images.length === 0 && (
              <p className="text-xs text-muted-foreground">No gallery images yet. Add some above.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editingId ? 'Update project' : 'Add project'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={reset}>Cancel</Button>
            )}
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-medium">All projects ({projects.length})</h2>
          <div className="grid gap-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category} · {p.date}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => edit(p)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-muted-foreground text-sm">No projects yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
