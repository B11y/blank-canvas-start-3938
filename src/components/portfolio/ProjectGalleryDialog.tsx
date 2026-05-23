import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase, type SupabaseProject, type SupabaseProjectImage } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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
      <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-background border-none [&>button]:hidden overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 md:px-10 py-4 border-b border-border shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground mb-1">
              <span className="inline-flex items-center gap-1"><Tag className="size-3" />{project.category}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{project.date}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-light truncate">{project.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
            <X className="size-5" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Slider */}
          <div className="relative w-full bg-black/95 flex items-center justify-center" style={{ minHeight: '60vh' }}>
            {loading ? (
              <div className="text-white/60 py-32">Loading…</div>
            ) : images.length === 0 ? (
              <div className="text-white/60 py-32">No images for this project.</div>
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
                    className="max-w-full max-h-[70vh] object-contain"
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
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop-blur-sm">
                  {index + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="px-6 md:px-10 py-4 border-b border-border">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition',
                      i === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">About this project</h3>
              <p className="text-base md:text-lg text-foreground font-light leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}

          {/* Full gallery grid */}
          {images.length > 1 && (
            <div className="px-6 md:px-10 pb-12 max-w-6xl mx-auto">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className="aspect-square overflow-hidden rounded bg-muted group"
                  >
                    <img
                      src={url}
                      alt={`${project.title} ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
