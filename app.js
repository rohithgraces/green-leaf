const products = [
  { id: "goat-milk", name: "Goat Milk", desc: "Moisturizing daily herbal bath bar.", price: 129, image: "assets/soaps/goat-milk.svg" },
  { id: "kuppaimeni", name: "Kuppaimeni", desc: "Traditional herbal skin clarifying soap.", price: 129, image: "assets/soaps/kuppaimeni.svg" },
  { id: "nalangumavu", name: "Nalangumavu", desc: "Classic herbal blend for soft glow.", price: 125, image: "assets/soaps/nalangumavu.svg" },
  { id: "coconut-milk", name: "Coconut Milk", desc: "Creamy lather and gentle cleansing.", price: 130, image: "assets/soaps/coconut-milk.svg" },
  { id: "wine", name: "Wine", desc: "Antioxidant-rich refresh soap.", price: 145, image: "assets/soaps/wine.svg" },
  { id: "rice-potato", name: "Rice + Potato", desc: "Brightening and tan care support.", price: 120, image: "assets/soaps/rice-potato.svg" },
  { id: "ulundhu-potato", name: "Ulundhu + Potato", desc: "Mild exfoliating herbal care.", price: 120, image: "assets/soaps/ulundhu-potato.svg" },
  { id: "murungai", name: "Murungai", desc: "Leaf-rich purifying skin cleanse.", price: 130, image: "assets/soaps/murungai.svg" },
  { id: "sangupoo", name: "Sangupoo", desc: "Soothing soap for sensitive skin.", price: 135, image: "assets/soaps/sangupoo.svg" },
  { id: "beetroot", name: "Beetroot", desc: "Glow and tone enhancing blend.", price: 130, image: "assets/soaps/beetroot.svg" },
  { id: "carrot", name: "Carrot", desc: "Vitamin-rich brightening support.", price: 130, image: "assets/soaps/carrot.svg" },
  { id: "charcoal", name: "Charcoal", desc: "Deep cleanse and oil control.", price: 149, image: "assets/soaps/charcoal.svg" },
  { id: "manjistha", name: "Manjistha", desc: "Ayurvedic skin tone care blend.", price: 139, image: "assets/soaps/manjistha.svg" }
];

const stateKey = "greenleaf_cart_v2";
const orderKey = "greenleaf_order_meta";
const addGuard = { lastId: "", lastAt: 0 };

function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(stateKey)) || {};
    const validIds = new Set(products.map((p) => p.id));
    const clean = {};
    for (const [id, qty] of Object.entries(raw)) {
      const n = Number(qty);
      if (validIds.has(id) && Number.isFinite(n) && n > 0) {
        clean[id] = Math.floor(n);
      }
    }
    // Keep storage aligned so stale/invalid keys do not affect UI.
    if (JSON.stringify(raw) !== JSON.stringify(clean)) {
      localStorage.setItem(stateKey, JSON.stringify(clean));
    }
    return clean;
  } catch {
    return {};
  }
}
function setCart(cart) { localStorage.setItem(stateKey, JSON.stringify(cart)); updateCartCount(); }
function findProduct(id) { return products.find((p) => p.id === id); }
function formatRs(v) { return `Rs. ${v}`; }
function getTotals(cart) {
  const itemsTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = findProduct(id);
    return p ? sum + p.price * qty : sum;
  }, 0);
  return { itemsTotal, delivery: 0, grand: itemsTotal };
}
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = Object.values(getCart()).reduce((a, b) => a + b, 0);
}
function addToCart(id, qty = 1) {
  const now = Date.now();
  if (addGuard.lastId === id && (now - addGuard.lastAt) < 450) return;
  addGuard.lastId = id;
  addGuard.lastAt = now;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  setCart(cart);
}

function buildMenuCards() {
  const root = document.getElementById("menuList");
  if (!root) return;
  root.innerHTML = products.map((p) => `
    <article class="menu-item">
      <a class="link-clean" href="product.html?id=${p.id}"><div class="thumb"><img src="${p.image}" alt="${p.name}" /></div></a>
      <div><h3 class="item-name">${p.name}</h3><p class="item-desc">${p.desc}</p><div class="price">${formatRs(p.price)}</div></div>
      <button class="btn btn-primary small-btn" data-add="${p.id}">Add to cart</button>
    </article>`).join("");
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(btn.dataset.add, 1);
    btn.textContent = "Added";
    setTimeout(() => (btn.textContent = "Add to cart"), 900);
  });
}

function initSlider() {
  const slidesWrap = document.getElementById("slides");
  const dotsWrap = document.getElementById("dots");
  if (!slidesWrap || !dotsWrap) return;
  const slides = Array.from(slidesWrap.children);
  let index = 0;
  dotsWrap.innerHTML = slides.map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" data-dot="${i}"></button>`).join("");
  const render = () => {
    slidesWrap.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === index));
  };
  dotsWrap.addEventListener("click", (e) => {
    const d = e.target.closest("[data-dot]");
    if (!d) return;
    index = Number(d.dataset.dot);
    render();
  });
  setInterval(() => { index = (index + 1) % slides.length; render(); }, 3200);
}

function initProductPage() {
  const page = document.getElementById("productPage");
  if (!page) return;
  const id = new URLSearchParams(location.search).get("id") || "goat-milk";
  const p = findProduct(id) || products[0];
  document.getElementById("pName").textContent = p.name;
  document.getElementById("pDesc").textContent = "This handmade soap is crafted in small batches with skin-friendly ingredients for gentle cleansing and daily care.";
  document.getElementById("pPrice").textContent = formatRs(p.price);
  document.getElementById("pImage").innerHTML = `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:22px;" />`;
  let qty = 1;
  const qtyEl = document.getElementById("qtyVal");
  document.getElementById("qtyMinus").onclick = () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; };
  document.getElementById("qtyPlus").onclick = () => { qty += 1; qtyEl.textContent = qty; };
  document.getElementById("addProductCart").onclick = () => {
    addToCart(p.id, qty);
    const msg = document.getElementById("productMsg");
    msg.textContent = "Added to cart.";
    msg.className = "msg ok";
  };
}

function renderCartPage() {
  const root = document.getElementById("cartPage");
  if (!root) return;

  const rows = document.getElementById("cartRows");
  let selectedPay = "UPI";
  let paidActionDone = false;
  const amountPaidBtn = document.getElementById("amountPaidBtn");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const printReceiptBtn = document.getElementById("printReceiptBtn");

  function setStatus(text, ok = false) {
    const s = document.getElementById("statusMsg");
    s.textContent = text;
    s.className = `msg ${ok ? "ok" : "err"}`;
  }

  function validateForm() {
    const name = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    if (!name || !phone || !address || !pincode) return "Please fill all order form fields.";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits.";
    if (!/^\d{6}$/.test(pincode)) return "Pincode must be 6 digits.";
    return "";
  }

  function drawRows() {
    const now = getCart();
    const entries = Object.entries(now).filter(([, q]) => q > 0);
    rows.innerHTML = !entries.length ? '<p class="subtle">Your cart is empty.</p>' : entries.map(([id, qty]) => {
      const p = findProduct(id);
      if (!p) return "";
      return `<div class="cart-row"><div class="thumb-sm"><img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" /></div><div><strong>${p.name}</strong><div class="subtle">${formatRs(p.price)}</div></div><div class="qty"><button data-q="-" data-id="${id}">-</button><span>${qty}</span><button data-q="+" data-id="${id}">+</button></div><strong>${formatRs(p.price * qty)}</strong></div>`;
    }).join("");

    const t = getTotals(now);
    document.getElementById("itemsTotal").textContent = formatRs(t.itemsTotal);
    document.getElementById("deliveryCharge").textContent = formatRs(t.delivery);
    document.getElementById("grandTotal").textContent = formatRs(t.grand);
    document.getElementById("upiAmount").textContent = formatRs(t.grand);
    document.getElementById("upiAmountHidden").value = t.grand;
  }

  rows.addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]");
    if (!b) return;
    const cartNow = getCart();
    const id = b.dataset.id;
    if (!(id in cartNow)) return;
    cartNow[id] += b.dataset.q === "+" ? 1 : -1;
    if (cartNow[id] <= 0) delete cartNow[id];
    setCart(cartNow);
    drawRows();
  });

  const radios = Array.from(document.querySelectorAll('input[name="payMode"]'));
  radios.forEach((r) => {
    r.addEventListener("change", () => {
      if (!r.checked) return;
      selectedPay = r.value;
      const upi = document.getElementById("upiblock");
      const rzp = document.getElementById("razorpayBox");
      if (selectedPay === "UPI") {
        upi.classList.remove("hidden");
        rzp.classList.add("hidden");
        amountPaidBtn.disabled = false;
        amountPaidBtn.style.display = "inline-block";
        placeOrderBtn.disabled = true;
        printReceiptBtn.disabled = true;
      } else if (selectedPay === "Razorpay") {
        upi.classList.add("hidden");
        rzp.classList.remove("hidden");
        amountPaidBtn.disabled = false;
        amountPaidBtn.style.display = "inline-block";
        placeOrderBtn.disabled = true;
        printReceiptBtn.disabled = true;
      } else {
        upi.classList.add("hidden");
        rzp.classList.add("hidden");
        // COD: skip "Amount Paid" and allow direct order placement.
        paidActionDone = true;
        amountPaidBtn.style.display = "none";
        placeOrderBtn.disabled = false;
        printReceiptBtn.disabled = true;
        setStatus("Cash on Delivery selected. You can place order now.", true);
      }
    });
  });

  document.getElementById("payUpi").onclick = () => {
    const err = validateForm();
    if (err) return setStatus(err);
    const amount = Number(document.getElementById("upiAmountHidden").value || 0);
    window.location.href = `upi://pay?pa=${encodeURIComponent("Rohithpirate@iob")}&pn=${encodeURIComponent("GREEN LEAF")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Soap Order")}`;
    paidActionDone = true;
    amountPaidBtn.disabled = false;
    amountPaidBtn.style.display = "inline-block";
    setStatus("UPI app opened. If not, use QR or copy UPI ID.", true);
  };

  document.getElementById("copyUpi").onclick = async () => {
    try {
      await navigator.clipboard.writeText("Rohithpirate@iob");
      const btn = document.getElementById("copyUpi");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = old, 1200);
    } catch {
      setStatus("Could not copy UPI ID. Please copy manually.");
    }
  };

  document.getElementById("downloadQr").onclick = () => {
    const a = document.createElement("a");
    a.href = "assets/payments/upi-qr.jpeg";
    a.download = "upi-qr.jpeg";
    a.click();
  };

  document.getElementById("razorBtn").onclick = () => {
    const err = validateForm();
    if (err) return setStatus(err);
    if (typeof Razorpay === "undefined") return setStatus("Razorpay SDK not loaded.");
    const cfg = window.RAZORPAY_CONFIG || {};
    if (!cfg.keyId) return setStatus("Razorpay key missing.");
    const amount = Number(document.getElementById("upiAmountHidden").value || 0);
    const options = {
      key: cfg.keyId,
      amount: amount * 100,
      currency: "INR",
      name: cfg.merchantName || "Green Leaf",
      description: cfg.description || "Handmade Soap Order",
      theme: { color: cfg.themeColor || "#b65b45" },
      handler: function () {
        selectedPay = "Razorpay";
        paidActionDone = true;
        document.getElementById("amountPaidBtn").disabled = false;
        setStatus("Razorpay payment success. Click Amount Paid.", true);
      }
    };
    try {
      const rz = new Razorpay(options);
      rz.on("payment.failed", (resp) => {
        const reason = resp?.error?.description || "Payment failed. Please try again.";
        setStatus(reason);
      });
      rz.open();
    } catch (e) {
      setStatus("Razorpay could not start. Please check key/domain setup.");
    }
  };

  amountPaidBtn.onclick = () => {
    if (!paidActionDone) return setStatus("Please interact with one payment action first.");
    placeOrderBtn.disabled = false;
    printReceiptBtn.disabled = false;
    setStatus("Payment marked. You can now place order or print receipt.", true);
  };

  function buildOrderDetails() {
    const cartNow = getCart();
    const t = getTotals(cartNow);
    const name = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const items = Object.entries(cartNow).map(([id, qty]) => {
      const p = findProduct(id);
      return p ? `${p.name} x ${qty} = ${formatRs(p.price * qty)}` : "";
    }).filter(Boolean).join("\n");
    return { text: `GREEN LEAF Order\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nPincode: ${pincode}\nPayment Mode: ${selectedPay}\n\nItems:\n${items}\n\nTotal: ${formatRs(t.grand)}\n\nPlease share payment screenshot before processing.` };
  }

  document.getElementById("placeOrderBtn").onclick = () => {
    const err = validateForm();
    if (err) return setStatus(err);
    const order = buildOrderDetails();
    localStorage.setItem(orderKey, JSON.stringify(order));
    window.open(`https://wa.me/919597616797?text=${encodeURIComponent(order.text)}`, "_blank");
    setStatus("WhatsApp opened with prefilled order details.", true);
  };

  document.getElementById("printReceiptBtn").onclick = () => {
    const err = validateForm();
    if (err) return setStatus(err);
    const o = buildOrderDetails();
    const html = `<html><head><title>GREEN LEAF Receipt</title><style>body{font-family:Arial;padding:18px}h2{margin:0 0 8px}.box{border:1px solid #ccc;padding:12px;border-radius:8px;white-space:pre-line}</style></head><body><h2>GREEN LEAF - Order Receipt</h2><div class='box'>${o.text.replace(/\n/g, "<br>")}</div><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  drawRows();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  buildMenuCards();
  initSlider();
  initProductPage();
  renderCartPage();
  initMobileMenu();
});



function initMobileMenu(){
  const btn = document.getElementById("menuToggle");
  const nav = document.getElementById("mobileNav");
  if(!btn || !nav) return;
  btn.addEventListener("click", ()=> nav.classList.toggle("open"));
  document.addEventListener("click", (e)=>{
    if(!nav.classList.contains("open")) return;
    if(nav.contains(e.target) || btn.contains(e.target)) return;
    nav.classList.remove("open");
  });
}


