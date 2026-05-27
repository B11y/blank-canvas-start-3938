import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, type SupabaseProject } from '@/lib/supabase';

export function FeaturedProjectsSection() {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('date', { ascending: false });
      setProjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-16 text-muted-foreground">Loading…</div>;

  if (projects.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      No featured projects yet. Mark some as featured from the admin panel.
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
      {projects.map((project, i) => (
        <motion.article
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group relative overflow-hidden bg-muted"
        >
          <Link to={`/projects/${project.id}`} className="block aspect-[16/10] overflow-hidden">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-xs uppercase tracking-widest text-white/70 mb-1">{project.category}</p>
              <h3 className="text-xl font-medium text-white">{project.title}</h3>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
