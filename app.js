const products = [
  {
    id: 1,
    name: "Casque Bluetooth Premium",
    price: 59,
    desc: "Casque sans fil avec réduction de bruit active et autonomie 30h.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    id: 2,
    name: "Montre Connectée Pro",
    price: 129,
    desc: "Suivi activité, fréquence cardiaque, GPS et notifications.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    id: 3,
    name: "Sneakers Street Edition",
    price: 89,
    desc: "Confort urbain au quotidien, design moderne et semelle amortie.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
  },
  {
    id: 4,
    name: "Sac à dos Tech",
    price: 49,
    desc: "Compartiment laptop 15'', résistant à l'eau, design élégant.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    id: 5,
    name: "Enceinte Portable 360°",
    price: 79,
    desc: "Son immersif, waterproof IPX7, autonomie 20 heures.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80"
  },
  {
    id: 6,
    name: "Lunettes de Soleil UV400",
    price: 39,
    desc: "Protection UV complète, monture légère et tendance.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80"
  }
];

let cart = [];

const productsEl = document.getElementById('products');
const cartEl = document.getElementById('cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutTotalEl = document.getElementById('checkout-total');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const submitBtn = document.getElementById('submit-order');

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg transition-opacity z-50 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  } text-white`;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

function openCart() {
  cartEl.classList.remove('translate-x-full');
  cartOverlay.classList.remove('hidden');
  setTimeout(() => cartOverlay.classList.remove('opacity-0'), 10);
}

function closeCart() {
  cartEl.classList.add('translate-x-full');
  cartOverlay.classList.add('opacity-0');
  setTimeout(() => cartOverlay.classList.add('hidden'), 300);
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
}

function renderProducts() {
  productsEl.innerHTML = products.map(p => `
    <article class="product-card bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-hidden h-56">
        <img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover">
      </div>
      <div class="p-5">
        <h3 class="text-lg font-bold text-gray-900 mb-1">${p.name}</h3>
        <p class="text-indigo-600 font-bold text-xl mb-3">${formatPrice(p.price)}</p>
        <p class="text-gray-500 text-sm mb-4">${p.desc}</p>
        <button onclick="addToCart(${p.id})" class="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          <i class="fas fa-plus"></i> Ajouter au panier
        </button>
      </div>
    </article>
  `).join('');
}

window.addToCart = (id) => {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
  showToast(`${product.name} ajouté au panier`);
  openCart();
};

function updateCart() {
  cartCountEl.textContent = cart.length;
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  cartTotalEl.textContent = total.toFixed(2).replace('.', ',');
  checkoutTotalEl.textContent = total.toFixed(2).replace('.', ',');

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fas fa-shopping-basket text-5xl mb-3"></i>
        <p>Votre panier est vide</p>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = cart.map((p, i) => `
    <div class="cart-item-enter flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <img src="${p.image}" alt="${p.name}" class="w-16 h-16 object-cover rounded-lg">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 text-sm">${p.name}</h4>
        <p class="text-indigo-600 font-bold text-sm">${formatPrice(p.price)}</p>
      </div>
      <button onclick="removeFromCart(${i})" class="w-8 h-8 text-red-500 hover:bg-red-50 rounded-full transition-colors">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join('');
}

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCart();
};

// Event listeners
document.getElementById('cart-toggle').onclick = openCart;
document.getElementById('cart-close').onclick = closeCart;
cartOverlay.onclick = closeCart;

document.getElementById('checkout').onclick = () => {
  if (!cart.length) {
    showToast('Votre panier est vide', 'error');
    return;
  }
  closeCart();
  checkoutModal.classList.remove('hidden');
  checkoutModal.classList.add('flex');
};

document.getElementById('checkout-close').onclick = () => {
  checkoutModal.classList.add('hidden');
  checkoutModal.classList.remove('flex');
};

// Close modal on outside click
checkoutModal.onclick = (e) => {
  if (e.target === checkoutModal) {
    checkoutModal.classList.add('hidden');
    checkoutModal.classList.remove('flex');
  }
};

function setLoading(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Traitement...';
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fab fa-stripe text-2xl"></i> Payer avec Stripe';
  }
}

checkoutForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!cart.length) return;

  setLoading(true);

  const formData = new FormData(checkoutForm);
  const customer = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    zip: formData.get('zip')
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer })
    });
    const data = await res.json();

    if (data.url) {
      if (data.mode === 'demo') {
        showToast('Mode démo : commande enregistrée sans paiement');
        cart = [];
        updateCart();
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
        window.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } else {
      showToast(data.error || 'Erreur lors du paiement', 'error');
      setLoading(false);
    }
  } catch (err) {
    console.error(err);
    showToast('Impossible de démarrer le paiement', 'error');
    setLoading(false);
  }
};

renderProducts();
updateCart();
