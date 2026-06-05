import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, type SupabaseProject } from '@/lib/supabase';
import { getResponsiveImageAttributes } from '@/lib/cloudinary';

export function SupabaseProjectsSection() {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const list = data ?? [];
      setProjects(list);

      if (list.length) {
        const { data: imgs } = await supabase
          .from('project_images')
          .select('project_id, image_url, sort_order')
          .in(
            'project_id',
            list.map((project) => project.id),
          )
          .order('sort_order', { ascending: true });

        const map: Record<string, string> = {};

        (imgs ?? []).forEach((img: { project_id: string; image_url: string }) => {
          if (!map[img.project_id]) {
            map[img.project_id] = img.image_url;
          }
        });

        setThumbs(map);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading projects…</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-destructive">Couldn't load projects: {error}</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No projects yet. Add some from the admin page.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-6">
      {projects.map((project, index) => {
        const thumbUrl = thumbs[project.id] || project.image_url;
        const thumbAttributes = getResponsiveImageAttributes(thumbUrl, {
          width: 900,
          height: 675,
          sizes: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
          widths: [480, 768, 900, 1200],
        });

        return (
          <motion.article
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="group overflow-hidden rounded-lg border border-border/50 bg-card hover:border-gold/40 transition-colors duration-500"
            style={{ willChange: 'transform' }}
          >
            <Link to={`/projects/${project.id}`} className="block">
              {/* Image Container */}
              {thumbAttributes.src && (
                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  {/* Grayscale → Color + Zoom */}
                  <img
                    src={thumbAttributes.src}
                    srcSet={thumbAttributes.srcSet}
                    sizes={thumbAttributes.sizes}
                    width={thumbAttributes.width}
                    height={thumbAttributes.height}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 ease-out" />

                  {/* View Project Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out translate-y-3 group-hover:translate-y-0">
                    <span className="text-white text-xs uppercase tracking-[0.25em] border border-white/60 px-6 py-2.5 backdrop-blur-sm">
                      View Project
                    </span>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="transition-colors duration-300 group-hover:text-gold">{project.category}</span>
                  <time>{project.date}</time>
                </div>
                <h3 className="text-xl font-medium transition-colors duration-300 group-hover:text-gold">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
              </div>
            </Link>
          </motion.article>
        );
      })}
    </div>
  );
}
