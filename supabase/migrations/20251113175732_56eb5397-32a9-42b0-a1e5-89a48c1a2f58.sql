-- Enable realtime for records table
ALTER PUBLICATION supabase_realtime ADD TABLE public.records;

-- Enable realtime for record_breaks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.record_breaks;