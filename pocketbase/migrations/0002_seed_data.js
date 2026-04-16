migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'rodrigogoronci@gmail.com')
    } catch (_) {
      const user = new Record(users)
      user.setEmail('rodrigogoronci@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Admin')
      app.save(user)
    }

    const charts = app.findCollectionByNameOrId('charts')
    let chart1, chart2

    try {
      chart1 = app.findFirstRecordByData('charts', 'name', 'Sample Bar Chart')
    } catch (_) {
      chart1 = new Record(charts)
      chart1.set('name', 'Sample Bar Chart')
      chart1.set('table_name', 'sales')
      chart1.set('type', 'bar')
      chart1.set('fields_config', [
        {
          original_name: 'category',
          display_name: 'Category',
          is_filter: true,
          axis: 'horizontal',
          type: 'dimension',
          color: '#0066CC',
        },
        {
          original_name: 'amount',
          display_name: 'Amount',
          is_filter: false,
          axis: 'vertical',
          type: 'metric',
          aggregation: 'sum',
          color: '#FF8C00',
        },
      ])
      app.save(chart1)
    }

    try {
      chart2 = app.findFirstRecordByData('charts', 'name', 'Sample Line Chart')
    } catch (_) {
      chart2 = new Record(charts)
      chart2.set('name', 'Sample Line Chart')
      chart2.set('table_name', 'traffic')
      chart2.set('type', 'line')
      chart2.set('fields_config', [
        {
          original_name: 'date',
          display_name: 'Date',
          is_filter: true,
          axis: 'horizontal',
          type: 'dimension',
          color: '#0066CC',
        },
        {
          original_name: 'visits',
          display_name: 'Visits',
          is_filter: false,
          axis: 'vertical',
          type: 'metric',
          aggregation: 'sum',
          color: '#FF8C00',
        },
      ])
      app.save(chart2)
    }

    const dashboards = app.findCollectionByNameOrId('dashboards')
    let dashboard
    try {
      dashboard = app.findFirstRecordByData('dashboards', 'name', 'Sample Dashboard')
    } catch (_) {
      dashboard = new Record(dashboards)
      dashboard.set('name', 'Sample Dashboard')
      dashboard.set('description', 'A sample dashboard showcasing reorderable charts.')
      app.save(dashboard)
    }

    const dashboardItems = app.findCollectionByNameOrId('dashboard_items')
    try {
      app.findFirstRecordByData('dashboard_items', 'dashboard_id', dashboard.id)
    } catch (_) {
      const item1 = new Record(dashboardItems)
      item1.set('dashboard_id', dashboard.id)
      item1.set('chart_id', chart1.id)
      item1.set('sort_order', 1)
      app.save(item1)

      const item2 = new Record(dashboardItems)
      item2.set('dashboard_id', dashboard.id)
      item2.set('chart_id', chart2.id)
      item2.set('sort_order', 2)
      app.save(item2)
    }
  },
  (app) => {
    // Revert logic omitted for simplicity on seeds
  },
)
