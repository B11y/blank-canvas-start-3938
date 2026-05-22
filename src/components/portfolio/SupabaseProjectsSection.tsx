import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, type SupabaseProject } from '@/lib/supabase';

export function SupabaseProjectsSection() {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('date', { ascending: false });
      if (error) setError(error.message);
      else setProjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground">Loading projects…</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-destructive">
        Couldn't load projects: {error}
      </div>
    );
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
      {projects.map((project, i) => (
        <motion.article
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="group overflow-hidden rounded-lg border border-border bg-card"
        >
          {project.image_url && (
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={project.image_url}
                alt={project.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>{project.category}</span>
              <time>{project.date}</time>
            </div>
            <h3 className="text-xl font-medium">{project.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
