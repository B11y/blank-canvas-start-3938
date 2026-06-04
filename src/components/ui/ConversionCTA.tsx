import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { photographerInfo } from '@/data/photographer';
import { Button } from '@/components/ui/button';

type ConversionCTAProps = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function ConversionCTA({
  title = 'Ready to build a visual identity that works?',
  description = 'Tell me about your brand, goals, timeline, and the kind of design system you want to create.',
  primaryLabel = 'Start a Project',
  primaryHref = '/contact',
  secondaryLabel = 'Message on WhatsApp',
  secondaryHref = photographerInfo.socialLinks.whatsapp,
}: ConversionCTAProps) {
  const isExternalSecondary = secondaryHref.startsWith('http');

  return (
    <section className="px-6 lg:px-8 py-20 md:py-28 border-t border-border bg-card/30">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-light tracking-wide">
          {title}
        </h2>

        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={primaryHref} className="inline-flex items-center gap-2">
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            {isExternalSecondary ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <MessageCircle className="size-4" />
                {secondaryLabel}
              </a>
            ) : (
              <Link to={secondaryHref} className="inline-flex items-center gap-2">
                {secondaryLabel}
              </Link>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
