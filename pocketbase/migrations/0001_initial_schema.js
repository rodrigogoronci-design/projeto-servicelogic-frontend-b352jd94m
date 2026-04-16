migrate(
  (app) => {
    const charts = new Collection({
      name: 'charts',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'table_name', type: 'text' },
        { name: 'type', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'fields_config', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(charts)

    const dashboards = new Collection({
      name: 'dashboards',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dashboards)

    const dashboardItems = new Collection({
      name: 'dashboard_items',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'dashboard_id',
          type: 'relation',
          required: true,
          collectionId: dashboards.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'chart_id',
          type: 'relation',
          required: true,
          collectionId: charts.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dashboardItems)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('dashboard_items'))
    app.delete(app.findCollectionByNameOrId('dashboards'))
    app.delete(app.findCollectionByNameOrId('charts'))
  },
)
