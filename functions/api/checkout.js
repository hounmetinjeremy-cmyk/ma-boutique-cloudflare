export async function onRequestPost(context) {
  const { request } = context;
  const body = await request.json();
  const { items } = body || {};

  if (!items || !items.length) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const description = items.map(i => i.name).join(', ');

  // Si Stripe n'est pas configuré, on retourne un lien de paiement simulé
  const stripeSecret = context.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return new Response(JSON.stringify({
      url: '/success.html',
      mode: 'demo',
      total,
      items: description
    }));
  }

  try {
    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        payment_method_types: 'card',
        mode: 'payment',
        success_url: `${new URL(request.url).origin}/success.html`,
        cancel_url: `${new URL(request.url).origin}/cancel.html`,
        line_items: JSON.stringify(items.map(i => ({
          price_data: {
            currency: 'eur',
            product_data: { name: i.name, description: i.desc },
            unit_amount: Math.round(i.price * 100)
          },
          quantity: 1
        })))
      }).toString()
    }).then(r => r.json());

    return new Response(JSON.stringify({ url: session.url }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
