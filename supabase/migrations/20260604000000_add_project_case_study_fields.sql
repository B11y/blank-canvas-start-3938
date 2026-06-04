alter table public.projects
  add column if not exists challenge text,
  add column if not exists goal text,
  add column if not exists concept text,
  add column if not exists deliverables text,
  add column if not exists process text,
  add column if not exists result text,
  add column if not exists testimonial text;
