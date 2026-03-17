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
    const { action, table_name, usuario_id } = await req.json();

    if (!usuario_id) throw new Error('usuario_id is required');

    // Simulate fetching credentials and connecting to SQL Server
    const { data: creds, error: credsError } = await supabase
      .from('credenciais_sql_server')
      .select('*')
      .eq('usuario_id', usuario_id)
      .single();

    if (credsError || !creds) {
      throw new Error('Credenciais do SQL Server não configuradas. Configure-as primeiro.');
    }

    // MOCK DATA: Simulate SQL Server Information Schema queries
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

    let resultData = [];

    if (action === 'get_tables') {
      // Simulate: SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      resultData = [
        { table_name: 'Vendas_Gerais' },
        { table_name: 'Clientes_Ativos' },
        { table_name: 'Desempenho_Mensal' },
        { table_name: 'DWBI_PBIv2_Conhecimento' }
      ];
    } else if (action === 'get_columns' && table_name) {
      // Simulate: SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tabela
      const mockColumns: Record<string, any[]> = {
        'Vendas_Gerais': [
          { column_name: 'DataVenda', data_type: 'date' },
          { column_name: 'ValorTotal', data_type: 'decimal' },
          { column_name: 'Categoria', data_type: 'varchar' },
          { column_name: 'Quantidade', data_type: 'int' }
        ],
        'Clientes_Ativos': [
          { column_name: 'Regiao', data_type: 'varchar' },
          { column_name: 'TotalClientes', data_type: 'int' },
          { column_name: 'TicketMedio', data_type: 'decimal' }
        ],
        'Desempenho_Mensal': [
          { column_name: 'Mes', data_type: 'varchar' },
          { column_name: 'Faturamento', data_type: 'decimal' },
          { column_name: 'Custos', data_type: 'decimal' },
          { column_name: 'Lucro', data_type: 'decimal' }
        ],
        'DWBI_PBIv2_Conhecimento': [
          { column_name: 'Mes', data_type: 'varchar' },
          { column_name: 'Volume', data_type: 'int' },
          { column_name: 'Valor', data_type: 'decimal' },
          { column_name: 'Cliente', data_type: 'varchar' },
          { column_name: 'Status', data_type: 'varchar' },
          { column_name: 'TipoDocumento', data_type: 'varchar' }
        ]
      };
      
      resultData = mockColumns[table_name] || [
        { column_name: 'ID', data_type: 'int' },
        { column_name: 'Nome', data_type: 'varchar' },
        { column_name: 'Valor', data_type: 'decimal' }
      ];
    } else {
      throw new Error('Ação inválida ou parâmetros ausentes.');
    }

    return new Response(JSON.stringify({ success: true, data: resultData }), {
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
