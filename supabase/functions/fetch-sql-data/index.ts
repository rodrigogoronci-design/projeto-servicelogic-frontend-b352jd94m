import { createClient } from 'npm:@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { usuario_id, forceRefresh } = await req.json();

    if (!usuario_id) throw new Error('usuario_id é obrigatório.');

    // 1. Check Cache if not forced
    if (!forceRefresh) {
      const { data: cache } = await supabase
        .from('cache_dados_sql')
        .select('data, updated_at')
        .eq('usuario_id', usuario_id)
        .single();

      if (cache && cache.data) {
        // Log cache hit
        await supabase.from('log_execucoes_sql').insert({
          usuario_id,
          operation_type: 'Atualização Dashboard',
          status: 'Sucesso (Cache)'
        });
        return new Response(JSON.stringify({ success: true, data: cache.data, cached: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        });
      }
    }

    // 2. Fetch Credentials
    const { data: creds, error: credsError } = await supabase
      .from('credenciais_sql_server')
      .select('*')
      .eq('usuario_id', usuario_id)
      .single();

    if (credsError || !creds) {
      throw new Error('Credenciais do SQL Server não configuradas.');
    }

    // 3. Simulate Data Fetching from SQL Server (DWBI_PBIv2_Conhecimento)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // MOCK DATA GENERATION matching the required charts
    const mockData = {
      documentos_mes: [
        { mes: 'Jan', volume: 120 }, { mes: 'Fev', volume: 150 }, { mes: 'Mar', volume: 180 },
        { mes: 'Abr', volume: 140 }, { mes: 'Mai', volume: 210 }, { mes: 'Jun', volume: 250 }
      ],
      valores_mes: [
        { mes: 'Jan', valor: 15000 }, { mes: 'Fev', valor: 18500 }, { mes: 'Mar', valor: 22000 },
        { mes: 'Abr', valor: 17000 }, { mes: 'Mai', valor: 26000 }, { mes: 'Jun', valor: 31000 }
      ],
      por_cliente: [
        { cliente: 'TechCorp SA', valor: 45000 }, { cliente: 'GlobalLogistics', valor: 38000 },
        { cliente: 'Alpha Industries', valor: 25000 }, { cliente: 'Beta Retail', valor: 15000 },
        { cliente: 'Outros', valor: 6500 }
      ],
      por_tipo_documento: [
        { tipo: 'NFe', volume: 450 }, { tipo: 'CTe', volume: 320 },
        { tipo: 'MDFe', volume: 150 }, { tipo: 'NFSe', volume: 80 }
      ],
      por_status: [
        { status: 'Processado', volume: 650 }, { status: 'Pendente', volume: 120 },
        { status: 'Erro', volume: 35 }, { status: 'Cancelado', volume: 15 }
      ],
      last_update: new Date().toISOString()
    };

    // 4. Update Cache
    const { error: upsertError } = await supabase
      .from('cache_dados_sql')
      .upsert({ 
        usuario_id, 
        data: mockData, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'usuario_id' });

    if (upsertError) console.error('Cache upsert error:', upsertError);

    // 5. Log Success
    await supabase.from('log_execucoes_sql').insert({
      usuario_id,
      operation_type: 'Atualização Dashboard',
      status: 'Sucesso'
    });

    return new Response(JSON.stringify({ success: true, data: mockData, cached: false }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error: any) {
    // Log Error
    try {
      const { usuario_id } = await req.clone().json();
      if (usuario_id) {
        await supabase.from('log_execucoes_sql').insert({
          usuario_id,
          operation_type: 'Atualização Dashboard',
          status: 'Erro',
          error_message: error.message
        });
      }
    } catch (_) {}

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    });
  }
});
