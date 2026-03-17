import { createClient } from 'npm:@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let requestData;
  try {
    requestData = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
  }

  const { configuracao_relatorio_id, usuario_id, log_id, excel_base64 } = requestData;

  try {
    if (!configuracao_relatorio_id || !usuario_id || !excel_base64) {
      throw new Error('Parâmetros ausentes');
    }

    console.log(`[Process] Parsing Excel for config: ${configuracao_relatorio_id}`);
    
    // MOCK: parsing excel
    // In a real scenario we would use npm:xlsx to parse excel_base64
    const jsonData = [
      { id: 1, cliente: "Empresa Alpha", valor: 1500.00, vencimento: "2023-10-15", status: "Pago" },
      { id: 2, cliente: "Empresa Beta", valor: 2300.50, vencimento: "2023-10-16", status: "Pendente" },
      { id: 3, cliente: "Empresa Gamma", valor: 890.00, vencimento: "2023-10-17", status: "Atrasado" },
      { id: 4, cliente: "Empresa Delta", valor: 4500.00, vencimento: "2023-10-18", status: "Pendente" },
      { id: 5, cliente: "Empresa Epsilon", valor: 120.00, vencimento: "2023-10-19", status: "Pago" }
    ];

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Insert into dados_importados
    const { error: insertError } = await supabase
      .from('dados_importados')
      .insert({
        usuario_id,
        configuracao_relatorio_id,
        dados: jsonData,
        status: 'Sucesso',
        registros: jsonData.length,
        source: 'Servicelogic Scraping'
      });

    if (insertError) throw insertError;

    // Update log
    if (log_id) {
      await supabase
        .from('log_execucoes')
        .update({ status: 'Concluído' })
        .eq('id', log_id);
    }

    return new Response(JSON.stringify({ success: true, registros: jsonData.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    if (log_id) {
      await supabase
        .from('log_execucoes')
        .update({
          status: 'Erro',
          mensagem_erro: `Erro no processamento: ${error.message}`
        })
        .eq('id', log_id);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    });
  }
});
