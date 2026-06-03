import { motion } from 'framer-motion';
import { Instagram, Linkedin, Facebook, MessageCircle } from 'lucide-react';
import { photographerInfo } from '@/data/photographer';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';

/**
 * About page with photographer biography and professional information
 * Features split layout with portrait video and comprehensive biography
 */
export default function About() {
  return (
    <>
      <SEOHead
        title="About"
        description={`Learn about ${photographerInfo.name}, ${photographerInfo.tagline}. ${photographerInfo.biography.split('\n\n')[0]}`}
        image={photographerInfo.portraitImage}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
      <section className="py-14 md:py-32 px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
              About
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
              Graphic Designer & Visual Identity Maker
            </p>
          </motion.div>
        </div>
      </section>

      {/* Portrait and Biography - Split Layout */}
      <section className="py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Portrait Image */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0.8, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="aspect-[3/4] relative overflow-hidden rounded-sm bg-muted">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="https://images.pexels.com/videos/3888252/afro-hair-fashion-model-3888252.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                >
                  <source src="https://videos.pexels.com/video-files/3888252/3888252-sd_426_226_25fps.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {/* Video from Pexels */}
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {photographerInfo.socialLinks.instagram && (
                  <a
                    href={photographerInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border rounded-sm hover:bg-accent transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="size-5" />
                  </a>
                )}
                {photographerInfo.socialLinks.linkedin && (
                  <a
                    href={photographerInfo.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border rounded-sm hover:bg-accent transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="size-5" />
                  </a>
                )}
                {photographerInfo.socialLinks.behance && (
                  <a
                    href={photographerInfo.socialLinks.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border rounded-sm hover:bg-accent transition-colors"
                    aria-label="Behance"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h6a3 3 0 0 1 0 6H3V8z" />
                      <path d="M3 14h7a3 3 0 0 1 0 6H3v-6z" />
                      <path d="M14 7h7" />
                      <path d="M17 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                    </svg>
                  </a>
                )}
                {photographerInfo.socialLinks.facebook && (
                  <a
                    href={photographerInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border rounded-sm hover:bg-accent transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="size-5" />
                  </a>
                )}
                {photographerInfo.socialLinks.whatsapp && (
                  <a
                    href={photographerInfo.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border rounded-sm hover:bg-accent transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="size-5" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Biography and Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0.8, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Name and Tagline */}
              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-light tracking-wide">
                  {photographerInfo.name}
                </h2>
                <p className="text-xl text-muted-foreground font-light tracking-wide">
                  {photographerInfo.tagline}
                </p>
              </div>

              <Separator />

              {/* Biography */}
              <div className="space-y-4">
                {photographerInfo.biography.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base md:text-lg font-light leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Contact Info */}
              <div className="pt-4 space-y-2">
                <div className="text-sm font-light tracking-wide">
                  <span className="text-muted-foreground">Email: </span>
                  <a
                    href={`mailto:${photographerInfo.email}`}
                    className="text-foreground hover:text-muted-foreground transition-colors"
                  >
                    {photographerInfo.email}
                  </a>
                </div>
                <div className="text-sm font-light tracking-wide">
                  <span className="text-muted-foreground">Location: </span>
                  <span className="text-foreground">{photographerInfo.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0.8, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide">Experience</h2>
              <p className="text-muted-foreground font-light">Selected professional work</p>
            </div>

            <div className="space-y-10">
              {photographerInfo.experience.map((item, i) => (
                <div key={i} className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-10">
                  <div className="space-y-1">
                    <p className="text-sm font-light tracking-wide text-muted-foreground">{item.period}</p>
                    <p className="text-sm font-light tracking-wide text-muted-foreground">{item.location}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-light">{item.company}</h3>
                      <p className="text-base text-muted-foreground font-light">{item.role}</p>
                    </div>
                    <ul className="space-y-2 pt-2">
                      {item.highlights.map((h, j) => (
                        <li key={j} className="text-sm md:text-base font-light leading-relaxed text-muted-foreground flex gap-3">
                          <span className="text-foreground/40 mt-2 size-1 rounded-full bg-current shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills & Tools Section */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0.8, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-12 lg:gap-16"
          >
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide">Tools</h2>
              <div className="flex flex-wrap gap-2">
                {photographerInfo.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-4 py-2 border border-border rounded-sm text-sm font-light tracking-wide"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {photographerInfo.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 border border-border rounded-sm text-sm font-light tracking-wide"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Education & Languages Section */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_1fr] gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0.8, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">Education</h2>
            <div className="space-y-8">
              {photographerInfo.education.map((edu, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-light tracking-wide text-muted-foreground">{edu.period}</p>
                  <h3 className="text-lg md:text-xl font-light">{edu.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground font-light">{edu.institution}</p>
                  {edu.detail && (
                    <p className="text-sm font-light leading-relaxed text-muted-foreground pt-1">{edu.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0.8, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">Languages</h2>
            <ul className="space-y-2">
              {photographerInfo.languages.map((lang) => (
                <li key={lang} className="text-base font-light text-muted-foreground">
                  {lang}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      </div>
    </>
  );
}
