// BACK TO TOP BUTTON
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

  const scrollY = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const midpoint = pageHeight * 0.65;
  const nearBottom = pageHeight * 0.95;

  if (scrollY >= midpoint && scrollY < nearBottom) {
    topBtn.classList.remove("hidden");
  } else {
    topBtn.classList.add("hidden");
  }

});

topBtn?.addEventListener("click", () => {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


// LOAD VENDORS (from vendors.json + localStorage approved)
async function initApp() {

  let vendors = {};

  try {
    const res = await fetch("vendors.json");
    vendors = await res.json();
  } catch (e) {
    console.error("Could not load vendors.json:", e);
  }

  // Merge in any admin-approved vendors from localStorage
  try {
    const approved = JSON.parse(localStorage.getItem("chowspot_approved_vendors") || "{}");
    Object.assign(vendors, approved);
  } catch (e) {
    console.warn("Could not load approved vendors from localStorage:", e);
  }


// OPEN NOW BADGE
function parseTime(timeStr) {
  if (!timeStr) return null;
  timeStr = timeStr.trim().toUpperCase();
  const isPM = timeStr.includes("PM");
  const isAM = timeStr.includes("AM");
  timeStr = timeStr.replace("PM", "").replace("AM", "").trim();
  let [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(minutes)) minutes = 0;
  if (isPM && hours !== 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function isVendorOpen(vendorKey) {
  const vendor = vendors[vendorKey];
  if (!vendor || !vendor.hours) return null;
  const now = new Date();
  const currentDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayHours = vendor.hours.find((h) => h.day === currentDay);
  if (!todayHours) return null;
  if (!todayHours.time || todayHours.time.toLowerCase() === "closed") return false;
  const parts = todayHours.time.split("-").map((s) => s.trim());
  if (parts.length < 2) return null;
  const openMin = parseTime(parts[0]);
  let closeMin = parseTime(parts[1]);
  if (openMin === null || closeMin === null) return null;
  if (closeMin < openMin) closeMin += 24 * 60;
  let adjustedNow = currentMinutes;
  if (currentMinutes < openMin) adjustedNow += 24 * 60;
  return adjustedNow >= openMin && adjustedNow < closeMin;
}

const vendorSlugMap = {
  "Mama Nkechi Suya": "mama-nkechi",
  "Shawarma Hub": "shawarma-hub",
  "Bukka Royale": "bukka-royale",
  "Amaka Bole Spot": "amaka-bole",
  "Iya Basira Kitchen": "iya-basira",
  "Chops & Peppers": "chops-peppers",
};

document.querySelectorAll(".food-card").forEach((card) => {
  const nameEl = card.querySelector("h2, h3");
  if (!nameEl) return;
  const cardName = nameEl.textContent.trim();
  const slug = vendorSlugMap[cardName];
  if (!slug) return;
  const isOpen = isVendorOpen(slug);
  if (isOpen === null) return;
  const img = card.querySelector("img");
  if (!img) return;
  const wrapper = img.parentElement;
  wrapper.style.position = "relative";
  const badge = document.createElement("span");
  badge.className = isOpen
    ? "absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
    : "absolute top-3 left-3 bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10";
  badge.textContent = isOpen ? "🟢 Open Now" : "🔴 Closed";
  wrapper.appendChild(badge);
});



// WHATSAPP SHARE BUTTON
document.querySelectorAll(".food-card").forEach((card) => {
  const nameEl = card.querySelector("h2, h3");
  if (!nameEl) return;
  const cardName = nameEl.textContent.trim();
  const slug = vendorSlugMap[cardName];
  if (!slug) return;
  const vendor = vendors[slug];
  if (!vendor) return;
  const viewBtn = card.querySelector(".view-details-btn");
  if (!viewBtn) return;
  const profileUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "vendor.html?vendor=" + slug;
  const shareMessage = "Hey! Check out " + vendor.name + " on ChowSpot 🍽️\n📍 " + vendor.location + "\n\n" + profileUrl;
  const shareBtn = document.createElement("a");
  shareBtn.href = "https://wa.me/?text=" + encodeURIComponent(shareMessage);
  shareBtn.target = "_blank";
  shareBtn.className = "mt-3 w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-green-500 hover:text-green-400 py-3 rounded-xl transition duration-300 text-sm font-medium text-slate-400";
  shareBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-lg"></i> Share on WhatsApp';
  viewBtn.insertAdjacentElement("afterend", shareBtn);
});


// MOBILE MENU
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
  });
}



// HERO SEARCH REDIRECT (index.html)
const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchBtn = document.getElementById("heroSearchBtn");

function goToSearch() {
  const query = heroSearchInput?.value.trim();
  if (query) {
    window.location.href = `explore.html?search=${encodeURIComponent(query)}`;
  } else {
    window.location.href = "explore.html";
  }
}

heroSearchBtn?.addEventListener("click", goToSearch);

heroSearchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goToSearch();
});



// LIVE SEARCH FILTER (explore.html)
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const foodCards = document.querySelectorAll(".food-card");
const emptyState = document.getElementById("emptyState");

function runSearch(value) {
  const searchValue = value.toLowerCase();
  foodCards.forEach((card) => {
    const vendorName = (card.querySelector("h2, h3")?.textContent || "").toLowerCase();
    const category = (card.dataset.category || "").toLowerCase();
    const location = (card.querySelector("p")?.textContent || "").toLowerCase();
    const matchesSearch = vendorName.includes(searchValue) || category.includes(searchValue) || location.includes(searchValue);
    card.style.display = matchesSearch ? "block" : "none";
  });
  const visibleCards = [...foodCards].filter((card) => card.style.display !== "none");
  if (visibleCards.length === 0) {
    emptyState?.classList.remove("hidden");
  } else {
    emptyState?.classList.add("hidden");
  }
}

searchInput?.addEventListener("input", (e) => runSearch(e.target.value));
searchBtn?.addEventListener("click", () => runSearch(searchInput?.value || ""));
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch(e.target.value);
});

// PRE-FILL SEARCH FROM URL (when redirected from homepage)
const urlParams = new URLSearchParams(window.location.search);
const urlSearch = urlParams.get("search");
const urlCity   = urlParams.get("city");

if (urlSearch && searchInput) {
  searchInput.value = urlSearch;
}

if (urlCity) {
  const matchingCityBtn = [...document.querySelectorAll(".city-btn")]
    .find(b => b.dataset.city === urlCity.toLowerCase());
  if (matchingCityBtn) {
    document.querySelectorAll(".city-btn").forEach(b => {
      b.classList.remove("bg-amber-500", "text-black");
      b.classList.add("bg-slate-800", "text-slate-300");
    });
    matchingCityBtn.classList.add("bg-amber-500", "text-black");
    matchingCityBtn.classList.remove("bg-slate-800", "text-slate-300");
    activeCity = urlCity.toLowerCase();
  }
}

if (urlSearch || urlCity) applyAllFilters();



// CATEGORY FILTER
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove("bg-amber-500", "text-black");
      btn.classList.add("bg-slate-800");
    });
    button.classList.add("bg-amber-500", "text-black");
    button.classList.remove("bg-slate-800");
    const category = button.dataset.category;
    foodCards.forEach((card) => {
      if (category === "all" || (card.dataset.category || "").toLowerCase().includes(category.toLowerCase())) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});






// OPEN NOW FILTER
const openNowBtn = document.getElementById("openNowBtn");
const openNowDot = document.getElementById("openNowDot");
let openNowActive = false;

const cityButtons = document.querySelectorAll(".city-btn");
let activeCity = "all";

// Wire city buttons
cityButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    cityButtons.forEach((b) => {
      b.classList.remove("bg-amber-500", "text-black");
      b.classList.add("bg-slate-800", "text-slate-300");
    });
    btn.classList.add("bg-amber-500", "text-black");
    btn.classList.remove("bg-slate-800", "text-slate-300");
    activeCity = btn.dataset.city;
    applyAllFilters();
  });
});

function applyAllFilters() {
  const searchValue = (searchInput?.value || "").toLowerCase();
  const activeCategory = document.querySelector(".filter-btn.bg-amber-500")?.dataset.category || "all";

  foodCards.forEach((card) => {
    const nameEl = card.querySelector("h2, h3");
    const cardName = (nameEl?.textContent || "").trim();
    const slug = vendorSlugMap[cardName];
    const vendorName = cardName.toLowerCase();
    const category = (card.dataset.category || "").toLowerCase();
    const location = (card.querySelector("p")?.textContent || "").toLowerCase();
    const city = (card.dataset.city || "").toLowerCase();

    const matchesSearch = !searchValue || vendorName.includes(searchValue) || category.includes(searchValue) || location.includes(searchValue);
    const matchesCategory = activeCategory === "all" || category.includes(activeCategory.toLowerCase());
    const matchesCity = activeCity === "all" || city.includes(activeCity.toLowerCase());
    const matchesOpen = !openNowActive || (slug && isVendorOpen(slug) === true);

    card.style.display = (matchesSearch && matchesCategory && matchesCity && matchesOpen) ? "block" : "none";
  });

  const visibleCards = [...foodCards].filter((c) => c.style.display !== "none");
  if (emptyState) emptyState.classList.toggle("hidden", visibleCards.length > 0);
}

if (openNowBtn) {
  openNowBtn.addEventListener("click", () => {
    openNowActive = !openNowActive;
    if (openNowActive) {
      openNowBtn.classList.remove("bg-slate-800", "hover:bg-slate-700", "text-slate-300");
      openNowBtn.classList.add("bg-green-500/20", "border", "border-green-500/40", "text-green-400");
      if (openNowDot) { openNowDot.classList.remove("bg-slate-500"); openNowDot.classList.add("bg-green-400"); }
    } else {
      openNowBtn.classList.add("bg-slate-800", "hover:bg-slate-700", "text-slate-300");
      openNowBtn.classList.remove("bg-green-500/20", "border", "border-green-500/40", "text-green-400");
      if (openNowDot) { openNowDot.classList.remove("bg-green-400"); openNowDot.classList.add("bg-slate-500"); }
    }
    applyAllFilters();
  });
}

// SCROLL REVEAL ANIMATION
const fadeElements = document.querySelectorAll(".fade-up");

const revealOnScroll = () => {
  fadeElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if (elementTop < windowHeight - 100) {
      element.classList.add("show");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();



// ACTIVE NAV LINK
const navLinks = document.querySelectorAll(".nav-link");
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const vendorParam = new URLSearchParams(window.location.search).get("vendor");

// If on vendor.html with no ?vendor= param, redirect to explore.html
if (currentPage === "vendor.html" && !vendorParam) {
  window.location.replace("explore.html");
}

navLinks.forEach((link) => {

  const linkPage = link.getAttribute("href");
  const linkPath = linkPage ? linkPage.split("?")[0] : "";

  // Home never gets active — hover only
  if (linkPath === "index.html") return;

  // On vendor.html WITH ?vendor= param → Vendors link is active
  if (currentPage === "vendor.html" && vendorParam) {
    if (linkPath === "vendor.html") {
      link.classList.add("active");
    }
    return;
  }

  // All other pages — match normally
  if (linkPath === currentPage) {
    link.classList.add("active");
  }

});



// DYNAMIC VENDOR PAGE (vendor.html)
const params = new URLSearchParams(window.location.search);
const vendorId = params.get("vendor");
const allVendorsPage = document.getElementById("allVendorsPage");
const singleVendorPage = document.getElementById("singleVendorPage");

// Only run vendor-page logic on vendor.html (both elements must exist)
if (allVendorsPage && singleVendorPage) {

  if (vendorId && vendors[vendorId]) {

    allVendorsPage.style.display = "none";
    singleVendorPage.style.display = "block";

    const v = vendors[vendorId];

    document.getElementById("vendorName").textContent = v.name;
    document.getElementById("vendorLocation").innerHTML = `<i class="fa-solid fa-location-dot text-amber-400 mr-2"></i>${v.fullLocation}`;
    document.getElementById("vendorDescription").textContent = v.description;
    document.getElementById("vendorImage").src = v.image;
    document.getElementById("vendorRating").textContent = v.rating;
    document.getElementById("vendorReviews").textContent = v.reviews;
    document.getElementById("vendorBadge").textContent = v.badge;
    document.getElementById("vendorFullLocation").innerHTML = `<i class="fa-solid fa-location-dot text-amber-400 mr-2"></i>${v.fullLocation}`;
    document.getElementById("vendorMap").src = v.map;

    
    // RENDER OPENING HOURS
    const hoursContainer = document.getElementById("hoursContainer");
    if (hoursContainer && v.hours) {
      hoursContainer.innerHTML = v.hours.map((h) => `
        <div class="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
          <span class="text-slate-300 font-medium">${h.day}</span>
          <span class="text-amber-400 font-semibold">${h.time}</span>
        </div>
      `).join("");
    }

   
    // RENDER MENU
    const menuContainer = document.getElementById("menuContainer");
    if (menuContainer && v.menu) {
      menuContainer.innerHTML = v.menu.map((item) => `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-amber-400 hover:shadow-amber-500/20 hover:shadow-lg transition duration-300 fade-up">
          <div class="relative">
            <img src="${item.image}" alt="${item.name}" class="h-40 w-full object-cover">
          </div>
          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-xl font-bold">${item.name}</h3>
              <span class="text-amber-400 font-bold text-lg">${item.price}</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-5">${item.desc}</p>
            <div class="flex items-center gap-3 mb-4">
              <button class="qty-minus w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg font-bold transition" data-name="${item.name}">−</button>
              <span class="qty-display text-lg font-bold w-8 text-center" data-name="${item.name}">1</span>
              <button class="qty-plus w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg font-bold transition" data-name="${item.name}">+</button>
            </div>
            <button class="add-to-cart-btn w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-2xl transition duration-300 hover:scale-[1.02]" data-name="${item.name}" data-price="${item.price}">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      `).join("");
    }

    
    // RENDER PHOTO GALLERY
    const gallerySection = document.getElementById("gallerySection");
    const galleryStrip = document.getElementById("galleryStrip");

    if (galleryStrip && v.menu && v.menu.length > 0) {
      const dishImages = v.menu.filter(item => item.image);

      if (dishImages.length > 0) {
        gallerySection?.classList.remove("hidden");

        galleryStrip.innerHTML = dishImages.map((item, idx) => `
          <div class="gallery-thumb shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-400 transition duration-300 group"
            data-index="${idx}">
            <img src="${item.image}" alt="${item.name}"
              class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
          </div>
        `).join("");

        // Build lightbox
        const lightbox = document.createElement("div");
        lightbox.id = "lightboxOverlay";
        lightbox.className = "fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm hidden items-center justify-center";
        lightbox.innerHTML = `
          <button id="lbClose" class="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition z-10">✕</button>
          <button id="lbPrev" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition z-10">‹</button>
          <button id="lbNext" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition z-10">›</button>
          <div class="flex flex-col items-center gap-4 px-16 max-w-3xl w-full">
            <img id="lbImage" src="" alt="" class="max-h-[70vh] max-w-full rounded-3xl object-contain shadow-2xl">
            <p id="lbCaption" class="text-white text-center font-semibold text-lg"></p>
            <p id="lbPrice" class="text-amber-400 font-bold text-base"></p>
            <div id="lbDots" class="flex gap-2 mt-1"></div>
          </div>
        `;
        document.body.appendChild(lightbox);

        let currentIdx = 0;

        function openLightbox(idx) {
          currentIdx = idx;
          updateLightbox();
          lightbox.classList.remove("hidden");
          lightbox.classList.add("flex");
          document.body.style.overflow = "hidden";
        }

        function closeLightbox() {
          lightbox.classList.add("hidden");
          lightbox.classList.remove("flex");
          document.body.style.overflow = "";
        }

        function updateLightbox() {
          const item = dishImages[currentIdx];
          document.getElementById("lbImage").src = item.image;
          document.getElementById("lbImage").alt = item.name;
          document.getElementById("lbCaption").textContent = item.name;
          document.getElementById("lbPrice").textContent = item.price;

          // Dots
          const dotsEl = document.getElementById("lbDots");
          dotsEl.innerHTML = dishImages.map((_, i) =>
            `<span class="w-2 h-2 rounded-full transition duration-300 ${i === currentIdx ? "bg-amber-400 scale-125" : "bg-white/30"}"></span>`
          ).join("");
        }

        function nextSlide() {
          currentIdx = (currentIdx + 1) % dishImages.length;
          updateLightbox();
        }

        function prevSlide() {
          currentIdx = (currentIdx - 1 + dishImages.length) % dishImages.length;
          updateLightbox();
        }

        // Thumbnail click
        galleryStrip.querySelectorAll(".gallery-thumb").forEach((thumb) => {
          thumb.addEventListener("click", () => openLightbox(parseInt(thumb.dataset.index)));
        });

        // Controls
        document.getElementById("lbClose").addEventListener("click", closeLightbox);
        document.getElementById("lbNext").addEventListener("click", nextSlide);
        document.getElementById("lbPrev").addEventListener("click", prevSlide);

        // Backdrop click
        lightbox.addEventListener("click", (e) => {
          if (e.target === lightbox) closeLightbox();
        });

        // Keyboard nav
        document.addEventListener("keydown", (e) => {
          if (lightbox.classList.contains("hidden")) return;
          if (e.key === "Escape") closeLightbox();
          if (e.key === "ArrowRight") nextSlide();
          if (e.key === "ArrowLeft") prevSlide();
        });

        // Touch/swipe support
        let touchStartX = 0;
        lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; });
        lightbox.addEventListener("touchend", (e) => {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        });
      }
    }


    // RENDER CUSTOMER REVIEWS
    const reviewsContainer = document.getElementById("reviewsContainer");
    if (reviewsContainer && v.customerReviews) {
      reviewsContainer.innerHTML = v.customerReviews.map((r) => `
        <div class="bg-slate-900 border border-amber-400/30 rounded-3xl p-8 fade-up show">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xl">
              ${r.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="font-semibold text-lg">${r.name}</h3>
              <p class="text-amber-400 text-sm">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
          <p class="text-slate-400 leading-relaxed">${r.review}</p>
        </div>
      `).join("");
    }

    
    // SAVE FAVORITE VENDOR
    const saveVendorBtn = document.getElementById("saveVendorBtn");
    let favorites = JSON.parse(localStorage.getItem("chowspot_favorites")) || [];

    if (saveVendorBtn) {
      const vendorSlug = vendorId;
      if (favorites.includes(vendorSlug)) {
        saveVendorBtn.innerHTML = "✅ Saved";
        saveVendorBtn.classList.add("border-amber-400", "text-amber-400");
      }
      saveVendorBtn.addEventListener("click", () => {
        if (!favorites.includes(vendorSlug)) {
          favorites.push(vendorSlug);
          localStorage.setItem("chowspot_favorites", JSON.stringify(favorites));
          saveVendorBtn.innerHTML = "✅ Saved";
          saveVendorBtn.classList.add("border-amber-400", "text-amber-400");
        } else {
          favorites = favorites.filter((f) => f !== vendorSlug);
          localStorage.setItem("chowspot_favorites", JSON.stringify(favorites));
          saveVendorBtn.innerHTML = "❤️ Save Vendor";
          saveVendorBtn.classList.remove("border-amber-400", "text-amber-400");
        }
      });
    }

    
    // CART
    let cart = [];

    function getNumericPrice(priceStr) {
      return parseInt(priceStr.replace(/[^\d]/g, ""), 10) || 0;
    }

    function renderCart() {
      const cartItemsList = document.getElementById("cartItemsList");
      const cartCount = document.getElementById("cartCount");
      const cartTotal = document.getElementById("cartTotal");
      const cartWidget = document.getElementById("cartWidget");

      if (!cartItemsList) return;

      const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
      const totalPrice = cart.reduce((sum, i) => sum + getNumericPrice(i.price) * i.qty, 0);

      if (cartCount) cartCount.textContent = totalQty;
      if (cartTotal) cartTotal.textContent = `₦${totalPrice.toLocaleString()}`;
      if (cartWidget) cartWidget.classList.toggle("hidden", totalQty === 0);

      if (cart.length === 0) {
        cartItemsList.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center py-16 text-slate-500">
            <div class="text-6xl mb-4">🛒</div>
            <p class="text-lg font-medium">Your cart is empty</p>
            <p class="text-sm mt-2">Add items from the menu below</p>
          </div>
        `;
        return;
      }

      cartItemsList.innerHTML = cart.map((item) => `
        <div class="flex items-center gap-4 py-4 border-b border-slate-800 last:border-0">
          <div class="flex-1">
            <p class="font-semibold text-sm">${item.name}</p>
            <p class="text-amber-400 text-sm">${item.price}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="cart-minus w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition" data-name="${item.name}">−</button>
            <span class="text-sm font-bold w-6 text-center">${item.qty}</span>
            <button class="cart-plus w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition" data-name="${item.name}">+</button>
          </div>
          <button class="cart-remove text-slate-500 hover:text-red-400 transition text-lg ml-2" data-name="${item.name}">✕</button>
        </div>
      `).join("");

      cartItemsList.querySelectorAll(".cart-minus").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = cart.find((i) => i.name === btn.dataset.name);
          if (item) {
            item.qty--;
            if (item.qty <= 0) cart = cart.filter((i) => i.name !== btn.dataset.name);
            renderCart();
          }
        });
      });

      cartItemsList.querySelectorAll(".cart-plus").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = cart.find((i) => i.name === btn.dataset.name);
          if (item) { item.qty++; renderCart(); }
        });
      });

      cartItemsList.querySelectorAll(".cart-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          cart = cart.filter((i) => i.name !== btn.dataset.name);
          renderCart();
        });
      });
    }

    function injectCartUI() {
      const widget = document.createElement("div");
      widget.id = "cartWidget";
      widget.className = "hidden fixed bottom-24 right-6 z-50";
      widget.innerHTML = `
        <button id="cartToggleBtn" class="relative bg-amber-500 hover:bg-amber-400 text-black w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transition duration-300 hover:scale-110 hover:shadow-amber-500/40 hover:shadow-lg">
          🛒
          <span id="cartCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">0</span>
        </button>
      `;
      document.body.appendChild(widget);

      const panel = document.createElement("div");
      panel.id = "cartPanel";
      panel.className = "fixed inset-0 z-[60] hidden";
      panel.innerHTML = `
        <div id="cartBackdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <h2 class="text-2xl font-bold">Your Cart 🛒</h2>
            <button id="cartCloseBtn" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl transition">✕</button>
          </div>
          <div id="cartItemsList" class="flex-1 overflow-y-auto px-6 py-2"></div>
          <div class="px-6 py-6 border-t border-slate-800 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 text-lg font-semibold">Total</span>
              <span id="cartTotal" class="text-amber-400 text-2xl font-bold">₦0</span>
            </div>
            <button id="checkoutBtn" class="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl transition duration-300 hover:scale-[1.02] hover:shadow-amber-500/40 hover:shadow-lg text-lg">
              📲 Send Order via WhatsApp
            </button>
            <button id="clearCartBtn" class="w-full border border-slate-700 hover:border-red-400 hover:text-red-400 py-3 rounded-2xl transition duration-300 text-slate-400">
              Clear Cart
            </button>
          </div>

          <!-- PAST ORDERS -->
          <div id="pastOrdersSection" class="border-t border-slate-800 px-6 py-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                <i class="fa-solid fa-clock-rotate-left mr-2 text-amber-400"></i>Past Orders
              </h3>
              <button id="clearHistoryBtn" class="text-xs text-slate-600 hover:text-red-400 transition">Clear</button>
            </div>
            <div id="pastOrdersList" class="space-y-3 max-h-52 overflow-y-auto"></div>
          </div>

        </div>
      `;
      document.body.appendChild(panel);

      document.getElementById("cartToggleBtn").addEventListener("click", () => {
        renderCart();
        panel.classList.remove("hidden");
      });
      document.getElementById("cartCloseBtn").addEventListener("click", () => panel.classList.add("hidden"));
      document.getElementById("cartBackdrop").addEventListener("click", () => panel.classList.add("hidden"));
      document.getElementById("clearCartBtn").addEventListener("click", () => {
        cart = [];
        renderCart();
      });

      // ORDER HISTORY
      function renderOrderHistory() {
        const historyKey = "chowspot_order_history";
        const list = document.getElementById("pastOrdersList");
        const section = document.getElementById("pastOrdersSection");
        if (!list || !section) return;

        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        const vendorHistory = history.filter(o => o.vendorSlug === vendorId);

        if (vendorHistory.length === 0) {
          list.innerHTML = `<p class="text-slate-600 text-xs text-center py-3">No past orders from this vendor yet.</p>`;
          return;
        }

        list.innerHTML = vendorHistory.map(order => {
          const date = new Date(order.date);
          const dateStr = date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
          const timeStr = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
          const summary = order.items.map(i => `${i.qty}× ${i.name}`).join(", ");
          return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-500">${dateStr} · ${timeStr}</span>
                <span class="text-amber-400 text-xs font-bold">₦${order.total.toLocaleString()}</span>
              </div>
              <p class="text-slate-400 text-xs leading-relaxed truncate">${summary}</p>
              <button class="reorder-btn mt-3 w-full bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-300 text-xs font-semibold py-2 rounded-xl transition duration-300"
                data-order='${JSON.stringify(order.items)}'>
                🔁 Reorder
              </button>
            </div>
          `;
        }).join("");

        list.querySelectorAll(".reorder-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const items = JSON.parse(btn.dataset.order);
            items.forEach(item => {
              const existing = cart.find(i => i.name === item.name);
              if (existing) {
                existing.qty += item.qty;
              } else {
                cart.push({ name: item.name, price: item.price, qty: item.qty });
              }
            });
            renderCart();
            btn.textContent = "✅ Added to cart!";
            setTimeout(() => { btn.textContent = "🔁 Reorder"; }, 1500);
          });
        });
      }

      document.getElementById("clearHistoryBtn")?.addEventListener("click", () => {
        const historyKey = "chowspot_order_history";
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        const filtered = history.filter(o => o.vendorSlug !== vendorId);
        localStorage.setItem(historyKey, JSON.stringify(filtered));
        renderOrderHistory();
      });

      renderOrderHistory();
      document.getElementById("checkoutBtn").addEventListener("click", () => {
        if (cart.length === 0) return;
        const totalPrice = cart.reduce((sum, i) => sum + getNumericPrice(i.price) * i.qty, 0);
        const itemLines = cart.map((i) => `  • ${i.qty}x ${i.name} (${i.price} each)`).join("\n");
        const message = `Hello ${v.name}! 👋\n\nI'd like to place an order:\n\n${itemLines}\n\n*Total: ₦${totalPrice.toLocaleString()}*\n\nPlease confirm availability. Thank you!`;

        // Save to order history before opening WhatsApp
        const historyKey = "chowspot_order_history";
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        history.unshift({
          id: Date.now(),
          vendor: v.name,
          vendorSlug: vendorId,
          items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
          total: totalPrice,
          date: new Date().toISOString()
        });
        // Keep last 20 orders only
        localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));
        renderOrderHistory();

        window.open(`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
      });
    }

    injectCartUI();
    renderCart();

   
    // QUANTITY CONTROLS on menu cards
    document.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const display = document.querySelector(`.qty-display[data-name="${btn.dataset.name}"]`);
        if (display) display.textContent = parseInt(display.textContent) + 1;
      });
    });

    document.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const display = document.querySelector(`.qty-display[data-name="${btn.dataset.name}"]`);
        if (display && parseInt(display.textContent) > 1) {
          display.textContent = parseInt(display.textContent) - 1;
        }
      });
    });

    // ADD TO CART
    document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = button.dataset.price;
        const card = button.closest(".bg-slate-900");
        const qtyDisplay = card?.querySelector(`.qty-display[data-name="${name}"]`);
        const qty = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;
        const existing = cart.find((i) => i.name === name);
        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({ name, price, qty });
        }
        button.textContent = "✅ Added!";
        button.classList.remove("bg-amber-500", "hover:bg-amber-400");
        button.classList.add("bg-green-500");
        setTimeout(() => {
          button.textContent = "🛒 Add to Cart";
          button.classList.add("bg-amber-500", "hover:bg-amber-400");
          button.classList.remove("bg-green-500");
        }, 1200);
        if (qtyDisplay) qtyDisplay.textContent = "1";
        renderCart();
      });
    });

   
    // REVIEW FORM
    let selectedRating = 0;
    const stars = document.querySelectorAll(".star");

    stars.forEach((star) => {
      star.addEventListener("mouseenter", () => {
        const val = parseInt(star.dataset.value);
        stars.forEach((s) => {
          s.classList.toggle("text-amber-400", parseInt(s.dataset.value) <= val);
          s.classList.toggle("text-slate-600", parseInt(s.dataset.value) > val);
        });
      });
      star.addEventListener("mouseleave", () => {
        stars.forEach((s) => {
          s.classList.toggle("text-amber-400", parseInt(s.dataset.value) <= selectedRating);
          s.classList.toggle("text-slate-600", parseInt(s.dataset.value) > selectedRating);
        });
      });
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        stars.forEach((s) => {
          s.classList.toggle("text-amber-400", parseInt(s.dataset.value) <= selectedRating);
          s.classList.toggle("text-slate-600", parseInt(s.dataset.value) > selectedRating);
        });
      });
    });

    const submitReviewBtn = document.getElementById("submitReviewBtn");
    const reviewName = document.getElementById("reviewName");
    const reviewText = document.getElementById("reviewText");

    submitReviewBtn?.addEventListener("click", () => {
      const name = reviewName.value.trim();
      const text = reviewText.value.trim();
      if (!name || !text || selectedRating === 0) {
        submitReviewBtn.textContent = "⚠️ Please fill all fields & select a rating";
        submitReviewBtn.classList.add("bg-red-500");
        submitReviewBtn.classList.remove("bg-amber-500");
        setTimeout(() => {
          submitReviewBtn.textContent = "Submit Review ✓";
          submitReviewBtn.classList.remove("bg-red-500");
          submitReviewBtn.classList.add("bg-amber-500");
        }, 2500);
        return;
      }
      const starDisplay = "⭐".repeat(selectedRating);
      const reviewCard = document.createElement("div");
      reviewCard.className = "bg-slate-900 border border-amber-400/30 rounded-3xl p-8 fade-up show";
      reviewCard.innerHTML = `
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xl">
            ${name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 class="font-semibold text-lg">${name}</h3>
            <p class="text-slate-400 text-sm">${starDisplay}</p>
          </div>
        </div>
        <p class="text-slate-400 leading-relaxed">${text}</p>
      `;
      const reviewsContainer = document.getElementById("reviewsContainer");
      reviewsContainer?.prepend(reviewCard);
      reviewName.value = "";
      reviewText.value = "";
      selectedRating = 0;
      stars.forEach((s) => {
        s.classList.remove("text-amber-400");
        s.classList.add("text-slate-600");
      });
      submitReviewBtn.textContent = "✅ Review Submitted!";
      submitReviewBtn.classList.add("bg-green-500");
      submitReviewBtn.classList.remove("bg-amber-500");
      setTimeout(() => {
        submitReviewBtn.textContent = "Submit Review ✓";
        submitReviewBtn.classList.remove("bg-green-500");
        submitReviewBtn.classList.add("bg-amber-500");
      }, 2500);
    });

    // BROWSE MENU SCROLL
    const browseMenuBtn = document.getElementById("browseMenuBtn");
    browseMenuBtn?.addEventListener("click", () => {
      document.getElementById("menuHighlights")?.scrollIntoView({ behavior: "smooth" });
    });

  } else {

    // No vendor param — show the vendor list
    allVendorsPage.style.display = "block";
    singleVendorPage.style.display = "none";

  }

}


// FADE-UP INTERSECTION OBSERVER
const fadeUps = document.querySelectorAll(".fade-up");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add("show");
      }, index * 150);
    }
  });
});

fadeUps.forEach((el) => observer.observe(el));

} // end initApp

initApp();