-- Function to bootstrap the first admin (bypasses RLS)
-- Only works when there are NO existing admins
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(target_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Check if any admin exists
    SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    
    -- Only allow if no admins exist
    IF admin_count > 0 THEN
        RAISE EXCEPTION 'Admin already exists. Use admin panel to manage roles.';
    END IF;
    
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Insert the admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN true;
END;
$$;

-- Grant execute to authenticated users (the function itself checks conditions)
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(UUID) TO authenticated;