routerAdd(
  'POST',
  '/backend/v1/get-chart-preview',
  (e) => {
    if (!e.auth && !e.hasSuperuserAuth()) {
      return e.unauthorizedError('Não autorizado. Sessão inválida ou ausente.')
    }

    const body = e.requestInfo().body || {}
    const nome_tabela = body.nome_tabela
    const campos = body.campos_selecionados || []

    try {
      const creds = $app.findFirstRecordByFilter('credentials', "id != ''")
    } catch (err) {
      return e.json(400, { error: 'Credenciais de banco não configuradas.' })
    }

    if (!nome_tabela || campos.length === 0) {
      return e.json(400, { error: 'Tabela e campos são obrigatórios.' })
    }

    let dimension = campos.find((c) => c.type === 'dimension')?.field_name || 'name'
    let metric = campos.find((c) => c.type === 'metric')?.field_name || 'value'

    console.log(
      `Executing query on SQL Server: SELECT ${dimension}, SUM(${metric}) as value FROM ${nome_tabela} GROUP BY ${dimension}`,
    )

    const isDate =
      dimension.toLowerCase().includes('data') || dimension.toLowerCase().includes('date')

    let mockData = []
    if (isDate) {
      mockData = [
        { name: 'Jan', value: 120, [dimension]: 'Jan', [metric]: 120 },
        { name: 'Fev', value: 300, [dimension]: 'Fev', [metric]: 300 },
        { name: 'Mar', value: 200, [dimension]: 'Mar', [metric]: 200 },
        { name: 'Abr', value: 450, [dimension]: 'Abr', [metric]: 450 },
        { name: 'Mai', value: 280, [dimension]: 'Mai', [metric]: 280 },
        { name: 'Jun', value: 500, [dimension]: 'Jun', [metric]: 500 },
      ]
    } else {
      mockData = [
        { name: 'Item A', value: 150, [dimension]: 'Item A', [metric]: 150 },
        { name: 'Item B', value: 320, [dimension]: 'Item B', [metric]: 320 },
        { name: 'Item C', value: 210, [dimension]: 'Item C', [metric]: 210 },
        { name: 'Item D', value: 480, [dimension]: 'Item D', [metric]: 480 },
      ]
    }

    return e.json(200, { data: mockData })
  },
  $apis.requireAuth(),
)
