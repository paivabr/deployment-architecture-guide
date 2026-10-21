-- Drop the problematic FOR ALL policy
DROP POLICY IF EXISTS "Admins can manage non-secret settings" ON public.settings;

-- Create separate policies for each operation
CREATE POLICY "Admins can insert settings" ON public.settings
    FOR INSERT TO authenticated
    WITH CHECK (scope != 'secret' AND public.is_admin());

CREATE POLICY "Admins can update settings" ON public.settings
    FOR UPDATE TO authenticated
    USING (scope != 'secret' AND public.is_admin())
    WITH CHECK (scope != 'secret' AND public.is_admin());

CREATE POLICY "Admins can delete settings" ON public.settings
    FOR DELETE TO authenticated
    USING (scope != 'secret' AND public.is_admin());