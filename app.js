// Stylegod Shop — Clean app.js (Cart toggles + WhatsApp checkout in ₦)
// Drop-in replacement: replace your entire app.js with this file.

(() => {
  "use strict";

  // ---------- CONFIG ----------
  const CONFIG = {
    currencySymbol: "₦",
    storeName: "Stylegod",
    paymentNote: "Payment in Naira (₦) only",
    whatsAppNumber: "2348132986908", // no +, no spaces
    quickChatText: "Hi Stylegod! 👋 I want to ask about your products / availability.",
  };

  const STORAGE_KEY = "stylegod_simple_cart_v1";

  // ---------- PLACEHOLDER IMAGE (fallback) ----------
  function placeholderDataUrl(label) {
    const safe = String(label || "").slice(0, 18);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#ff4fd8" stop-opacity="0.75"/>
          <stop offset="0.5" stop-color="#7c4dff" stop-opacity="0.65"/>
          <stop offset="1" stop-color="#2fe6ff" stop-opacity="0.55"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="180" cy="170" r="140" fill="#c6ff4f" fill-opacity="0.25"/>
      <circle cx="700" cy="210" r="190" fill="#ffffff" fill-opacity="0.10"/>
      <circle cx="560" cy="520" r="220" fill="#000000" fill-opacity="0.12"/>
      <text x="50%" y="52%" text-anchor="middle" font-family="Inter, Arial" font-size="56" fill="rgba(255,255,255,0.95)" font-weight="800">
        ${escapeXml(safe)}
      </text>
      <text x="50%" y="62%" text-anchor="middle" font-family="Inter, Arial" font-size="26" fill="rgba(255,255,255,0.80)" font-weight="700">
        Stylegod • ₦
      </text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // ---------- PRODUCTS ----------
  const PRODUCTS = [
    // WEARS
    { id:"w1", category:"wears", name:"Luxury Halter Neck Jumpsuit", price:75000, desc:"Elegant silhouette for occasions.", img:"assets/images/wears1.jpg" },
    { id:"w2", category:"wears", name:"2-in-1 Bodysuit & Skirt Set", price:125000, desc:"Soft luxury set, perfect fit.", img:"assets/images/product-2.jpg" },
    { id:"w3", category:"wears", name:"Stylish Short Dress", price:86000, desc:"Classy and feminine.", img:"assets/images/product-3.jpg" },
    { id:"w4", category:"wears", name:"Stylish Short Dress", price:50000, desc:"Classy and feminine.", img:"assets/images/product-4.jpg" },
    { id:"w5", category:"wears", name:"Luxury Halter Neck Jumpsuit", price:75000, desc:"Elegant silhouette for occasions.", img:"assets/images/product-6.jpeg" },
    { id:"w6", category:"wears", name:"2-in-1 Bodysuit & Skirt Set", price:125000, desc:"Soft luxury set, perfect fit.", img: placeholderDataUrl("Wears") },
    { id:"w7", category:"wears", name:"Stylish Short Dress", price:86000, desc:"Classy and feminine.", img: placeholderDataUrl("Wears") },
    { id:"w8", category:"wears", name:"Stylish Short Dress", price:50000, desc:"Classy and feminine.", img: placeholderDataUrl("Wears") },

    // HAIR
    { id:"h1", category:"hair", name:"Body Wave Wig (10–12\")", price:45000, desc:"Natural finish, soft waves.", img:"assets/images/hair-1.jpg" },
    { id:"h2", category:"hair", name:"Hair Growth Oil (30ml)", price:85000, desc:"Nourish scalp + edges.", img:"assets/images/hair-2.jpg" },
    { id:"h3", category:"hair", name:"Silk Bonnet", price:18000, desc:"Protects hair overnight.", img:"assets/images/hair-3.jpg" },
    { id:"h4", category:"hair", name:"Silk Bonnet", price:25000, desc:"Protects hair overnight.", img:"assets/images/hair-4.jpg" },

    // SKINCARE
    { id:"s1", category:"skincare", name:"Hydrating Cleanser", price:12000, desc:"Gentle daily cleanse.", img:"assets/images/skin1.jpg" },
    { id:"s2", category:"skincare", name:"Vitamin C Serum", price:18500, desc:"Brightens and evens tone.", img:"assets/images/skin2.jpg" },
    { id:"s3", category:"skincare", name:"SPF 50 Sunscreen", price:15000, desc:"Daily protection.", img:"assets/images/skin3.jpg" },
    { id:"s4", category:"skincare", name:"SPF 50 Sunscreen", price:55000, desc:"Daily protection.", img:"assets/images/skin4.jpg" },

    // MAKEUP
    { id:"m1", category:"makeup", name:"Soft Glam Lip Gloss", price:6500, desc:"High shine, comfy wear.", img:"assets/images/makeup1.jpg" },
    { id:"m2", category:"makeup", name:"Everyday Brow Gel", price:7000, desc:"Clean defined brows.", img:"assets/images/makeup2.jpg" },
    { id:"m3", category:"makeup", name:"Glow Setting Spray", price:10500, desc:"Locks makeup with glow.", img:"assets/images/makeup3.jpg" },
    { id:"m4", category:"makeup", name:"Glow Setting Spray", price:20500, desc:"Locks makeup with glow.", img:"assets/images/makeup4.jpg" },
  ];

  // ---------- UTIL ----------
  function $(id) { return document.getElementById(id); }

  function formatMoney(n) {
    return `${CONFIG.currencySymbol}${Number(n || 0).toLocaleString("en-NG")}`;
  }

  function labelCategory(cat) {
    return ({ wears:"Wears", hair:"Hair", skincare:"Skincare", makeup:"Makeup" }[cat] || cat);
  }

  function clean(v) { return String(v ?? "").trim(); }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function escapeXml(s) {
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&apos;");
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function openWhatsApp(message) {
    const num = String(CONFIG.whatsAppNumber || "").trim();
    if (!num) return;
    const url = `https://wa.me/${encodeURIComponent(num)}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function buildOrderMessage(items, details) {
    const total = items.reduce((s, it) => s + it.qty * it.price, 0);
    const lines = items.map((it, i) =>
      `${i+1}) ${it.name} — ${it.qty} × ${formatMoney(it.price)} = ${formatMoney(it.qty * it.qty ? it.price : it.price)}`
    );

    // Fix: previous line had a typo potential; build safely:
    const linesSafe = items.map((it, i) =>
      `${i+1}) ${it.name} — ${it.qty} × ${formatMoney(it.price)} = ${formatMoney(it.qty * it.price)}`
    ).join("\n");

    return `Hi ${CONFIG.storeName}! 👋
I want to place an order.

${CONFIG.paymentNote}.

Items:
${linesSafe}

Total: ${formatMoney(total)}

Delivery option: ${details.delivery || "—"}
Location/Address: ${details.location || "—"}
Name: ${details.name || "—"}
Phone: ${details.phone || "—"}

Please confirm availability + delivery fee.`;
  }

  // ---------- MAIN ----------
  document.addEventListener("DOMContentLoaded", () => {
    // Required shop/cart DOM (if missing, do nothing — prevents crashes on other pages)
    const yearEl = $("year");
    const productGrid = $("productGrid");
    const miniGrid = $("miniGrid");

    const cartCountEl = $("cartCount");
    const cartListEl = $("cartList");
    const cartTotalEl = $("cartTotal");

    const openCartBtn = $("openCartBtn");
    const closeCartBtn = $("closeCartBtn");
    const drawer = $("cartDrawer");
    const backdrop = $("backdrop");

    const checkoutBtn = $("checkoutBtn");
    const clearBtn = $("clearBtn");
    const quickChatBtn = $("quickChatBtn");
    const contactForm = $("contactForm");

    const cartDelivery = $("cartDelivery");
    const cartLocation = $("cartLocation");
    const cartName = $("cartName");
    const cartPhone = $("cartPhone");

    const toastEl = $("toast");

    const required = {
      productGrid, miniGrid,
      cartCountEl, cartListEl, cartTotalEl,
      openCartBtn, closeCartBtn, drawer, backdrop
    };

    const missing = Object.entries(required).filter(([,v]) => !v).map(([k]) => k);
    if (missing.length) {
      console.warn("Shop app not initialized. Missing elements:", missing);
      return;
    }

    // State
    let cart = loadCart(); // { [id]: qty }
    let filter = "all";

    // Year
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Toast
    let toastTimer;
    function toast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1600);
    }

    // Drawer (toggle)
    function openDrawer() {
      drawer.hidden = false;
      backdrop.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeDrawer() {
      drawer.hidden = true;
      backdrop.hidden = true;
      document.body.style.overflow = "";
    }
    function toggleDrawer() {
      if (drawer.hidden) openDrawer();
      else closeDrawer();
    }

    // IMPORTANT: use pointerdown so it works even if click is swallowed
    openCartBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); toggleDrawer(); });
    closeCartBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); closeDrawer(); });
    backdrop.addEventListener("pointerdown", (e) => { e.preventDefault(); closeDrawer(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });

    // Images: fallback to placeholder if 404
    function imgWithFallback(src, label) {
      const fallback = placeholderDataUrl(label);
      const safeSrc = src && String(src).trim() ? src : fallback;
      // onerror swaps to fallback once
      return `<img src="${escapeHtml(safeSrc)}" alt="" loading="lazy"
        onerror="this.onerror=null;this.src='${fallback}'" />`;
    }

    // Render mini (top card)
    function renderMini() {
      const picks = PRODUCTS.slice(0, 3);
      miniGrid.innerHTML = picks.map(p => `
        <div class="miniItem">
          ${imgWithFallback(p.img, labelCategory(p.category))}
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <small>${formatMoney(p.price)} • ${labelCategory(p.category)}</small>
          </div>
        </div>
      `).join("");
    }

    // Render products
    function renderProducts() {
      const list = PRODUCTS.filter(p => filter === "all" ? true : p.category === filter);

      productGrid.innerHTML = list.map(p => {
        const qty = cart[p.id] || 0;
        return `
          <article class="card">
            <div class="card__img">
              ${imgWithFallback(p.img, labelCategory(p.category))}
            </div>
            <div class="card__body">
              <h3 class="card__title">${escapeHtml(p.name)}</h3>
              <div class="card__meta">
                <span class="price">${formatMoney(p.price)}</span>
                <span class="badge">${labelCategory(p.category)}</span>
              </div>
              <p class="card__desc">${escapeHtml(p.desc)}</p>

              <div class="card__actions">
                <button class="btn btn--primary" type="button" data-add="${p.id}">Add</button>

                <div class="qty" aria-label="Quantity controls">
                  <button type="button" data-dec="${p.id}" aria-label="Decrease">−</button>
                  <span>${qty}</span>
                  <button type="button" data-inc="${p.id}" aria-label="Increase">+</button>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join("");

      // Buttons
      productGrid.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
        addToCart(b.dataset.add, 1);
        toast("Added to cart ✔️");
      }));
      productGrid.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.inc, 1)));
      productGrid.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.dec, -1)));
    }

    // Render cart
    function getCartItems() {
      return Object.entries(cart).map(([id, qty]) => {
        const p = PRODUCTS.find(x => x.id === id);
        return p ? ({ ...p, qty }) : null;
      }).filter(Boolean);
    }

    function renderCart() {
      const items = getCartItems();
      cartCountEl.textContent = String(items.reduce((s, it) => s + it.qty, 0));
      cartTotalEl.textContent = formatMoney(items.reduce((s, it) => s + it.qty * it.price, 0));

      if (!items.length) {
        cartListEl.innerHTML = `
          <div class="cartItem">
            <strong>Your cart is empty</strong><br>
            <small>Add items from the shop.</small>
          </div>
        `;
        return;
      }

      cartListEl.innerHTML = items.map(it => `
        <div class="cartItem">
          <div class="cartItem__row">
            <div>
              <strong>${escapeHtml(it.name)}</strong>
              <small>${formatMoney(it.price)} each • ${labelCategory(it.category)}</small>
            </div>
            <div><strong>${formatMoney(it.price * it.qty)}</strong></div>
          </div>

          <div class="cartItem__actions">
            <div class="qty">
              <button type="button" data-dec="${it.id}">−</button>
              <span>${it.qty}</span>
              <button type="button" data-inc="${it.id}">+</button>
            </div>
            <button class="removeBtn" type="button" data-remove="${it.id}">Remove</button>
          </div>
        </div>
      `).join("");

      cartListEl.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.inc, 1)));
      cartListEl.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.dec, -1)));
      cartListEl.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
        delete cart[b.dataset.remove];
        saveCart(cart);
        renderProducts();
        renderCart();
        toast("Removed ✔️");
      }));
    }

    function addToCart(id, delta) {
      const current = cart[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) delete cart[id];
      else cart[id] = next;

      saveCart(cart);
      renderProducts();
      renderCart();
    }

    // Filters (top pills)
    document.querySelectorAll(".filter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        filter = btn.dataset.filter || "all";
        renderProducts();
      });
    });

    // Category cards (if present)
    document.querySelectorAll(".catCard").forEach(btn => {
      btn.addEventListener("click", () => {
        const f = btn.dataset.filter;
        const filterBtn = document.querySelector(`.filter[data-filter="${f}"]`);
        if (filterBtn) filterBtn.click();
        const shop = $("shop");
        if (shop) shop.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Quick chat
    if (quickChatBtn) {
      quickChatBtn.addEventListener("click", () => openWhatsApp(CONFIG.quickChatText));
    }

    // Contact form -> WhatsApp
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const text =
`Hi ${CONFIG.storeName}! 👋

${CONFIG.paymentNote}.

Contact request:
Name: ${clean(fd.get("name"))}
Phone: ${clean(fd.get("phone"))}
Delivery option: ${clean(fd.get("delivery"))}
Location/Address: ${clean(fd.get("location"))}

Message:
${clean(fd.get("message"))}`;
        openWhatsApp(text);
      });
    }

    // Clear cart
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        cart = {};
        saveCart(cart);
        renderProducts();
        renderCart();
        toast("Cart cleared ✔️");
      });
    }

    // Checkout
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        const items = getCartItems();
        if (!items.length) return toast("Cart is empty ❗");

        const details = {
          delivery: clean(cartDelivery?.value),
          location: clean(cartLocation?.value),
          name: clean(cartName?.value),
          phone: clean(cartPhone?.value),
        };

        const msg = buildOrderMessage(items, details);
        openWhatsApp(msg);
      });
    }

    // Initial render
    renderMini();
    renderProducts();
    renderCart();
  });
})();
