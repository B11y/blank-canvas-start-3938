import { SupabaseProjectsSection } from '@/components/portfolio/SupabaseProjectsSection';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';

/**
 * Portfolio page with live Supabase projects
 * Features smooth animations and responsive layout
 */
export default function Portfolio() {
  return (
    <>
      <SEOHead
        title="Portfolio"
        description="Browse my complete graphic design portfolio featuring branding, social media, print, packaging, and illustration projects."
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-14 md:py-32 px-6 lg:px-8 border-b border-border">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
                Portfolio
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto">
                A curated selection of graphic design work — branding, social media, print, packaging, and illustration.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Live projects from Supabase */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">Latest Work</h2>
            <p className="text-muted-foreground mt-2">Fresh projects, updated regularly.</p>
          </div>
          <SupabaseProjectsSection />
        </section>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>
    </>
  );
}
