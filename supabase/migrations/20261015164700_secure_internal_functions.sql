-- Trigger functions: fully lock down (triggers still fire)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- RLS-referenced and auth-guarded functions: keep authenticated, revoke anon
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_moderator_or_above() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_moderator_or_above() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_teacher_or_above() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher_or_above() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(_role user_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(_role user_role) TO authenticated;