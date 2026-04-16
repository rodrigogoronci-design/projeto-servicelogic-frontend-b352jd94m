import pb from '@/lib/pocketbase/client'

export interface CredentialsRecord {
  id?: string
  host: string
  port: string
  database: string
  username: string
  password?: string
  created?: string
  updated?: string
}

export const getCredentials = async (): Promise<CredentialsRecord | null> => {
  const records = await pb.collection('credentials').getFullList<CredentialsRecord>()
  return records.length > 0 ? records[0] : null
}

export const saveCredentials = async (
  data: Partial<CredentialsRecord>,
): Promise<CredentialsRecord> => {
  const records = await pb.collection('credentials').getFullList<CredentialsRecord>()
  if (records.length > 0) {
    return pb.collection('credentials').update<CredentialsRecord>(records[0].id!, data)
  }
  return pb.collection('credentials').create<CredentialsRecord>(data)
}

export const testConnection = async (
  data: Partial<CredentialsRecord>,
): Promise<{ success: boolean; message: string }> => {
  return pb.send('/backend/v1/test-connection', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
