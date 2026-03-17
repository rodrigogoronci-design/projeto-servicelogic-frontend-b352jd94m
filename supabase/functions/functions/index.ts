import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(JSON.stringify({ status: 'ok', message: 'Function entrypoint resolved' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    status: 200,
  })
})
