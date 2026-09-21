async function saveOrder(env, order) {
  // Try KV binding first
  if (env.ORDERS) {
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await env.ORDERS.put(id, JSON.stringify({ ...order, id, createdAt: new Date().toISOString() }));
    return id;
  }

  // Fallback: use KV namespace ID via Cloudflare REST API
  const namespaceId = env.KV_NAMESPACE_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!namespaceId || !apiToken || apiToken === 'set-your-api-token-here') {
    console.warn('KV storage not configured. Order not persisted.');
    return null;
  }

  try {
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const value = JSON.stringify({ ...order, id, createdAt: new Date().toISOString() });
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID || 'me'}/storage/kv/namespaces/${namespaceId}/values/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'text/plain'
      },
      body: value
    });
    if (!res.ok) throw new Error(`KV API error: ${res.status}`);
    return id;
  } catch (err) {
    console.error('KV save error:', err);
    return null;
  }
}

function generateWhatsAppMessage(items, customer, total) {
  const itemsList = items.map((i, index) => `${index + 1}. ${i.name} — ${i.price.toFixed(2)} €`).join('%0A');

  return `Bonjour,%0A%0A` +
    `Je souhaite passer une commande sur Ma Boutique.%0A%0A` +
    `*Articles :*%0A${itemsList}%0A%0A` +
    `*Total :* ${total.toFixed(2)} €%0A%0A` +
    `*Mes informations :*%0A` +
    `Nom : ${customer.firstName} ${customer.lastName}%0A` +
    `Email : ${customer.email}%0A` +
    `Téléphone : ${customer.phone}%0A` +
    `Adresse : ${customer.address}, ${customer.zip} ${customer.city}%0A%0A` +
    `Merci de confirmer ma commande.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { items, customer } = body || {};

  if (!items || !items.length) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  if (!customer || !customer.email || !customer.firstName || !customer.lastName || !customer.phone) {
    return new Response(JSON.stringify({ error: 'Informations client incomplètes' }), { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  // Save order to KV
  let orderId = null;
  try {
    orderId = await saveOrder(env, { items, customer, total, status: 'pending', contactMethod: customer.contactMethod || 'whatsapp' });
  } catch (err) {
    console.error('Order save error:', err);
  }

  // Get WhatsApp number from env
  const whatsappNumber = env.WHATSAPP_NUMBER || '+22962794964';
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const message = generateWhatsAppMessage(items, customer, total);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(request.headers.get('user-agent') || '');
  const whatsappUrl = isMobile
    ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`
    : `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${message}`;

  return new Response(JSON.stringify({
    url: whatsappUrl,
    mode: 'whatsapp',
    orderId,
    total,
    message: 'Commande enregistrée. Redirection vers WhatsApp...'
  }));
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
