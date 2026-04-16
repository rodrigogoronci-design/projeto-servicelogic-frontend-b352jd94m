migrate(
  (app) => {
    const collection = new Collection({
      name: 'credentials',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'host', type: 'text', required: true },
        { name: 'port', type: 'text', required: true },
        { name: 'database', type: 'text', required: true },
        { name: 'username', type: 'text', required: true },
        { name: 'password', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('credentials')
    app.delete(collection)
  },
)
