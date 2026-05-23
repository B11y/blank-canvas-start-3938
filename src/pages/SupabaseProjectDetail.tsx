import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase, type SupabaseProject } from '@/lib/supabase';
import { SEOHead } from '@/components/seo/SEOHead';
import { Separator } from '@/components/ui/separator';

export default function SupabaseProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<SupabaseProject | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProject(data as SupabaseProject);
      const { data: imgs } = await supabase
        .from('project_images')
        .select('image_url, sort_order')
        .eq('project_id', id)
        .order('sort_order', { ascending: true });
      const urls = (imgs ?? []).map((r: { image_url: string }) => r.image_url).filter(Boolean);
      setImages(urls.length ? urls : data.image_url ? [data.image_url] : []);
      setLoading(false);
    })();
  }, [id]);

  if (notFound) return <Navigate to="/404" replace />;
  if (loading || !project) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const cover = images[0] || project.image_url;
  const rest = images.slice(1);

  return (
    <>
      <SEOHead title={project.title} description={project.description} image={cover} type="article" />
      <article className="min-h-screen">
        {/* 1. Full-width cover image */}
        {cover && (
          <motion.div
            className="w-full h-[60vh] md:h-[80vh] overflow-hidden bg-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src={cover} alt={project.title} className="w-full h-full object-cover" loading="eager" />
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-10">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="size-4" /> Back to portfolio
          </Link>

          {/* 2. Title, date, category */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-light uppercase tracking-wider">
              <span>{project.date}</span>
              <span>•</span>
              <span>{project.category}</span>
            </div>
          </motion.header>

          <Separator />

          {/* 3. Full description */}
          {project.description && (
            <p className="text-lg md:text-xl font-light leading-relaxed text-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          )}

          {/* Additional gallery images */}
          {rest.length > 0 && (
            <div className="space-y-6 -mx-6 lg:-mx-8">
              {rest.map((url, i) => (
                <motion.img
                  key={i}
                  src={url}
                  alt={`${project.title} ${i + 2}`}
                  className="w-full h-auto"
                  loading="lazy"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </div>
          )}

          <Separator />

          {/* 4. Details: TOOLS + CLIENT */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Tools</h2>
              <p className="text-base md:text-lg font-light text-foreground">
                {project.tools || '—'}
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Client</h2>
              <p className="text-base md:text-lg font-light text-foreground">
                {project.client || '—'}
              </p>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
