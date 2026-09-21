function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createJwt(payload, secret) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));

  // Note: Web Crypto API HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const keyPromise = crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return keyPromise.then(async (key) => {
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${header}.${body}`)
    );
    const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${header}.${body}.${sigBase64}`;
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const password = env.ADMIN_PASSWORD || 'admin123';

  if (body.password !== password) {
    return new Response(JSON.stringify({ error: 'Mot de passe incorrect' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const secret = env.SESSION_SECRET || 'change-this-secret';
  const token = await createJwt(
    { role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 },
    secret
  );

  return new Response(JSON.stringify({ success: true, token }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
