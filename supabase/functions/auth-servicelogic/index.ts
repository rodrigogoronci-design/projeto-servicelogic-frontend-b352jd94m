import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    // Simulate authentication against legacy forms
    if (!username || !password) {
      throw new Error('Credentials required')
    }

    // Mock returning a session token/cookie
    return new Response(
      JSON.stringify({
        success: true,
        token: 'sl_legacy_token_882938472983',
        message: 'Authenticated successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
