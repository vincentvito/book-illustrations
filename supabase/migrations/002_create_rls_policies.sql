ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);
