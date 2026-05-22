import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase, type SupabaseProject, type SupabaseProjectImage } from '@/lib/supabase';

interface Props {
  project: SupabaseProject | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectGalleryDialog({ project, open, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project || !open) return;
    setLoading(true);
    setIndex(0);
    (async () => {
      const { data } = await supabase
        .from('project_images')
        .select('image_url, sort_order')
        .eq('project_id', project.id)
        .order('sort_order', { ascending: true });
      const urls = (data ?? []).map((r: Partial<SupabaseProjectImage>) => r.image_url!).filter(Boolean);
      // Fallback to cover image if no gallery rows
      setImages(urls.length ? urls : project.image_url ? [project.image_url] : []);
      setLoading(false);
    })();
  }, [project, open]);

  const next = () => setIndex((i) => (i + 1) % Math.max(images.length, 1));
  const prev = () => setIndex((i) => (i - 1 + images.length) % Math.max(images.length, 1));

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, images.length]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95 border-none [&>button]:hidden">
        <div className="relative w-full h-full flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/60">{project.category}</div>
              <h2 className="text-xl font-light">{project.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
              <X className="size-6" />
            </Button>
          </div>

          <div className="flex-1 relative flex items-center justify-center px-4 md:px-16 overflow-hidden">
            {loading ? (
              <div className="text-white/60">Loading…</div>
            ) : images.length === 0 ? (
              <div className="text-white/60">No images for this project.</div>
            ) : (
              <>
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prev}
                    className="absolute left-4 z-10 size-12 text-white hover:bg-white/10 rounded-full"
                  >
                    <ChevronLeft className="size-8" />
                  </Button>
                )}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={index}
                    src={images[index]}
                    alt={`${project.title} ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="absolute right-4 z-10 size-12 text-white hover:bg-white/10 rounded-full"
                  >
                    <ChevronRight className="size-8" />
                  </Button>
                )}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                  {index + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {project.description && (
            <p className="px-6 pb-6 text-white/70 text-sm font-light text-center max-w-3xl mx-auto">
              {project.description}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
