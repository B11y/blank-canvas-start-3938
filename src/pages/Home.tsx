import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { photographerInfo } from '@/data/photographer';
import { FeaturedProjectsSection } from '@/components/portfolio/FeaturedProjectsSection';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowRight } from 'lucide-react';
import Marquee from '@/components/Marquee';
import { Link } from 'react-router-dom';
import { useDesktop } from '@/hooks/useDesktop';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const heroPoster =
  'https://images.pexels.com/videos/2675516/free-video-2675516.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200';

const heroVideo =
  'https://videos.pexels.com/video-files/2675516/2675516-sd_960_540_24fps.mp4';

export default function Home() {
  const heroRef = useRef(null);
  const isDesktop = useDesktop(1024);
  const reducedMotion = useReducedMotion();
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', reducedMotion ? '0%' : '20%']);

  useEffect(() => {
    if (!isDesktop || reducedMotion) {
      setShowHeroVideo(false);
      return;
    }

    const canUseConnection =
      typeof navigator === 'undefined' ||
      !('connection' in navigator) ||
      !((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

    if (!canUseConnection) {
      setShowHeroVideo(false);
      return;
    }

    const scheduleVideo = () => setShowHeroVideo(true);

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(scheduleVideo, { timeout: 1600 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = globalThis.setTimeout(scheduleVideo, 900);
    return () => globalThis.clearTimeout(timer);
  }, [isDesktop, reducedMotion]);

  const heroTextInitial = reducedMotion ? false : { opacity: 0, y: 24 };
  const heroTextAnimate = { opacity: 1, y: 0 };
  const heroTextTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const };

  return (
    <>
      <SEOHead />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-[100svh] w-full overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{ y: videoY }}
          >
            <img
              src={heroPoster}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />

            {showHeroVideo && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={heroPoster}
                className="absolute inset-0 w-full h-full object-cover scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </motion.div>

          <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-6">
            <motion.div
              className="text-center space-y-6 max-w-4xl"
              initial={heroTextInitial}
              animate={heroTextAnimate}
              transition={heroTextTransition}
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-extralight tracking-widest text-white"
                initial={heroTextInitial}
                animate={heroTextAnimate}
                transition={heroTextTransition}
              >
                {photographerInfo.name.toUpperCase()}
              </motion.h1>
              


              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                <Link
                  to="/portfolio"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <span>View Selected Work</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-7 py-3 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-white/10 hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  Start a Project
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 sm:bottom-12"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.35, duration: 0.45 }}
            >
              <ScrollIndicator />
            </motion.div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-24 md:py-32 px-6 lg:px-8 bg-background">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide">
                About My Work
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <div className="space-y-4 text-lg font-light leading-relaxed text-muted-foreground">
                <p>
                  {photographerInfo.biography.split('\n\n')[0]}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.25}>
              <MagneticButton>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-base font-light tracking-wide text-foreground hover:text-gold transition-colors duration-300 group"
                >
                  <span>Learn More About Me</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-24 md:py-32 border-t border-border">
          <ScrollReveal direction="up">
            <div className="text-center mb-16 space-y-4 px-6">
              <h2 className="text-4xl md:text-5xl font-light tracking-wide">
                Featured Projects
              </h2>
              <p className="text-lg text-muted-foreground font-light tracking-wide">
                A selection of recent work
              </p>
            </div>
          </ScrollReveal>

          <Marquee />
          <FeaturedProjectsSection />

          <ScrollReveal direction="up" delay={0.2}>
            <div className="flex justify-center mt-16 px-6">
              <MagneticButton>
                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-2 text-lg font-light tracking-wide text-foreground hover:text-gold transition-colors duration-300"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </>
  );
}
