-- Fix pages RLS policy (FOR ALL without WITH CHECK)
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;

CREATE POLICY "Admins can insert pages" ON public.pages
    FOR INSERT TO authenticated
    WITH CHECK (public.is_moderator_or_above());

CREATE POLICY "Admins can update pages" ON public.pages
    FOR UPDATE TO authenticated
    USING (public.is_moderator_or_above())
    WITH CHECK (public.is_moderator_or_above());

CREATE POLICY "Admins can delete pages" ON public.pages
    FOR DELETE TO authenticated
    USING (public.is_moderator_or_above());