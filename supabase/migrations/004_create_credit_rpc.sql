CREATE OR REPLACE FUNCTION public.adjust_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
    AND credits + p_amount >= 0
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits or user not found';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, v_new_balance);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
