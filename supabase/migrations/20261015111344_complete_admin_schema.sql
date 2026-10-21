-- =====================================================
-- ENUM TYPES
-- =====================================================
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'teacher', 'student');
CREATE TYPE setting_scope AS ENUM ('public', 'private', 'secret', 'admin', 'draft');
CREATE TYPE provider_status AS ENUM ('not_configured', 'test_pending', 'validating', 'working', 'attention', 'failed', 'disabled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'approved', 'declined', 'cancelled', 'refunded', 'chargeback');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE webhook_status AS ENUM ('received', 'processing', 'processed', 'failed', 'ignored');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'download', 'live');
CREATE TYPE menu_position AS ENUM ('header', 'footer', 'both');
CREATE TYPE custom_field_type AS ENUM ('text', 'number', 'boolean', 'date', 'select', 'multiselect', 'url', 'image');

-- =====================================================
-- PROFILES (auto-created on signup)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- USER ROLES (admin, moderator, teacher, student)
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Boolean helper to check roles (SECURITY DEFINER to avoid recursion)
CREATE FUNCTION public.has_role(_role user_role)
RETURNS boolean LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid()) AND role = _role
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(user_role) TO authenticated;

-- Helper: is admin
CREATE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Helper: is moderator or above
CREATE FUNCTION public.is_moderator_or_above()
RETURNS boolean LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'moderator')
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_moderator_or_above() TO authenticated;

-- Helper: is teacher or above
CREATE FUNCTION public.is_teacher_or_above()
RETURNS boolean LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'moderator', 'teacher')
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_teacher_or_above() TO authenticated;

-- Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- =====================================================
-- AUDIT LOG
-- =====================================================
CREATE TABLE public.audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit log" ON public.audit_log
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admins can view all categories" ON public.categories
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- =====================================================
-- COURSES
-- =====================================================
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    thumbnail_url TEXT,
    cover_url TEXT,
    teacher_id UUID REFERENCES auth.users(id),
    category_id UUID REFERENCES public.categories(id),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    promotional_price DECIMAL(10,2),
    promotional_ends_at TIMESTAMPTZ,
    status content_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    total_duration_minutes INT DEFAULT 0,
    total_lessons INT DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX idx_courses_category_id ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Teachers can view own courses" ON public.courses
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Admins can view all courses" ON public.courses
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Teachers can create courses" ON public.courses
    FOR INSERT TO authenticated
    WITH CHECK (public.is_teacher_or_above() AND (SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can update own courses" ON public.courses
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = teacher_id OR public.is_admin())
    WITH CHECK ((SELECT auth.uid()) = teacher_id OR public.is_admin());

CREATE POLICY "Admins can delete courses" ON public.courses
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- =====================================================
-- MODULES
-- =====================================================
CREATE TABLE public.modules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_course_id ON public.modules(course_id);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of published courses" ON public.modules
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.status = 'published'
    ));

CREATE POLICY "Teachers can manage own course modules" ON public.modules
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND (c.teacher_id = (SELECT auth.uid()) OR public.is_admin())
    ));

-- =====================================================
-- LESSONS
-- =====================================================
CREATE TABLE public.lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type lesson_type NOT NULL DEFAULT 'video',
    video_url TEXT,
    video_provider TEXT DEFAULT 'panda',
    video_id TEXT,
    video_duration_seconds INT,
    content TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Public: can see lesson metadata of published courses (not content/video)
CREATE POLICY "Anyone can view lesson info of published courses" ON public.lessons
    FOR SELECT TO anon, authenticated
    USING (is_published = true AND EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = module_id AND c.status = 'published'
    ));

CREATE POLICY "Teachers can manage own course lessons" ON public.lessons
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = module_id AND (c.teacher_id = (SELECT auth.uid()) OR public.is_admin())
    ));

-- =====================================================
-- LESSON ASSETS (downloads, attachments)
-- =====================================================
CREATE TABLE public.lesson_assets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_assets_lesson_id ON public.lesson_assets(lesson_id);

ALTER TABLE public.lesson_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage lesson assets" ON public.lesson_assets
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.modules m ON m.id = l.module_id
        JOIN public.courses c ON c.id = m.course_id
        WHERE l.id = lesson_id AND (c.teacher_id = (SELECT auth.uid()) OR public.is_admin())
    ));

-- =====================================================
-- PAGES (institutional pages)
-- =====================================================
CREATE TABLE public.pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    featured_image_url TEXT,
    status content_status NOT NULL DEFAULT 'draft',
    show_in_menu BOOLEAN NOT NULL DEFAULT false,
    menu_position menu_position,
    menu_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_status ON public.pages(status);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages" ON public.pages
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Admins can manage pages" ON public.pages
    FOR ALL TO authenticated
    USING (public.is_moderator_or_above());

-- =====================================================
-- MENU ITEMS
-- =====================================================
CREATE TABLE public.menu_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    position menu_position NOT NULL DEFAULT 'header',
    parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    opens_new_tab BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_position ON public.menu_items(position);
CREATE INDEX idx_menu_items_parent_id ON public.menu_items(parent_id);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active menu items" ON public.menu_items
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- HOME SECTIONS
-- =====================================================
CREATE TABLE public.home_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    content JSONB,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active home sections" ON public.home_sections
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage home sections" ON public.home_sections
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- CUSTOM FIELDS (for courses, etc.)
-- =====================================================
CREATE TABLE public.custom_fields (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_type custom_field_type NOT NULL,
    field_label TEXT NOT NULL,
    field_options JSONB,
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(entity_type, field_name)
);

CREATE INDEX idx_custom_fields_entity_type ON public.custom_fields(entity_type);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active custom fields" ON public.custom_fields
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage custom fields" ON public.custom_fields
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- CUSTOM FIELD VALUES
-- =====================================================
CREATE TABLE public.custom_field_values (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_field_id UUID REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
    entity_id UUID NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(custom_field_id, entity_id)
);

CREATE INDEX idx_custom_field_values_entity_id ON public.custom_field_values(entity_id);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view field values of published entities" ON public.custom_field_values
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage field values" ON public.custom_field_values
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- PAYMENT PROVIDERS
-- =====================================================
CREATE TABLE public.payment_providers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    description TEXT,
    environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    status provider_status NOT NULL DEFAULT 'not_configured',
    is_default BOOLEAN NOT NULL DEFAULT false,
    webhook_url TEXT,
    webhook_configured BOOLEAN NOT NULL DEFAULT false,
    last_test_at TIMESTAMPTZ,
    last_test_result JSONB,
    config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_providers_provider_type ON public.payment_providers(provider_type);
CREATE INDEX idx_payment_providers_status ON public.payment_providers(status);

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view payment providers" ON public.payment_providers
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Only admins can manage payment providers" ON public.payment_providers
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- PAYMENT PROVIDER CREDENTIALS (encrypted, never sent to browser)
-- =====================================================
CREATE TABLE public.payment_provider_credentials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES public.payment_providers(id) ON DELETE CASCADE NOT NULL,
    credential_type TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, credential_type)
);

CREATE INDEX idx_provider_credentials_provider_id ON public.payment_provider_credentials(provider_id);

ALTER TABLE public.payment_provider_credentials ENABLE ROW LEVEL SECURITY;

-- NO SELECT policy for credentials - server-side only via Edge Functions
-- Admins can only INSERT/UPDATE via server-side function
CREATE POLICY "Only server can manage credentials" ON public.payment_provider_credentials
    FOR ALL TO authenticated
    USING (false);

-- =====================================================
-- PAYMENT METHODS CONFIG (Pix, credit card, etc.)
-- =====================================================
CREATE TABLE public.payment_methods_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES public.payment_providers(id) ON DELETE CASCADE NOT NULL,
    method_type TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    display_name TEXT,
    description TEXT,
    icon_url TEXT,
    max_installments INT,
    min_installment_value DECIMAL(10,2),
    config JSONB,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, method_type)
);

CREATE INDEX idx_payment_methods_provider_id ON public.payment_methods_config(provider_id);

ALTER TABLE public.payment_methods_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment methods" ON public.payment_methods_config
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Public can see enabled methods (for checkout)
CREATE POLICY "Anyone can view enabled payment methods" ON public.payment_methods_config
    FOR SELECT TO anon, authenticated
    USING (is_enabled = true);

-- =====================================================
-- CHECKOUT SETTINGS
-- =====================================================
CREATE TABLE public.checkout_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    default_provider_id UUID REFERENCES public.payment_providers(id),
    max_installments INT DEFAULT 12,
    min_installment_value DECIMAL(10,2) DEFAULT 10.00,
    checkout_expiry_minutes INT DEFAULT 30,
    success_page_url TEXT,
    cancel_page_url TEXT,
    terms_url TEXT,
    privacy_url TEXT,
    checkout_message TEXT,
    require_phone BOOLEAN NOT NULL DEFAULT false,
    require_cpf BOOLEAN NOT NULL DEFAULT true,
    config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view checkout settings" ON public.checkout_settings
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Only admins can manage checkout settings" ON public.checkout_settings
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- COUPONS
-- =====================================================
CREATE TABLE public.coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_value DECIMAL(10,2),
    max_discount_value DECIMAL(10,2),
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    applies_to_courses UUID[],
    applies_to_categories UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can validate coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (public.is_admin());

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    coupon_id UUID REFERENCES public.coupons(id),
    coupon_code TEXT,
    payment_provider_id UUID REFERENCES public.payment_providers(id),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_cpf TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE TABLE public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_course_id ON public.order_items(course_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    ));

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    ));

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.payment_providers(id) NOT NULL,
    external_id TEXT,
    payment_method TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    installments INT DEFAULT 1,
    pix_qr_code TEXT,
    pix_qr_code_base64 TEXT,
    pix_expiration TIMESTAMPTZ,
    boleto_url TEXT,
    boleto_barcode TEXT,
    boleto_expiration TIMESTAMPTZ,
    card_last_four TEXT,
    card_brand TEXT,
    gateway_response JSONB,
    error_message TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_external_id ON public.payments(external_id);
CREATE INDEX idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    ));

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- =====================================================
-- ENROLLMENTS
-- =====================================================
CREATE TABLE public.enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    payment_id UUID REFERENCES public.payments(id),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    progress_percent DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can update own enrollment progress" ON public.enrollments
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- =====================================================
-- WEBHOOK EVENTS (deduplication)
-- =====================================================
CREATE TABLE public.webhook_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status webhook_status NOT NULL DEFAULT 'received',
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider, event_id)
);

CREATE INDEX idx_webhook_events_provider_event_id ON public.webhook_events(provider, event_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view webhook events" ON public.webhook_events
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- =====================================================
-- SETTINGS (multi-scope)
-- =====================================================
CREATE TABLE public.settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB,
    scope setting_scope NOT NULL DEFAULT 'private',
    description TEXT,
    validation_rules JSONB,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(category, key)
);

CREATE INDEX idx_settings_category ON public.settings(category);
CREATE INDEX idx_settings_scope ON public.settings(scope);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public settings are visible to all
CREATE POLICY "Anyone can view public settings" ON public.settings
    FOR SELECT TO anon, authenticated
    USING (scope = 'public');

-- Admin settings
CREATE POLICY "Admins can view admin settings" ON public.settings
    FOR SELECT TO authenticated
    USING (scope IN ('public', 'private', 'admin') AND public.is_admin());

-- Secret settings are NEVER returned to browser (server-side only)
CREATE POLICY "Admins can manage non-secret settings" ON public.settings
    FOR ALL TO authenticated
    USING (scope != 'secret' AND public.is_admin());

-- =====================================================
-- SETTINGS VERSIONS (history)
-- =====================================================
CREATE TABLE public.settings_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_id UUID REFERENCES public.settings(id) ON DELETE CASCADE NOT NULL,
    value JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_versions_setting_id ON public.settings_versions(setting_id);
CREATE INDEX idx_settings_versions_created_at ON public.settings_versions(created_at DESC);

ALTER TABLE public.settings_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view settings history" ON public.settings_versions
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_home_sections_updated_at BEFORE UPDATE ON public.home_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON public.payment_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_provider_credentials_updated_at BEFORE UPDATE ON public.payment_provider_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_config_updated_at BEFORE UPDATE ON public.payment_methods_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checkout_settings_updated_at BEFORE UPDATE ON public.checkout_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON public.custom_field_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT CHECKOUT SETTINGS
-- =====================================================
INSERT INTO public.checkout_settings (id) VALUES (gen_random_uuid());