import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase, type SupabaseProject } from '@/lib/supabase';
import { SEOHead } from '@/components/seo/SEOHead';
import { Separator } from '@/components/ui/separator';
import { getResponsiveImageAttributes } from '@/lib/responsive-image';

export default function SupabaseProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<SupabaseProject | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          image_url,
          category,
          date,
          client,
          tools,
          featured,
          created_at,
          challenge,
          goal,
          concept,
          deliverables,
          process,
          result,
          testimonial
        `)
        .eq('id', id)
        .maybeSingle();
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

  const coverImageAttributes = cover
    ? getResponsiveImageAttributes(cover, {
        width: 1600,
        height: 1000,
        sizes: '100vw',
      })
    : null;

  const caseStudyData = project as SupabaseProject & {
    challenge?: string | null;
    goal?: string | null;
    concept?: string | null;
    deliverables?: string | null;
    process?: string | null;
    result?: string | null;
    testimonial?: string | null;
  };

  const caseStudySections = [
    { label: 'Challenge', value: caseStudyData.challenge },
    { label: 'Goal', value: caseStudyData.goal },
    { label: 'Concept', value: caseStudyData.concept },
    { label: 'Deliverables', value: caseStudyData.deliverables },
    { label: 'Process', value: caseStudyData.process },
    { label: 'Result', value: caseStudyData.result },
  ]
    .map((section) => ({
      label: section.label,
      value: String(section.value ?? '').trim(),
    }))
    .filter((section) => section.value.length > 0);

  const testimonial = String(caseStudyData.testimonial ?? '').trim();

  return (
    <>
      <SEOHead
        title={project.title}
        description={project.description}
        image={cover}
        imageAlt={`${project.title} project cover image`}
        type="article"
        publishedTime={project.created_at || project.date}
        modifiedTime={project.created_at || project.date}
      />
      <article className="min-h-screen">
        {coverImageAttributes && (
          <motion.div
            className="w-full h-[60vh] md:h-[80vh] overflow-hidden bg-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={coverImageAttributes.src}
              srcSet={coverImageAttributes.srcSet}
              sizes={coverImageAttributes.sizes}
              width={coverImageAttributes.width}
              height={coverImageAttributes.height}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-10">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="size-4" /> Back to portfolio
          </Link>

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

          {project.description && (
            <p className="text-lg md:text-xl font-light leading-relaxed text-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          )}

          {caseStudySections.length > 0 && (
            <>
              <Separator />

              <section className="space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-light tracking-[0.24em] uppercase text-muted-foreground">
                    Case Study
                  </p>
                  <h2 className="text-2xl md:text-3xl font-light tracking-wide">
                    From challenge to visual system
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {caseStudySections.map((section) => (
                    <div key={section.label} className="space-y-2 border-t border-border pt-5">
                      <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
                        {section.label}
                      </h3>
                      <p className="text-base font-light leading-relaxed text-foreground whitespace-pre-wrap">
                        {section.value}
                      </p>
                    </div>
                  ))}
                </div>

                {testimonial.length > 0 && (
                  <blockquote className="border-l border-gold pl-6 text-lg md:text-xl font-light leading-relaxed text-foreground">
                    “{testimonial}”
                  </blockquote>
                )}
              </section>
            </>
          )}

          {rest.length > 0 && (
            <div className="space-y-6 -mx-6 lg:-mx-8">
              {rest.map((url, i) => {
                const imageAttributes = getResponsiveImageAttributes(url, {
                  width: 1600,
                  height: 1000,
                  sizes: '(min-width: 1024px) 896px, 100vw',
                });
                return (
                  <motion.img
                    key={i}
                    src={imageAttributes.src}
                    srcSet={imageAttributes.srcSet}
                    sizes={imageAttributes.sizes}
                    width={imageAttributes.width}
                    height={imageAttributes.height}
                    alt={`${project.title} ${i + 2}`}
                    className="w-full h-auto"
                    loading="lazy"
                    decoding="async"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                  />
                );
              })}
            </div>
          )}

          <Separator />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Tools</h2>
              <p className="text-base md:text-lg font-light text-foreground">{project.tools || '—'}</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Client</h2>
              <p className="text-base md:text-lg font-light text-foreground">{project.client || '—'}</p>
            </div>
          </section>

          <section className="rounded-sm border border-border bg-accent/40 p-8 md:p-10 text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-light tracking-wide">
              Ready to build a memorable visual system?
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Share your project goals and I’ll help you shape the right creative direction.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 text-sm font-medium tracking-wide text-background transition-all duration-300 hover:bg-foreground/90"
            >
              Start a Project
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
