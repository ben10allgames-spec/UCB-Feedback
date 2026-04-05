
ALTER TABLE public.feedback ADD COLUMN category text NOT NULL DEFAULT 'general';
ALTER TABLE public.feedback ADD COLUMN department text NOT NULL DEFAULT 'general';

CREATE POLICY "Authenticated users can delete feedback" ON public.feedback FOR DELETE TO authenticated USING (true);
