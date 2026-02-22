/* 🔨🤖🔧 Sophia de Stylegod Storefront
   - Cart with WhatsApp checkout
   - Payment in Naira only notice included
   - Delivery dropdown (Lagos / Outside Lagos) included in:
       1) Contact form message
       2) Cart checkout message
*/

const CONFIG = {
  currencySymbol: "₦",
  whatsAppNumber: "2348132986908",
  storeName: "Sophia de Stylegod",
  paymentNote: "Payment in Naira only",
  quickChatDefault: "Hi Sophia de Stylegod! 👋 I want to ask about your items / availability.",
};

// Demo products (replace with your real items later)
const PRODUCTS = [
  { id: "w1", category: "wears", name: "Soft Luxury Two-Piece Set", price: 28000, desc: "Corporate-ready set with clean fit." },
  { id: "w2", category: "wears", name: "Halter Neck Jumpsuit", price: 25000, desc: "Elegant, feminine silhouette." },
  { id: "w3", category: "wears", name: "Layered Short Dress", price: 26000, desc: "Occasion dress with soft layers." },

  { id: "h1", category: "hair", name: "Body Wave Wig (10–12\")", price: 45000, desc: "Soft body wave with natural finish." },
  { id: "h2", category: "hair", name: "Hair Growth Oil (30ml)", price: 8500, desc: "Nourishing oil for scalp + edges." },
  { id: "h3", category: "hair", name: "Silk Bonnet", price: 5500, desc: "Protects hair and reduces friction." },

  { id: "s1", category: "skincare", name: "Hydrating Cleanser", price: 12000, desc: "Gentle cleanser for daily glow." },
  { id: "s2", category: "skincare", name: "Vitamin C Serum", price: 18500, desc: "Brightens and supports even tone." },
  { id: "s3", category: "skincare", name: "SPF 50 Sunscreen", price: 15000, desc: "Daily protection, no heavy cast." },

  { id: "m1", category: "makeup", name: "Soft Glam Lip Gloss", price: 6500, desc: "High shine, comfy wear." },
  { id: "m2", category: "makeup", name: "Everyday Brow Gel", price: 7000, desc: "Clean, defined brows." },
  { id: "m3", category: "makeup", name: "Glow Setting Spray", price: 10500, desc: "Locks makeup with a soft glow." },
];

const BLOG_POSTS = [
  {
    id: "p1",
    category: "Fashion",
    date: "2026-01-10",
    title: "How to look outstanding in pastel",
    excerpt: "Pastels can look expensive when you balance tones, textures, and accessories...",
    content:
      "Pastels look best when you keep the base neutral and add one statement piece. Try soft-lilac with cream and finish with gold accessories. Keep makeup soft glam: peach blush, glossy lips, clean brows.",
  },
  {
    id: "p2",
    category: "Hair",
    date: "2026-01-22",
    title: "Hair glow routine for soft luxury",
    excerpt: "The secret is consistency: cleanse, hydrate, seal, protect...",
    content:
      "Start with a gentle cleanse, then moisturize and seal. Use a bonnet at night and keep heat minimal. A weekly scalp oil massage can help growth and shine.",
  },
  {
    id: "p3",
    category: "Skincare",
    date: "2026-02-02",
    title: "Simple skincare that gives ‘rich glow’",
    excerpt: "Hydration + SPF + one active ingredient is often enough...",
    content:
      "Keep it simple: cleanser, moisturizer, sunscreen daily. Add Vitamin C in the morning for brightness or a gentle exfoliant 1–2x weekly. Consistency beats complicated routines.",
  },
];

// State
const STORAGE_KEY = "sophia_stylegod_cart_v2";
let cart = loadCart();
let currentFilter = "all";

// DOM
const yearEl = document.getElementById("year");
const productGrid = document.getElementById("productGrid");
const cartCountEl = document.getElementById("cartCount");
const cartListEl = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");

const drawer = document.getElementById("cartDrawer");
const backdrop = document.getElementById("drawerBackdrop");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");

const whatsAppCheckoutBtn = document.getElementById("whatsAppCheckoutBtn");
const quickWhatsAppBtn = document.getElementById("quickWhatsAppBtn");
const footerWhatsAppBtn = document.getElementById("footerWhatsAppBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

const blogGrid = document.getElementById("blogGrid");
const postModal = document.getElementById("postModal");
const postModalBody = document.getElementById("postModalBody");
const addDemoPostBtn = document.getElementById("addDemoPostBtn");

const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

const contactForm = document.getElementById("contactForm");
const shareStoreBtn = document.getElementById("shareStoreBtn");
const newsletterBtn = document.getElementById("newsletterBtn");

// Cart checkout detail fields
const cartDeliveryEl = document.getElementById("cartDelivery");
const cartLocationEl = document.getElementById("cartLocation");
const cartNameEl = document.getElementById("cartName");
const cartPhoneEl = document.getElementById("cartPhone");

// Init
yearEl.textContent = String(new Date().getFullYear());
renderProducts();
renderBlog();
updateCartUI();

// Filter buttons
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});

// Category cards + footer category links
document.querySelectorAll("[data-filter]").forEach(el => {
  el.addEventListener("click", () => {
    const f = el.dataset.filter;
    if (!f) return;
    const valid = ["wears", "hair", "skincare", "makeup"];
    if (valid.includes(f)) {
      const btn = document.querySelector(`.filter[data-filter="${f}"]`);
      if (btn) btn.click();
    }
  });
});

// Drawer open/close
openCartBtn.addEventListener("click", openDrawer);
closeCartBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!drawer.hidden) closeDrawer();
    if (postModal?.open) postModal.close();
    if (!mobileNav.hidden) toggleMobileNav(false);
  }
});

// WhatsApp actions
whatsAppCheckoutBtn.addEventListener("click", () => {
  if (getCartItems().length === 0) {
    toast("Your cart is empty ❗ Add items first.");
    return;
  }
  const message = buildOrderMessage({
    delivery: valueOrEmpty(cartDeliveryEl?.value),
    location: valueOrEmpty(cartLocationEl?.value),
    name: valueOrEmpty(cartNameEl?.value),
    phone: valueOrEmpty(cartPhoneEl?.value),
  });
  openWhatsApp(message);
});

quickWhatsAppBtn.addEventListener("click", () => openWhatsApp(CONFIG.quickChatDefault));
footerWhatsAppBtn.addEventListener("click", () => openWhatsApp(CONFIG.quickChatDefault));

// Clear cart
clearCartBtn.addEventListener("click", () => {
  cart = {};
  saveCart(cart);
  updateCartUI();
  renderProducts();
  toast("Cart cleared ✔️");
});

// Blog modal
blogGrid.addEventListener("click", (e) => {
  const card = e.target.closest("[data-post-id]");
  if (!card) return;
  const id = card.dataset.postId;
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;
  openPostModal(post);
});

// Add demo post
addDemoPostBtn.addEventListener("click", () => {
  const id = "p" + Math.floor(Math.random() * 99999);
  BLOG_POSTS.unshift({
    id,
    category: "Makeup",
    date: new Date().toISOString().slice(0,10),
    title: "Soft glam routine (demo post)",
    excerpt: "A quick soft glam routine that looks classy and feminine...",
    content:
      "Prep your skin, keep brows clean, use a light base, add blush, and finish with gloss. Less is more — that’s the soft luxury vibe.",
  });
  renderBlog();
  toast("Demo post added ✔️");
});

// Mobile nav toggle
menuBtn.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  toggleMobileNav(!expanded);
});
mobileNav.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) toggleMobileNav(false);
});

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

// Share store
shareStoreBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const text = `${CONFIG.storeName} — Wears, Hair, Skincare, Makeup. (${CONFIG.paymentNote}) ${url}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: CONFIG.storeName, text, url });
    } else {
      await navigator.clipboard.writeText(text);
      toast("Store link copied ✔️");
    }
  } catch {
    // ignore
  }
});

// Newsletter demo
newsletterBtn.addEventListener("click", async () => {
  const email = document.getElementById("newsletterEmail").value.trim();
  if (!email || !email.includes("@")) return toast("Enter a valid email ❗");
  try {
    await navigator.clipboard.writeText(email);
    toast("Saved locally (demo). Connect Mailchimp later ✔️");
  } catch {
    toast("Thanks ✔️");
  }
});

// --- Rendering ---
function renderProducts(){
  const items = PRODUCTS.filter(p => currentFilter === "all" ? true : p.category === currentFilter);

  productGrid.innerHTML = items.map(p => {
    const qty = cart[p.id] || 0;
    return `
      <article class="card" data-product-id="${p.id}">
        <div class="card__img" aria-hidden="true"></div>
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(p.name)}</h3>
          <div class="card__meta">
            <span class="price">${formatMoney(p.price)}</span>
            <span class="badge">${escapeHtml(labelCategory(p.category))}</span>
          </div>
          <p class="card__desc">${escapeHtml(p.desc)}</p>

          <div class="card__actions">
            <button class="btn btn--soft btn--small" type="button" data-add="${p.id}">Add to cart</button>

            <div class="qty" aria-label="Quantity controls">
              <button type="button" aria-label="Decrease quantity" data-dec="${p.id}">−</button>
              <span aria-live="polite">${qty}</span>
              <button type="button" aria-label="Increase quantity" data-inc="${p.id}">+</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  productGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.add, 1);
      toast("Added to cart ✔️");
    });
  });
  productGrid.querySelectorAll("[data-inc]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.inc, 1));
  });
  productGrid.querySelectorAll("[data-dec]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.dec, -1));
  });
}

function renderBlog(){
  blogGrid.innerHTML = BLOG_POSTS.map(p => `
    <article class="post" role="button" tabindex="0" data-post-id="${p.id}" aria-label="Open blog post: ${escapeHtml(p.title)}">
      <div class="post__img" aria-hidden="true"></div>
      <div class="post__body">
        <div class="post__meta">${escapeHtml(p.category)} • ${formatDate(p.date)}</div>
        <h3 class="post__title">${escapeHtml(p.title)}</h3>
        <p class="post__excerpt">${escapeHtml(p.excerpt)}</p>
      </div>
    </article>
  `).join("");

  blogGrid.querySelectorAll(".post").forEach(card => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function openPostModal(post){
  postModalBody.innerHTML = `
    <div class="meta">${escapeHtml(post.category)} • ${formatDate(post.date)}</div>
    <h2>${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.content)}</p>
  `;
  postModal.showModal();
}

// --- Cart logic ---
function addToCart(productId, delta){
  const exists = PRODUCTS.some(p => p.id === productId);
  if (!exists) return;

  const current = cart[productId] || 0;
  const next = Math.max(0, current + delta);

  if (next === 0) delete cart[productId];
  else cart[productId] = next;

  saveCart(cart);
  updateCartUI();
  renderProducts();
}

function updateCartUI(){
  const items = getCartItems();
  const count = items.reduce((sum, it) => sum + it.qty, 0);
  cartCountEl.textContent = String(count);

  if (items.length === 0) {
    cartListEl.innerHTML = `
      <div class="cartItem">
        <p style="margin:0;color:rgba(255,255,255,.72);line-height:1.5">
          Your cart is empty. Add items from the shop. 💡
        </p>
      </div>
    `;
  } else {
    cartListEl.innerHTML = items.map(it => `
      <div class="cartItem" data-cart-id="${it.id}">
        <div class="cartItem__row">
          <div>
            <p class="cartItem__title">${escapeHtml(it.name)}</p>
            <p class="cartItem__sub">${escapeHtml(labelCategory(it.category))} • ${formatMoney(it.price)} each</p>
          </div>
          <div class="cartItem__right">
            <strong>${formatMoney(it.price * it.qty)}</strong>
          </div>
        </div>

        <div class="cartItem__controls">
          <div class="qty" aria-label="Quantity controls">
            <button type="button" aria-label="Decrease quantity" data-dec="${it.id}">−</button>
            <span aria-live="polite">${it.qty}</span>
            <button type="button" aria-label="Increase quantity" data-inc="${it.id}">+</button>
          </div>
          <button class="trash" type="button" data-remove="${it.id}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  cartListEl.querySelectorAll("[data-inc]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.inc, 1)));
  cartListEl.querySelectorAll("[data-dec]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.dec, -1)));
  cartListEl.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
    delete cart[btn.dataset.remove];
    saveCart(cart);
    updateCartUI();
    renderProducts();
  }));

  cartTotalEl.textContent = formatMoney(getCartTotal());
}

function getCartItems(){
  return Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? ({ ...p, qty }) : null;
  }).filter(Boolean);
}

function getCartTotal(){
  return getCartItems().reduce((sum, it) => sum + it.price * it.qty, 0);
}

// --- WhatsApp checkout ---
function buildOrderMessage(details){
  const items = getCartItems();
  const total = getCartTotal();

  const lines = items.map((it, idx) =>
    `${idx + 1}) ${it.name} — ${it.qty} × ${formatMoney(it.price)} = ${formatMoney(it.price * it.qty)}`
  ).join("\n");

  const delivery = details?.delivery || "";
  const location = details?.location || "";
  const name = details?.name || "";
  const phone = details?.phone || "";

  const message =
`Hi ${CONFIG.storeName}! 👋
I want to place an order.

${CONFIG.paymentNote}.

Items:
${lines}

Total: ${formatMoney(total)}

Delivery option: ${delivery || "—"}
Location/Address: ${location || "—"}
Name: ${name || "—"}
Phone: ${phone || "—"}

Please confirm availability + delivery fee.`;

  return message;
}

function openWhatsApp(message){
  const num = String(CONFIG.whatsAppNumber || "").trim();
  if (!num || num.length < 8) {
    toast("WhatsApp number not set ❗");
    return;
  }
  const url = `https://wa.me/${encodeURIComponent(num)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// --- Drawer helpers ---
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

// --- Mobile nav ---
function toggleMobileNav(show){
  menuBtn.setAttribute("aria-expanded", show ? "true" : "false");
  mobileNav.hidden = !show;
}

// --- Storage ---
function loadCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  }catch{
    return {};
  }
}
function saveCart(next){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

// --- Utils ---
function formatMoney(amount){
  const n = Number(amount || 0);
  return `${CONFIG.currencySymbol}${n.toLocaleString("en-NG")}`;
}
function formatDate(iso){
  try{
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  }catch{
    return iso;
  }
}
function labelCategory(cat){
  const map = { wears:"Wears", hair:"Hair", skincare:"Skincare", makeup:"Makeup" };
  return map[cat] || cat;
}
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function clean(v){ return String(v ?? "").trim(); }
function valueOrEmpty(v){ return String(v ?? "").trim(); }

// Tiny toast
let toastTimer;
function toast(text){
  clearTimeout(toastTimer);
  let el = document.getElementById("toast");
  if (!el){
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.bottom = "92px"; // above floating social
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(0,0,0,.65)";
    el.style.border = "1px solid rgba(255,255,255,.16)";
    el.style.color = "rgba(255,255,255,.92)";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "999px";
    el.style.backdropFilter = "blur(10px)";
    el.style.boxShadow = "0 18px 40px rgba(0,0,0,.45)";
    el.style.zIndex = "999";
    el.style.fontWeight = "700";
    el.style.fontSize = "14px";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.opacity = "1";
  toastTimer = setTimeout(() => { el.style.opacity = "0"; }, 1800);
}