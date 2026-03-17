import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({ message: 'Dummy function to fix directory entrypoint error' }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    },
  )
})
