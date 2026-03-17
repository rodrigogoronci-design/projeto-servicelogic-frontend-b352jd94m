import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nome_tabela, campos_selecionados, tipo_grafico, usuario_id } = await req.json()

    if (!nome_tabela || !campos_selecionados || !tipo_grafico || !usuario_id) {
      throw new Error('Parâmetros ausentes para gerar preview.')
    }

    // Simulate DB Aggregation Query Latency
    await new Promise((resolve) => setTimeout(resolve, 600))

    // MOCK DATA GENERATION based on requested chart type to ensure Recharts compatibility
    let chartData: any[] = []
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']
    const categories = ['Tecnologia', 'Serviços', 'Varejo', 'Indústria', 'Outros']

    // Generate sensible mock data depending on the chart type
    if (tipo_grafico === 'bar' || tipo_grafico === 'line') {
      // Time-series or categorical trend data
      const labels =
        nome_tabela.includes('Mensal') || nome_tabela.includes('DWBI') ? months : categories

      chartData = labels.map((label) => {
        const dataPoint: any = { name: label }
        // Create a value for each selected field, or fallback to generic values
        if (campos_selecionados.length > 0) {
          campos_selecionados.forEach((field: string, i: number) => {
            // Try to make some fields numeric
            if (
              field.toLowerCase().includes('valor') ||
              field.toLowerCase().includes('total') ||
              field.toLowerCase().includes('faturamento') ||
              field.toLowerCase().includes('lucro')
            ) {
              dataPoint[field] = Math.floor(Math.random() * 50000) + 10000
            } else if (
              field.toLowerCase().includes('qtd') ||
              field.toLowerCase().includes('volume') ||
              field.toLowerCase().includes('quantidade')
            ) {
              dataPoint[field] = Math.floor(Math.random() * 500) + 50
            } else {
              // Fallback numeric value for uncharted fields
              dataPoint[`Metrica_${i + 1}`] = Math.floor(Math.random() * 1000)
            }
          })
        } else {
          dataPoint.valor = Math.floor(Math.random() * 50000) + 10000
        }
        return dataPoint
      })
    } else if (tipo_grafico === 'pie') {
      // Proportional data
      const fieldName = campos_selecionados[0] || 'Valor'
      chartData = categories.slice(0, 4).map((cat) => ({
        name: cat,
        value: Math.floor(Math.random() * 100) + 10,
      }))
    } else if (tipo_grafico === 'scatter') {
      // XY Data
      for (let i = 0; i < 20; i++) {
        chartData.push({
          x: Math.floor(Math.random() * 1000),
          y: Math.floor(Math.random() * 1000),
          z: Math.floor(Math.random() * 100) + 20, // bubble size
          name: `Ponto ${i}`,
        })
      }
    }

    return new Response(JSON.stringify({ success: true, data: chartData }), {
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
