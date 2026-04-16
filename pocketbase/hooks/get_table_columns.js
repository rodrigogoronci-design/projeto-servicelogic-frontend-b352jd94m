routerAdd(
  'POST',
  '/backend/v1/get-table-columns',
  (e) => {
    const body = e.requestInfo().body || {}
    const tableName = body.table_name

    // Return a mock schema for DWBI_PBIv2_Conhecimento to ensure the UI has data to work with
    if (tableName === 'DWBI_PBIv2_Conhecimento') {
      return e.json(200, {
        data: [
          { column_name: 'ID_Conhecimento', data_type: 'int' },
          { column_name: 'Titulo', data_type: 'varchar' },
          { column_name: 'Categoria', data_type: 'varchar' },
          { column_name: 'Visualizacoes', data_type: 'int' },
          { column_name: 'Data_Criacao', data_type: 'datetime' },
          { column_name: 'Autor', data_type: 'varchar' },
          { column_name: 'Status', data_type: 'varchar' },
          { column_name: 'Nota_Media', data_type: 'decimal' },
        ],
      })
    }

    return e.json(200, { data: [] })
  },
  $apis.requireAuth(),
)
