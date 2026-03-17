import { createClient } from 'npm:@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nome_tabela, campos_selecionados, tipo_grafico, usuario_id } = await req.json();

    if (!nome_tabela || !campos_selecionados || !tipo_grafico || !usuario_id) {
      throw new Error('Parâmetros ausentes para gerar preview.');
    }

    // Simulate DB Aggregation Query Latency
    await new Promise(resolve => setTimeout(resolve, 600));

    // Normalize campos_selecionados
    const normalized = (campos_selecionados || []).map((c: any) => {
      if (typeof c === 'string') return { field_name: c, type: 'metric', display_label: c };
      return c;
    });

    const dimensions = normalized.filter((c: any) => c.type === 'dimension');
    const metrics = normalized.filter((c: any) => c.type === 'metric');

    let chartData: any[] = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    const categories = ['Tecnologia', 'Serviços', 'Varejo', 'Indústria', 'Outros'];

    if (tipo_grafico === 'bar' || tipo_grafico === 'line') {
      const dimKey = dimensions[0]?.display_label || dimensions[0]?.field_name || 'name';
      const labels = nome_tabela.includes('Mensal') || nome_tabela.includes('DWBI') ? months : categories;
      
      chartData = labels.map(label => {
        const dataPoint: any = { [dimKey]: label, name: label };
        if (metrics.length > 0) {
          metrics.forEach((m: any) => {
            const key = m.display_label || m.field_name;
            let baseVal = Math.floor(Math.random() * 50000) + 10000;
            // simulate aggregation variation
            if (m.aggregation === 'count') baseVal = Math.floor(Math.random() * 500) + 50;
            else if (m.aggregation === 'avg') baseVal = Math.floor(Math.random() * 5000) + 1000;
            else if (m.aggregation === 'max') baseVal = Math.floor(Math.random() * 80000) + 40000;
            else if (m.aggregation === 'min') baseVal = Math.floor(Math.random() * 10000) + 1000;
            
            dataPoint[key] = baseVal;
          });
        } else {
          dataPoint.valor = Math.floor(Math.random() * 50000) + 10000;
        }
        return dataPoint;
      });

    } else if (tipo_grafico === 'pie') {
      const dimKey = dimensions[0]?.display_label || dimensions[0]?.field_name || 'name';
      const metricKey = metrics[0]?.display_label || metrics[0]?.field_name || 'valor';
      
      chartData = categories.slice(0, 5).map(cat => ({
        [dimKey]: cat,
        name: cat,
        [metricKey]: Math.floor(Math.random() * 100) + 10
      }));
    } else if (tipo_grafico === 'scatter') {
      const xKey = dimensions[0]?.display_label || dimensions[0]?.field_name || 'x';
      const yKey = metrics[0]?.display_label || metrics[0]?.field_name || 'y';
      
      for (let i = 0; i < 20; i++) {
        chartData.push({
          [xKey]: Math.floor(Math.random() * 1000),
          [yKey]: Math.floor(Math.random() * 1000),
          name: `Ponto ${i}`
        });
      }
    }

    return new Response(JSON.stringify({ success: true, data: chartData }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    });
  }
});
