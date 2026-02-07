
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT DEFAULT '',
  department TEXT DEFAULT '',
  course TEXT DEFAULT '',
  year_of_study INT,
  phone TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER ROLES TABLE
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  video_url TEXT,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text','photo','video','event','announcement')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- LIKES TABLE
-- ============================================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT DEFAULT 'like' CHECK (reaction IN ('like','love','haha','wow','sad','angry')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CONVERSATIONS TABLE (chats)
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT FALSE,
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CONVERSATION MEMBERS TABLE
-- ============================================================
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STORIES TABLE
-- ============================================================
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  text_content TEXT,
  background_color TEXT DEFAULT '#1a1a2e',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours') NOT NULL
);
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like','comment','follow','mention','message','announcement')),
  entity_type TEXT,
  entity_id UUID,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_entity_type TEXT NOT NULL CHECK (reported_entity_type IN ('post','comment','user','message')),
  reported_entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to avoid recursive RLS)
-- ============================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  );
$$;

-- Check if user is a member of a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  );
$$;

-- ============================================================
-- AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    ''
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- POSTS
CREATE POLICY "Anyone authenticated can view posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users/admins can delete posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

-- COMMENTS
CREATE POLICY "Anyone authenticated can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users/admins can delete comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

-- LIKES
CREATE POLICY "Anyone authenticated can view likes" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "Anyone authenticated can view follows" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- CONVERSATIONS
CREATE POLICY "Members can view conversations" ON public.conversations FOR SELECT TO authenticated USING (public.is_conversation_member(auth.uid(), id) OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (public.is_conversation_member(auth.uid(), id) OR public.is_admin_or_moderator(auth.uid()));

-- CONVERSATION MEMBERS
CREATE POLICY "Members can view members" ON public.conversation_members FOR SELECT TO authenticated USING (public.is_conversation_member(auth.uid(), conversation_id) OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Members can add members" ON public.conversation_members FOR INSERT TO authenticated WITH CHECK (public.is_conversation_member(auth.uid(), conversation_id) OR auth.uid() = user_id);
CREATE POLICY "Members can leave" ON public.conversation_members FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

-- MESSAGES
CREATE POLICY "Members can view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Members can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

-- STORIES
CREATE POLICY "Anyone authenticated can view active stories" ON public.stories FOR SELECT TO authenticated USING (expires_at > now());
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = recipient_id);

-- REPORTS
CREATE POLICY "Users can view own reports, admins all" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- STORAGE BUCKET FOR MEDIA
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_post ON public.likes(user_id, post_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX idx_stories_user_expires ON public.stories(user_id, expires_at);
CREATE INDEX idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX idx_reports_status ON public.reports(status);
