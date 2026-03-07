-- First, add user_id columns to existing tables to link data to users
ALTER TABLE public.loans ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to ensure users only see their own data
DROP POLICY IF EXISTS "Allow all operations on loans" ON public.loans;
DROP POLICY IF EXISTS "Allow all operations on payments" ON public.payments;

-- Create user-specific policies for loans table
CREATE POLICY "Users can view their own loans" ON public.loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" ON public.loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON public.loans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" ON public.loans
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for payments table
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance on user_id queries
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);