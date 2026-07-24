import { useCallback, useEffect, useState, FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type SupabaseProject, type SupabaseProjectImage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/seo/SEOHead';
import { toast } from 'sonner';
import { Pencil, Trash2, LogOut, Plus, X, ImagePlus, ArrowUp, ArrowDown, Star } from 'lucide-react';

type AuthStatus = 'checking' | 'signed-out' | 'unauthorized' | 'authorized';

const isVideoUrl = (url: string) => {
  const normalized = url.toLowerCase().split('?')[0];
  return /\.(mp4|webm|ogg|mov|m4v)$/.test(normalized) || normalized.includes('/video/upload/');
};

type FormState = {
  title: string;
  description: string;
  image_url: string;
  category: string;
  date: string;
  client: string;
  tools: string;
  challenge: string;
  goal: string;
  concept: string;
  deliverables: string;
  process: string;
  result: string;
  testimonial: string;
  featured: boolean;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  image_url: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  client: '',
  tools: '',
  challenge: '',
  goal: '',
  concept: '',
  deliverables: '',
  process: '',
  result: '',
  testimonial: '',
  featured: false,
};

function LoginGate({ onSignedIn }: { onSignedIn: (session: Session | null) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    onSignedIn(data.session);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 p-8 border border-border rounded-lg bg-card">
        <div className="space-y-2">
          <h1 className="text-2xl font-light">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with an approved Supabase admin account. Passwords are no longer stored in the app bundle.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}

function CheckingGate() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-muted-foreground">
      Checking admin access…
    </div>
  );
}

function UnauthorizedGate({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 p-8 border border-border rounded-lg bg-card text-center">
        <h1 className="text-2xl font-light">Access denied</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {email || 'This account'} is authenticated, but it is not listed as an admin user. Add the user id to the
          <code className="mx-1 rounded bg-muted px-1 py-0.5">admin_users</code>
          table before using this panel.
        </p>
        <Button type="button" variant="outline" onClick={onSignOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [sessionEmail, setSessionEmail] = useState('');
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<SupabaseProjectImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });
    if (error) toast.error(error.message);
    else setProjects(data ?? []);
  }, []);

  const loadImages = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    if (error) toast.error(error.message);
    else setImages(data ?? []);
  };

  const checkAdminSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setSessionEmail('');
      setProjects([]);
      setAuthStatus('signed-out');
      return;
    }

    setAuthStatus('checking');
    setSessionEmail(session.user.email ?? '');

    const { data: isAdmin, error } = await supabase.rpc('is_admin');

    if (error) {
      console.error('Admin role check failed', error);
      toast.error('Admin security is not configured. Apply the Supabase RLS migration first.');
      await supabase.auth.signOut();
      setAuthStatus('signed-out');
      return;
    }

    if (!isAdmin) {
      setAuthStatus('unauthorized');
      return;
    }

    setAuthStatus('authorized');
    await load();
  }, [load]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      void checkAdminSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkAdminSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, [checkAdminSession]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImages([]);
    setPendingImages([]);
    setNewImageUrl('');
  };

  const signOut = async () => {
    reset();
    await supabase.auth.signOut();
    setAuthStatus('signed-out');
  };

  if (authStatus === 'checking') return <CheckingGate />;
  if (authStatus === 'signed-out') return <LoginGate onSignedIn={checkAdminSession} />;
  if (authStatus === 'unauthorized') return <UnauthorizedGate email={sessionEmail} onSignOut={signOut} />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase.from('projects').update(form).eq('id', editingId);
        if (error) toast.error(error.message);
        else {
          toast.success('Project updated');
          reset();
          await load();
        }
      } else {
        const { data, error } = await supabase.from('projects').insert(form).select().single();
        if (error) {
          toast.error(error.message);
        } else {
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
          await load();
        }
      }
    } finally {
      setLoading(false);
    }
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
      challenge: p.challenge ?? '',
      goal: p.goal ?? '',
      concept: p.concept ?? '',
      deliverables: p.deliverables ?? '',
      process: p.process ?? '',
      result: p.result ?? '',
      testimonial: p.testimonial ?? '',
      featured: p.featured ?? false,
    });
    setPendingImages([]);
    await loadImages(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? Its images will be removed too.')) return;
    await supabase.from('project_images').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Project deleted');
      await load();
    }
  };

  const toggleFeatured = async (p: SupabaseProject) => {
    const { error } = await supabase
      .from('projects')
      .update({ featured: !p.featured })
      .eq('id', p.id);
    if (error) toast.error(error.message);
    else {
      toast.success(p.featured ? 'Removed from featured' : 'Added to featured ⭐');
      await load();
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

  return (
    <>
      <SEOHead title="Admin" description="Manage portfolio projects" />
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light">Projects Admin</h1>
            {sessionEmail && <p className="text-xs text-muted-foreground mt-1">Signed in as {sessionEmail}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <form onSubmit={submit} className="space-y-6 p-6 border border-border rounded-lg bg-card">
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
              <Input id="category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Brand Identity" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image_url">Main Image URL</Label>
              <Input id="image_url" type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="e.g. Nike" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tools">Tools / Software</Label>
              <Input id="tools" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} placeholder="Illustrator, Photoshop" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="md:col-span-2 border-t border-border pt-5">
              <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
                Case Study Fields
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Optional fields. Leave empty if this project is only a gallery item.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="challenge">Challenge</Label>
              <Textarea
                id="challenge"
                rows={3}
                value={form.challenge}
                onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                placeholder="What problem or business challenge did this project solve?"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                rows={3}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="What was the main goal for the brand, client, or campaign?"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="concept">Concept</Label>
              <Textarea
                id="concept"
                rows={3}
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
                placeholder="What creative direction or concept shaped the project?"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                rows={3}
                value={form.deliverables}
                onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                placeholder="Logo, identity system, packaging, social templates, brand guidelines..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="process">Process</Label>
              <Textarea
                id="process"
                rows={4}
                value={form.process}
                onChange={(e) => setForm({ ...form, process: e.target.value })}
                placeholder="Research, strategy, visual exploration, refinement, final system..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="result">Result</Label>
              <Textarea
                id="result"
                rows={3}
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                placeholder="What changed after the project? Better positioning, stronger launch, clearer brand..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="testimonial">Testimonial</Label>
              <Textarea
                id="testimonial"
                rows={3}
                value={form.testimonial}
                onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                placeholder="Optional client quote..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="video_url">Video URL (Cloudinary)</Label>
              <Input
                id="video_url"
                type="url"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
              />
              <p className="text-xs text-muted-foreground">اختياري — بيظهر جوا صفحة المشروع</p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                <div
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${form.featured ? 'bg-[#D68A4E]' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Star className={`w-4 h-4 ${form.featured ? 'text-[#D68A4E] fill-[#D68A4E]' : 'text-muted-foreground'}`} />
                  {form.featured ? 'Featured — shown on Home page' : 'Not featured'}
                </span>
              </label>
            </div>
          </div>

          {/* Gallery media manager */}
          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Gallery media
            </Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://image-or-video-url.jpg / .mp4"
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

            {editingId && images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group border border-border rounded overflow-hidden bg-muted">
                    {isVideoUrl(img.image_url) ? (
                      <video src={img.image_url} className="w-full h-28 object-cover" muted preload="metadata" />
                    ) : (
                      <img src={img.image_url} alt="" className="w-full h-28 object-cover" />
                    )}
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

            {!editingId && pendingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pendingImages.map((url, i) => (
                  <div key={i} className="relative group border border-border rounded overflow-hidden bg-muted">
                    {isVideoUrl(url) ? (
                      <video src={url} className="w-full h-28 object-cover" muted preload="metadata" />
                    ) : (
                      <img src={url} alt="" className="w-full h-28 object-cover" />
                    )}
                    <button type="button" onClick={() => removePendingImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingId && images.length === 0 && (
              <p className="text-xs text-muted-foreground">No gallery media yet. Add images or videos above.</p>
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
                  <div className="font-medium truncate flex items-center gap-2">
                    {p.title}
                    {p.featured && <Star className="w-3 h-3 text-[#D68A4E] fill-[#D68A4E]" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.category} · {p.date}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(p)}
                  title={p.featured ? 'Remove from featured' : 'Add to featured'}
                  className={`p-2 rounded-md border transition-colors ${p.featured ? 'border-[#D68A4E] text-[#D68A4E]' : 'border-border text-muted-foreground hover:border-[#D68A4E] hover:text-[#D68A4E]'}`}
                >
                  <Star className={`w-4 h-4 ${p.featured ? 'fill-[#D68A4E]' : ''}`} />
                </button>
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
