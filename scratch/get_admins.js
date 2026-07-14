import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbpwskecvxuixnagizov.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicHdza2Vjdnh1aXhuYWdpem92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjE5NDYsImV4cCI6MjA5ODk5Nzk0Nn0.Sd5g1kaJ-V_cvAatph9QED7cBXiisBfYQekF3z2hoL8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin');
  
  if (error) {
    console.error(error);
  } else {
    console.log("Admin Users:");
    console.log(JSON.stringify(users, null, 2));
  }
}

run();
