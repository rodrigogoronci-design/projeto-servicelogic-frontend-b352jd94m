import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch active configurations
    const { data: configs, error } = await supabase
      .from('configuracao_relatorios')
      .select('*')
      .eq('ativo', true)

    if (error) throw error

    const results = []

    for (const config of configs || []) {
      // Check last execution
      const { data: lastLog } = await supabase
        .from('log_execucoes')
        .select('data_execucao, status')
        .eq('configuracao_relatorio_id', config.id)
        .order('data_execucao', { ascending: false })
        .limit(1)
        .single()

      let shouldRun = false

      if (!lastLog) {
        shouldRun = true
      } else {
        const hoursSinceLast =
          (new Date().getTime() - new Date(lastLog.data_execucao).getTime()) / (1000 * 60 * 60)
        if (hoursSinceLast >= config.frequencia_horas) {
          shouldRun = true
        }
      }

      if (shouldRun) {
        console.log(`[Schedule] Triggering scrape for config: ${config.id}`)
        const { error: invokeError } = await supabase.functions.invoke('scrape-servicelogic', {
          body: { configuracao_relatorio_id: config.id },
        })

        if (invokeError) {
          await supabase.from('log_execucoes').insert({
            usuario_id: config.usuario_id,
            configuracao_relatorio_id: config.id,
            status: 'Erro',
            mensagem_erro: `Falha ao iniciar scraping: ${invokeError.message}`,
          })
          results.push({ id: config.id, status: 'error', error: invokeError.message })
        } else {
          results.push({ id: config.id, status: 'queued' })
        }
      } else {
        results.push({ id: config.id, status: 'skipped', reason: 'frequency_not_met' })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
