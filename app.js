// Simple Stylegod-like shop with WhatsApp checkout (₦ only)

const CONFIG = {
  currencySymbol: "₦",
  storeName: "Stylegod",
  paymentNote: "Payment in Naira (₦) only",
  whatsAppNumber: "2348132986908", // no +, no spaces
  quickChatText: "Hi Stylegod! 👋 I want to ask about your products / availability.",
};

const STORAGE_KEY = "stylegod_simple_cart_v1";

/**
 * Use built-in placeholder images so you ALWAYS see images,
 * even without uploading files. Replace img with your own later.
 */
function placeholderDataUrl(label) {
  const safe = String(label).slice(0, 18);
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

const PRODUCTS = [
  // WEARS
  { id:"w1", category:"wears", name:"Luxury Halter Neck Jumpsuit", price:75000, desc:"Elegant silhouette for occasions.", img:"assets/images/wears1.jpg" },
  { id:"w2", category:"wears", name:"2-in-1 Bodysuit & Skirt Set", price:125000, desc:"Soft luxury set, perfect fit.", img:"assets/images/product-2.jpg"},
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
  { id:"s4", category:"skincare", name:"SPF 50 Sunscreen", price:55000, desc:"Daily protection.", img:"assets/images/skin4.jpg"},

  // MAKEUP
  { id:"m1", category:"makeup", name:"Soft Glam Lip Gloss", price:6500, desc:"High shine, comfy wear.", img:"assets/images/makeup1.jpg" },
  { id:"m2", category:"makeup", name:"Everyday Brow Gel", price:7000, desc:"Clean defined brows.", img:"assets/images/makeup2.jpg" },
  { id:"m3", category:"makeup", name:"Glow Setting Spray", price:10500, desc:"Locks makeup with glow.", img:"assets/images/makeup3.jpg" },
  { id:"m4", category:"makeup", name:"Glow Setting Spray", price:20500, desc:"Locks makeup with glow.", img:"assets/images/makeup4.jpg" },
];

// --- State ---
let cart = loadCart();        // { [id]: qty }
let filter = "all";

// --- DOM ---
const yearEl = document.getElementById("year");
const productGrid = document.getElementById("productGrid");
const miniGrid = document.getElementById("miniGrid");

const cartCountEl = document.getElementById("cartCount");
const cartListEl  = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");

const openCartBtn  = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const drawer   = document.getElementById("cartDrawer");
const backdrop = document.getElementById("backdrop");

const checkoutBtn = document.getElementById("checkoutBtn");
const clearBtn    = document.getElementById("clearBtn");
const quickChatBtn = document.getElementById("quickChatBtn");

const contactForm = document.getElementById("contactForm");

const cartDelivery = document.getElementById("cartDelivery");
const cartLocation = document.getElementById("cartLocation");
const cartName     = document.getElementById("cartName");
const cartPhone    = document.getElementById("cartPhone");

const toastEl = document.getElementById("toast");

// --- Init ---
yearEl.textContent = new Date().getFullYear();
renderMini();
renderProducts();
renderCart();

// Filters
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    filter = btn.dataset.filter;
    renderProducts();
  });
});

// Category cards -> filter + scroll to shop
document.querySelectorAll(".catCard").forEach(btn => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    const filterBtn = document.querySelector(`.filter[data-filter="${f}"]`);
    if (filterBtn) filterBtn.click();
    document.getElementById("shop").scrollIntoView({ behavior:"smooth", block:"start" });
  });
});

// Drawer open/close
// Drawer open/close (robust + toggle)
openCartBtn.addEventListener("click", () => {
  if (!drawer.hidden) closeDrawer();
  else openDrawer();
});

closeCartBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !drawer.hidden) closeDrawer();
});

function openDrawer(){
  drawer.hidden = false;
  backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDrawer(){
  drawer.hidden = true;
  backdrop.hidden = true;
  document.body.style.overflow = "";
}

// Quick chat
quickChatBtn.addEventListener("click", () => openWhatsApp(CONFIG.quickChatText));

// Contact form -> WhatsApp
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(contactForm);
  const name = clean(fd.get("name"));
  const phone = clean(fd.get("phone"));
  const delivery = clean(fd.get("delivery"));
  const location = clean(fd.get("location"));
  const message = clean(fd.get("message"));

  const text =
`Hi ${CONFIG.storeName}! 👋

${CONFIG.paymentNote}.

Contact request:
Name: ${name}
Phone: ${phone}
Delivery option: ${delivery}
Location/Address: ${location}

Message:
${message}`;

  openWhatsApp(text);
});

// Cart actions
clearBtn.addEventListener("click", () => {
  cart = {};
  saveCart(cart);
  renderProducts();
  renderCart();
  toast("Cart cleared ✔️");
});

checkoutBtn.addEventListener("click", () => {
  const items = getCartItems();
  if (items.length === 0) return toast("Cart is empty ❗");

  const details = {
    delivery: clean(cartDelivery.value),
    location: clean(cartLocation.value),
    name: clean(cartName.value),
    phone: clean(cartPhone.value),
  };

  const msg = buildOrderMessage(items, details);
  openWhatsApp(msg);
});

// --- Render ---
function renderMini(){
  const picks = PRODUCTS.slice(0, 3);
  miniGrid.innerHTML = picks.map(p => `
    <div class="miniItem">
      <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" />
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <small>${formatMoney(p.price)} • ${labelCategory(p.category)}</small>
      </div>
    </div>
  `).join("");
}

function renderProducts(){
  const list = PRODUCTS.filter(p => filter === "all" ? true : p.category === filter);

  productGrid.innerHTML = list.map(p => {
    const qty = cart[p.id] || 0;
    return `
      <article class="card">
        <div class="card__img">
          <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" />
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

  productGrid.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
    addToCart(b.dataset.add, 1);
    toast("Added to cart ✔️");
  }));
  productGrid.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.inc, 1)));
  productGrid.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.dec, -1)));
}

function renderCart(){
  const items = getCartItems();
  cartCountEl.textContent = String(items.reduce((s, it) => s + it.qty, 0));
  cartTotalEl.textContent = formatMoney(items.reduce((s, it) => s + it.qty * it.price, 0));

  if (items.length === 0) {
    cartListEl.innerHTML = `<div class="cartItem"><strong>Your cart is empty</strong><br><small>Add items from the shop.</small></div>`;
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
  }));
}

// --- Cart helpers ---
function addToCart(id, delta){
  const current = cart[id] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) delete cart[id];
  else cart[id] = next;
  saveCart(cart);
  renderProducts();
  renderCart();
}

function getCartItems(){
  return Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? ({ ...p, qty }) : null;
  }).filter(Boolean);
}

// --- Drawer ---
function openDrawer(){
  drawer.hidden = false;
  backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}
// function closeDrawer(){
//   drawer.hidden = true;
//   backdrop.hidden = true;
//   document.body.style.overflow = "";
// }

// --- WhatsApp ---
function buildOrderMessage(items, details){
  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  const lines = items.map((it, i) =>
    `${i+1}) ${it.name} — ${it.qty} × ${formatMoney(it.price)} = ${formatMoney(it.qty * it.price)}`
  ).join("\n");

  return `Hi ${CONFIG.storeName}! 👋
I want to place an order.

${CONFIG.paymentNote}.

Items:
${lines}

Total: ${formatMoney(total)}

Delivery option: ${details.delivery || "—"}
Location/Address: ${details.location || "—"}
Name: ${details.name || "—"}
Phone: ${details.phone || "—"}

Please confirm availability + delivery fee.`;
}

function openWhatsApp(message){
  const num = String(CONFIG.whatsAppNumber || "").trim();
  if (!num) return toast("Set your WhatsApp number ❗");
  const url = `https://wa.me/${encodeURIComponent(num)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// --- Storage ---
function loadCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}
function saveCart(next){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

// --- Utils ---
function formatMoney(n){
  return `${CONFIG.currencySymbol}${Number(n || 0).toLocaleString("en-NG")}`;
}
function labelCategory(cat){
  return ({ wears:"Wears", hair:"Hair", skincare:"Skincare", makeup:"Makeup" }[cat] || cat);
}
function clean(v){ return String(v ?? "").trim(); }
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeXml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&apos;");
}

// Toast
let toastTimer;
function toast(text){
  toastEl.textContent = text;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1600);
}
