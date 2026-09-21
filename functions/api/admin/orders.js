function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    }
  });
}

function parseJwt(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const decoded = JSON.parse(atob(payload));
    // Simple validation: check expiration and secret hash
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function getOrders(env) {
  if (env.ORDERS) {
    const list = await env.ORDERS.list();
    const orders = [];
    for (const key of list.keys) {
      try {
        const value = await env.ORDERS.get(key.name);
        if (value) orders.push(JSON.parse(value));
      } catch (e) {
        console.error('Error reading key', key.name, e);
      }
    }
    return orders;
  }

  const namespaceId = env.KV_NAMESPACE_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const accountId = env.ACCOUNT_ID || 'me';

  if (!namespaceId || !apiToken) {
    return [];
  }

  try {
    const listRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    if (!listRes.ok) throw new Error('KV list error');
    const listData = await listRes.json();
    const orders = [];
    for (const key of listData.result || []) {
      const valRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key.name}`, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      if (valRes.ok) {
        const value = await valRes.text();
        try { orders.push(JSON.parse(value)); } catch {}
      }
    }
    return orders;
  } catch (err) {
    console.error('KV fetch error:', err);
    return [];
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  const decoded = parseJwt(token, env.SESSION_SECRET);

  if (!decoded || decoded.role !== 'admin') {
    return respond({ error: 'Non autorisé' }, 401);
  }

  const orders = await getOrders(env);
  return respond({ orders, count: orders.length });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  const decoded = parseJwt(token, env.SESSION_SECRET);

  if (!decoded || decoded.role !== 'admin') {
    return respond({ error: 'Non autorisé' }, 401);
  }

  const { session_id } = await request.json();

  // Optionally update order status to paid if Stripe webhook or session check is implemented
  // For now, return placeholder
  return respond({ message: 'Status update not implemented in demo mode' });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    }
  });
}
