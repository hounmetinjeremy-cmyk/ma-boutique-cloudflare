async function saveOrder(env, order) {
  const kv = env.MA Boutique;
  if (!kv) return null;
  const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await kv.put(id, JSON.stringify({ ...order, id, createdAt: new Date().toISOString() }));
  return id;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { items, customer } = body || {};

  if (!items || !items.length) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
    return new Response(JSON.stringify({ error: 'Informations client incomplètes' }), { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const description = items.map(i => i.name).join(', ');

  // Save order in KV regardless of payment method (demo or Stripe)
  try {
    await saveOrder(env, { items, customer, total, status: 'pending' });
  } catch (err) {
    console.error('KV save error:', err);
  }

  const stripeSecret = env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return new Response(JSON.stringify({
      url: '/success.html',
      mode: 'demo',
      total,
      items: description,
      message: 'Paiement en mode démonstration. Ajoutez STRIPE_SECRET_KEY pour activer les vrais paiements.'
    }));
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        payment_method_types: 'card',
        mode: 'payment',
        success_url: `${new URL(request.url).origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${new URL(request.url).origin}/cancel.html`,
        customer_email: customer.email,
        metadata: JSON.stringify({ customer: JSON.stringify(customer) }),
        line_items: JSON.stringify(items.map(i => ({
          price_data: {
            currency: 'eur',
            product_data: { name: i.name, description: i.desc },
            unit_amount: Math.round(i.price * 100)
          },
          quantity: 1
        })))
      }).toString()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Stripe error');
    }

    const session = await response.json();
    return new Response(JSON.stringify({ url: session.url, mode: 'live' }));
  } catch (e) {
    console.error('Stripe error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
