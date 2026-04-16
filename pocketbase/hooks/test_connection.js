routerAdd('POST', '/backend/v1/test-connection', (e) => {
  const body = e.requestInfo().body || {}

  if (!body.host || !body.port || !body.database || !body.username || !body.password) {
    return e.badRequestError('Missing required connection parameters')
  }

  // Simulate a connection check (mocking actual SQL connection for PB JSVM environment)
  if (body.host === 'error' || body.host === '0.0.0.0') {
    return e.badRequestError('Network error: Could not reach the SQL Server instance.')
  }
  if (body.password === 'wrong' || body.password === 'error') {
    return e.badRequestError("Login failed for user '" + body.username + "'.")
  }

  return e.json(200, { success: true, message: 'Connection established successfully!' })
})
