import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  brandName: z
    .string()
    .trim()
    .min(2, { message: 'Brand / company name must be at least 2 characters' })
    .max(120, { message: 'Brand / company name must be less than 120 characters' }),
  whatsapp: z
    .string()
    .trim()
    .max(40, { message: 'WhatsApp number must be less than 40 characters' })
    .optional(),
  projectType: z
    .string()
    .trim()
    .min(2, { message: 'Please choose or write a project type' })
    .max(120, { message: 'Project type must be less than 120 characters' }),
  budgetRange: z
    .string()
    .trim()
    .min(2, { message: 'Please add an estimated budget range' })
    .max(120, { message: 'Budget range must be less than 120 characters' }),
  timeline: z
    .string()
    .trim()
    .min(2, { message: 'Please add a target timeline' })
    .max(120, { message: 'Timeline must be less than 120 characters' }),
  message: z
    .string()
    .trim()
    .min(20, { message: 'Brief must be at least 20 characters' })
    .max(1600, { message: 'Brief must be less than 1600 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const projectTypeOptions = [
  'Brand Identity',
  'Logo Design',
  'Social Media System',
  'Packaging Design',
  'Full Visual Identity',
  'Other',
];

const budgetOptions = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $3,000',
  '$3,000+',
  'Not sure yet',
];

const timelineOptions = [
  'ASAP',
  '2–4 weeks',
  '1–2 months',
  '3+ months',
  'Flexible',
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      brandName: '',
      whatsapp: '',
      projectType: '',
      budgetRange: '',
      timeline: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/meedrlre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          brandName: data.brandName,
          whatsapp: data.whatsapp,
          projectType: data.projectType,
          budgetRange: data.budgetRange,
          timeline: data.timeline,
          message: data.message,
          _subject: `New ${data.projectType} inquiry from ${data.name}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setIsSuccess(true);
      form.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      form.setError('root', {
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="bg-accent border border-border rounded-sm p-8 text-center space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle2 className="size-16 mx-auto text-green-600 dark:text-green-400" />
        </motion.div>
        <h3 className="text-2xl font-light tracking-wide">Brief Sent!</h3>
        <p className="text-muted-foreground font-light leading-relaxed">
          Thank you for sharing your project details. I’ll review the brief and get back to you as soon as possible.
        </p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" className="font-light" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" className="font-light" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  Brand / Company <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Brand or company name" className="font-light" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  WhatsApp <span className="text-muted-foreground text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="+20..." className="font-light" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-light tracking-wide">
                Project Type <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...field}
                >
                  <option value="">Select project type</option>
                  {projectTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage className="text-xs font-light" />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="budgetRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  Budget Range <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    <option value="">Select budget range</option>
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light tracking-wide">
                  Timeline <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    <option value="">Select timeline</option>
                    {timelineOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-light tracking-wide">
                Project Brief <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell me about your brand, goals, audience, deliverables, references, and what success looks like..."
                  className="min-h-40 font-light resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-light" />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-destructive font-light">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-6 text-base font-light tracking-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Sending Brief...
            </>
          ) : (
            'Send Project Brief'
          )}
        </Button>
      </form>
    </Form>
  );
}
