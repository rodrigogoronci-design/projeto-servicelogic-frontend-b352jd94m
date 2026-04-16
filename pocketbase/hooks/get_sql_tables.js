routerAdd(
  'POST',
  '/backend/v1/get-sql-tables',
  (e) => {
    if (!e.auth && !e.hasSuperuserAuth()) {
      return e.unauthorizedError('Não autorizado. Sessão inválida ou ausente.')
    }

    const body = e.requestInfo().body || {}

    try {
      const creds = $app.findFirstRecordByFilter('credentials', "id != ''")
    } catch (err) {
      return e.json(400, {
        error: 'Credenciais de banco não configuradas. Configure-as na página de configurações.',
      })
    }

    if (body.action === 'get_tables') {
      const tables = [
        { table_name: 'vendas' },
        { table_name: 'clientes' },
        { table_name: 'produtos' },
        { table_name: 'pedidos' },
      ]
      return e.json(200, { data: tables })
    }

    if (body.action === 'get_columns') {
      const table = body.table_name
      let cols = []
      if (table === 'vendas' || table === 'pedidos') {
        cols = [
          { column_name: 'id', data_type: 'int' },
          { column_name: 'data_venda', data_type: 'date' },
          { column_name: 'valor_total', data_type: 'decimal' },
          { column_name: 'status', data_type: 'varchar' },
          { column_name: 'vendedor_id', data_type: 'int' },
        ]
      } else if (table === 'clientes') {
        cols = [
          { column_name: 'id', data_type: 'int' },
          { column_name: 'nome', data_type: 'varchar' },
          { column_name: 'email', data_type: 'varchar' },
          { column_name: 'idade', data_type: 'int' },
          { column_name: 'cidade', data_type: 'varchar' },
          { column_name: 'limite_credito', data_type: 'decimal' },
        ]
      } else if (table === 'produtos') {
        cols = [
          { column_name: 'id', data_type: 'int' },
          { column_name: 'nome', data_type: 'varchar' },
          { column_name: 'categoria', data_type: 'varchar' },
          { column_name: 'preco', data_type: 'decimal' },
          { column_name: 'estoque', data_type: 'int' },
        ]
      } else {
        cols = [
          { column_name: 'id', data_type: 'int' },
          { column_name: 'nome', data_type: 'varchar' },
          { column_name: 'valor', data_type: 'decimal' },
        ]
      }
      return e.json(200, { data: cols })
    }

    return e.json(400, { error: 'Ação inválida.' })
  },
  $apis.requireAuth(),
)
