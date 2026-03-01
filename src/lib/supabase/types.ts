export interface Profile {
  id: string
  email: string
  full_name: string | null
  credits: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'generation' | 'refund' | 'bonus'
  description: string | null
  stripe_session_id: string | null
  balance_after: number
  created_at: string
}

export interface Generation {
  id: string
  user_id: string
  mode: 'cover' | 'single' | 'all'
  style: string
  palette: string
  book_format: string
  subject: string
  prompt_used: string
  replicate_prediction_id: string | null
  aspect_ratio: string
  resolution: string
  credits_used: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<CreditTransaction, 'id' | 'created_at'>>
      }
      generations: {
        Row: Generation
        Insert: Omit<Generation, 'id' | 'created_at'>
        Update: Partial<Omit<Generation, 'id' | 'created_at'>>
      }
    }
  }
}
