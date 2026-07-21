-- Enable pg_net extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.notify_order_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', null
  );

  PERFORM net.http_post(
    url := 'https://xbpwskecvxuixnagizov.supabase.co/functions/v1/send-order-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_order_created ON public.orders;

-- Create the trigger on INSERT
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_email();
