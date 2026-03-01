CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation', 'refund', 'bonus')),
  description TEXT,
  stripe_session_id TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('cover', 'single', 'all')),
  style TEXT NOT NULL,
  palette TEXT NOT NULL,
  book_format TEXT NOT NULL,
  subject TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  replicate_prediction_id TEXT,
  aspect_ratio TEXT NOT NULL,
  resolution TEXT NOT NULL DEFAULT '2K',
  credits_used INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at);
