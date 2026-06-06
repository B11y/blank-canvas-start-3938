import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Wrench, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getProjectBySlug } from '@/data/projects';
import { ImageWithLightbox } from '@/components/portfolio/ImageWithLightbox';
import { Lightbox } from '@/components/portfolio/Lightbox';
import { getResponsiveImageAttributes } from '@/lib/responsive-image';

/**
 * Project detail page with hero image, gallery, and full-screen lightbox
 * Features smooth animations and immersive image viewing experience
 */
export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 404 if project not found
  if (!project) {
    return <Navigate to="/404" replace />;
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const coverImageAttributes = getResponsiveImageAttributes(project.coverImage, {
    width: 1600,
    height: 1000,
    sizes: '100vw',
  });

  const caseStudyData = project as typeof project & {
    challenge?: string;
    goal?: string;
    concept?: string;
    deliverables?: string;
    process?: string;
    result?: string;
    testimonial?: string;
  };

  const caseStudySections = [
    { label: 'Challenge', value: caseStudyData.challenge },
    { label: 'Goal', value: caseStudyData.goal },
    { label: 'Concept', value: caseStudyData.concept },
    { label: 'Deliverables', value: caseStudyData.deliverables },
    { label: 'Process', value: caseStudyData.process },
    { label: 'Result', value: caseStudyData.result },
  ].filter((section): section is { label: string; value: string } => Boolean(section.value?.trim()));

  return (
    <>
      <SEOHead
        title={project.title}
        description={project.description}
        image={project.coverImage}
        imageAlt={`${project.title} project cover image`}
        type="article"
      />
      
      <div className="min-h-screen">
        {/* Hero Image - 70vh */}
      <motion.div
        className="relative w-full h-[70vh] overflow-hidden bg-muted"
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
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </motion.div>

      {/* Project Info Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Title and Category */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-light">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>{project.year}</span>
              </div>
              <div className="flex items-center gap-2 capitalize">
                <span>•</span>
                <span>{project.category}</span>
              </div>
              {project.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{project.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <p className="text-lg md:text-xl font-light leading-relaxed text-foreground">
              {project.description}
            </p>
          </div>

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

                {caseStudyData.testimonial && (
                  <blockquote className="border-l border-gold pl-6 text-lg md:text-xl font-light leading-relaxed text-foreground">
                    “{caseStudyData.testimonial}”
                  </blockquote>
                )}
              </section>
            </>
          )}

          {/* Technical Details */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {project.camera && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-light tracking-wide uppercase text-muted-foreground">
                  <Wrench className="size-4" />
                  <span>Tools</span>
                </div>
                <p className="font-light text-foreground">{project.camera}</p>
              </div>
            )}
            {project.client && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-light tracking-wide uppercase text-muted-foreground">
                  <User className="size-4" />
                  <span>Client</span>
                </div>
                <p className="font-light text-foreground">{project.client}</p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

        <section className="px-6 lg:px-8 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto rounded-sm border border-border bg-accent/40 p-8 md:p-10 text-center space-y-4">
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
          </div>
        </section>

        {/* Image Gallery - Edge to edge */}
        <section className="py-12 md:py-16">
          <div className="space-y-8 md:space-y-12">
            {project.images.map((image, index) => (
              <ScrollReveal key={image.id} delay={index * 0.1}>
                <ImageWithLightbox
                  image={image}
                  onClick={() => openLightbox(index)}
                  priority={index === 0}
                  index={index}
                  className="w-full"
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Lightbox */}
        <Lightbox
          images={project.images}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNavigate={setCurrentImageIndex}
        />
      </div>
    </>
  );
}
