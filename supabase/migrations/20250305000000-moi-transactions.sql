-- Create MOI transactions table for tracking money given/received at family functions
CREATE TABLE public.moi_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('given', 'received')),
  person_name TEXT NOT NULL,
  relationship TEXT,
  function_type TEXT NOT NULL,
  function_name TEXT,
  function_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.moi_transactions ENABLE ROW LEVEL SECURITY;

-- User-specific policies
CREATE POLICY "Users can view their own moi_transactions" ON public.moi_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moi_transactions" ON public.moi_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moi_transactions" ON public.moi_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moi_transactions" ON public.moi_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_moi_transactions_user_id ON public.moi_transactions(user_id);
CREATE INDEX idx_moi_transactions_person_name ON public.moi_transactions(person_name);
CREATE INDEX idx_moi_transactions_function_date ON public.moi_transactions(function_date);
CREATE INDEX idx_moi_transactions_type ON public.moi_transactions(type);

-- Auto-update timestamp trigger
CREATE TRIGGER update_moi_transactions_updated_at
  BEFORE UPDATE ON public.moi_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
