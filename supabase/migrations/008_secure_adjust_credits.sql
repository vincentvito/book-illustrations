-- P0: Add auth guard to prevent cross-user credit manipulation
-- P1: Add Stripe session idempotency to prevent double-crediting
CREATE OR REPLACE FUNCTION public.adjust_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_stripe_session_id TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Only allow if caller is the target user (normal API routes)
  -- or if auth.uid() is NULL (service_role / webhook calls)
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user''s credits';
  END IF;

  -- Idempotency: if a stripe_session_id is provided and already processed, skip
  IF p_stripe_session_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.credit_transactions
      WHERE stripe_session_id = p_stripe_session_id
    ) THEN
      SELECT credits INTO v_new_balance
      FROM public.profiles WHERE id = p_user_id;
      RETURN COALESCE(v_new_balance, 0);
    END IF;
  END IF;

  UPDATE public.profiles
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
    AND credits + p_amount >= 0
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits or user not found';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after, stripe_session_id)
  VALUES (p_user_id, p_amount, p_type, p_description, v_new_balance, p_stripe_session_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unique index on stripe_session_id (NULLs are not constrained)
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_stripe_session_unique
  ON public.credit_transactions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
