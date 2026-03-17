import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileData, configuracaoId } = await req.json()

    // Simulate parsing the Excel data and preparing it for DB insertion
    const processedRows = 1250
    const dados = { source_file: 'report.xlsx', sample: 'data' }

    return new Response(
      JSON.stringify({
        success: true,
        processedRows,
        dados,
        status: 'processado',
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
