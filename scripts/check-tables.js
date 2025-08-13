// Simple script to check Supabase table structure
const { createClient } = require('@supabase/supabase-js')

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Check articles table structure
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Articles table error:', error)
    } else {
      console.log('Articles table sample:', data)
    }

    // Get table columns info (if possible)
    const { data: tableInfo } = await supabase.rpc('get_table_info', { table_name: 'articles' }).single()
    console.log('Articles table info:', tableInfo)
    
  } catch (err) {
    console.log('Error checking tables:', err)
  }
}

checkTables()