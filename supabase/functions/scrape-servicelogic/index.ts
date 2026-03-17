import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  let logId: string | null = null
  let configUserId: string | null = null

  try {
    const { configuracao_relatorio_id } = await req.json()
    if (!configuracao_relatorio_id) throw new Error('configuracao_relatorio_id is required')

    // Fetch config
    const { data: config, error: configError } = await supabase
      .from('configuracao_relatorios')
      .select('*')
      .eq('id', configuracao_relatorio_id)
      .single()

    if (configError || !config) throw new Error('Configuração não encontrada')
    configUserId = config.usuario_id

    // Create initial log
    const { data: log, error: logError } = await supabase
      .from('log_execucoes')
      .insert({
        usuario_id: config.usuario_id,
        configuracao_relatorio_id: config.id,
        status: 'Em andamento',
      })
      .select()
      .single()

    if (logError) throw logError
    logId = log.id

    // Fetch credentials
    const { data: cred, error: credError } = await supabase
      .from('credenciais_servicelogic')
      .select('*')
      .eq('usuario_id', config.usuario_id)
      .single()

    if (credError || !cred) throw new Error('Credenciais não encontradas para o usuário')

    // MOCK: Puppeteer extraction via Browserless
    console.log(`[Scrape] Logging into Servicelogic with user: ${cred.username}`)
    console.log(`[Scrape] Navigating to report: ${config.caminho_relatorio}`)

    // Simulate scraping delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockExcelBase64 = 'UEsDBBQAAAAIA...' // Simulated Excel file

    // Call process-excel
    console.log(`[Scrape] Invoking process-excel for logId: ${logId}`)
    const { error: processError } = await supabase.functions.invoke('process-excel', {
      body: {
        configuracao_relatorio_id: config.id,
        usuario_id: config.usuario_id,
        log_id: logId,
        excel_base64: mockExcelBase64,
      },
    })

    if (processError) throw new Error(`Erro ao processar excel: ${processError.message}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Scraping concluído e enviado para processamento' }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    if (logId && configUserId) {
      await supabase
        .from('log_execucoes')
        .update({
          status: 'Erro',
          mensagem_erro: error.message,
        })
        .eq('id', logId)
    } else if (configUserId) {
      await supabase.from('log_execucoes').insert({
        usuario_id: configUserId,
        status: 'Erro',
        mensagem_erro: error.message,
      })
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
