migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('credentials')
    try {
      app.findFirstRecordByData('credentials', 'host', '66.232.104.82')
      return
    } catch (_) {}

    const record = new Record(col)
    record.set('host', '66.232.104.82')
    record.set('port', '4288')
    record.set('database', 'Cliente_BaseComercialSL')
    record.set('username', 'sa')
    record.set('password', 'SL@bd01$')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('credentials', 'host', '66.232.104.82')
      app.delete(record)
    } catch (_) {}
  },
)
