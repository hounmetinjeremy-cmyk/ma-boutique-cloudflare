export async function onRequest(context) {
  return new Response(JSON.stringify({ ok: true, message: 'API Ma Boutique' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
