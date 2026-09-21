const products = [
  {
    id: 1,
    name: "Casque Bluetooth",
    price: 59,
    desc: "Casque sans fil avec réduction de bruit active.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    id: 2,
    name: "Montre Connectée",
    price: 129,
    desc: "Suivi activité, fréquence cardiaque et notifications.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    id: 3,
    name: "Sneakers Street",
    price: 89,
    desc: "Confort urbain au quotidien, design moderne.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
  },
  {
    id: 4,
    name: "Sac à dos Tech",
    price: 49,
    desc: "Compartiment laptop, résistant à l'eau, élégant.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  }
];

let cart = [];

const productsEl = document.getElementById('products');
const cartEl = document.getElementById('cart');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');

document.getElementById('cart-toggle').onclick = () => cartEl.classList.toggle('hidden');
document.getElementById('cart-close').onclick = () => cartEl.classList.add('hidden');

function renderProducts() {
  productsEl.innerHTML = products.map(p => `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p class="product-price">${p.price.toFixed(2)} €</p>
      <p class="product-desc">${p.desc}</p>
      <button class="btn-primary" onclick="addToCart(${p.id})">Ajouter au panier</button>
    </article>
  `).join('');
}

window.addToCart = (id) => {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
};

function updateCart() {
  cartCountEl.textContent = cart.length;
  cartTotalEl.textContent = cart.reduce((sum, p) => sum + p.price, 0).toFixed(2);
  cartItemsEl.innerHTML = cart.length ? cart.map((p, i) => `
    <div class="cart-item">
      <span>${p.name}</span>
      <strong>${p.price.toFixed(2)} €</strong>
      <button onclick="removeFromCart(${i})">🗑</button>
    </div>
  `).join('') : '<p>Votre panier est vide.</p>';
}

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCart();
};

const API_BASE = '/api';

document.getElementById('checkout').onclick = async () => {
  if (!cart.length) return alert('Votre panier est vide.');

  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erreur lors du paiement.");
    }
  } catch (err) {
    console.error(err);
    alert("Impossible de démarrer le paiement.");
  }
};

renderProducts();
