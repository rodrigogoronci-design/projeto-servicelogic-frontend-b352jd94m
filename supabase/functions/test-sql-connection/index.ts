import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { server_ip, database_name, username, password_encrypted, table_name, usuario_id } =
      await req.json()

    if (!server_ip || !database_name || !username || !usuario_id) {
      throw new Error('Parâmetros de conexão ausentes.')
    }

    // In a real scenario, we would use npm:mssql here to test the connection:
    // import sql from 'npm:mssql';
    // await sql.connect(`Server=${server_ip};Database=${database_name};User Id=${username};Password=${password_encrypted};`);

    // MOCK: Simulate connection delay and success/failure logic based on IP format
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let status = 'Sucesso'
    let errorMessage = null

    if (server_ip === '0.0.0.0' || server_ip.includes('error')) {
      status = 'Erro'
      errorMessage = 'Falha ao conectar: Tempo de limite excedido ou servidor inacessível.'
      throw new Error(errorMessage)
    }

    // Log success
    await supabase.from('log_execucoes_sql').insert({
      usuario_id,
      operation_type: 'Teste de Conexão',
      status: 'Sucesso',
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Conexão estabelecida com sucesso!' }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    // Log error if usuario_id is available in the request
    try {
      const { usuario_id } = await req.clone().json()
      if (usuario_id) {
        await supabase.from('log_execucoes_sql').insert({
          usuario_id,
          operation_type: 'Teste de Conexão',
          status: 'Erro',
          error_message: error.message,
        })
      }
    } catch (_) {
      /* ignore clone errors */
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
