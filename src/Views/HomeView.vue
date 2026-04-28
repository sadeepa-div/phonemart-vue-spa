<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import ProductCard from "../components/ProductCard.vue"

const router = useRouter()

function handleLogout() {
  localStorage.removeItem('auth_token')
  router.push('/login')
}

interface Product {
  id: number
  title: string
  price: number
  thumbnail: string
  description: string
  brand: string
  rating: number
  discountPercentage: number
  stock?: number
}

// ─── STATE ───────────────────────────────────────────────
const products        = ref<Product[]>([])
const loading         = ref(true)
const search          = ref("")
const selectedProduct = ref<Product | null>(null)
const selectedBrand   = ref("All")
const sortBy          = ref("default")

// ─── HERO SLIDESHOW ──────────────────────────────────────
const heroSlides = [
  {
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&q=80",
    tag: "Just Dropped",
    title: "iPhone 17\nPro Max",
    sub: "Titanium. Reimagined. Extraordinary.",
    badge: "Up to 15% OFF"
  },
  {
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&q=80",
    tag: "Best Seller",
    title: "Samsung\nGalaxy S25",
    sub: "AI-powered. Brilliantly sharp.",
    badge: "Save $120"
  },
  {
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&q=80",
    tag: "Flash Deal",
    title: "Pixel 9\nPro Fold",
    sub: "Google's finest. Unfold the future.",
    badge: "40% OFF Today"
  },
  {
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
    tag: "Limited Time",
    title: "OnePlus 13\nUltra",
    sub: "Speed. Power. Precision.",
    badge: "30% OFF"
  }
]

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval>

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.length
}
function goToSlide(i: number) {
  currentSlide.value = i
  clearInterval(slideTimer)
  slideTimer = setInterval(nextSlide, 5000)
}

onMounted(() => { slideTimer = setInterval(nextSlide, 5000) })
onUnmounted(() => clearInterval(slideTimer))

// ─── WISHLIST ────────────────────────────────────────────
const wishlist = ref<number[]>([])

function toggleWishlist(id: number) {
  const idx = wishlist.value.indexOf(id)
  if (idx === -1) {
    wishlist.value.push(id)
    fireToast("Added to wishlist ♥", "info")
  } else {
    wishlist.value.splice(idx, 1)
    fireToast("Removed from wishlist", "info")
  }
}

function isWishlisted(id: number) {
  return wishlist.value.includes(id)
}

// ─── CART ────────────────────────────────────────────────
const cart      = ref<{ product: Product; quantity: number }[]>([])
const showCart  = ref(false)
const showToast = ref(false)
const toastMsg  = ref("")
const toastType = ref<"success" | "info" | "warn">("success")

onMounted(() => {
  const savedCart = localStorage.getItem("pm_cart")
  if (savedCart) cart.value = JSON.parse(savedCart)
  const savedWish = localStorage.getItem("pm_wishlist")
  if (savedWish) wishlist.value = JSON.parse(savedWish)
})

watch(cart, () => {
  localStorage.setItem("pm_cart", JSON.stringify(cart.value))
}, { deep: true })

watch(wishlist, () => {
  localStorage.setItem("pm_wishlist", JSON.stringify(wishlist.value))
}, { deep: true })

function addToCart(product: Product, qty = 1) {
  const existing = cart.value.find(i => i.product.id === product.id)
  if (existing) existing.quantity += qty
  else cart.value.push({ product, quantity: qty })
}

function removeFromCart(id: number) {
  cart.value = cart.value.filter(i => i.product.id !== id)
}

function incrementQty(id: number) {
  const item = cart.value.find(i => i.product.id === id)
  if (item) item.quantity++
}

function decrementQty(id: number) {
  const item = cart.value.find(i => i.product.id === id)
  if (!item) return
  if (item.quantity <= 1) removeFromCart(id)
  else item.quantity--
}

function clearCart() {
  cart.value = []
  fireToast("Cart cleared", "info")
}

function handleAddToCart(product?: Product) {
  const p = product ?? selectedProduct.value
  if (!p) return
  addToCart(p, detailQty.value)
  fireToast(`${p.title.slice(0, 30)}… added to cart!`, "success")
}

function handleBuyNow(product?: Product) {
  const p = product ?? selectedProduct.value
  if (!p) return
  addToCart(p, detailQty.value)
  selectedProduct.value = null
  showCart.value = true
  fireToast("Ready to checkout! ⚡", "info")
}

function fireToast(msg: string, type: "success" | "info" | "warn" = "success") {
  toastMsg.value  = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => (showToast.value = false), 2800)
}

// ─── DETAIL QUANTITY ─────────────────────────────────────
const detailQty = ref(1)
watch(selectedProduct, () => { detailQty.value = 1 })

// ─── FETCH PRODUCTS ──────────────────────────────────────
onMounted(async () => {
  try {
    const res  = await fetch("https://dummyjson.com/products/category/smartphones?limit=30")
    const data = await res.json()
    products.value = data.products
  } catch {
    fireToast("Failed to load products", "warn")
  } finally {
    loading.value = false
  }
})

// ─── COMPUTED ────────────────────────────────────────────
const brands = computed(() => {
  const all = products.value.map(p => p.brand).filter(Boolean)
  return ["All", ...new Set(all)]
})

const filteredProducts = computed(() => {
  let list = products.value.filter(p =>
    p.title.toLowerCase().includes(search.value.toLowerCase()) &&
    (selectedBrand.value === "All" || p.brand === selectedBrand.value)
  )
  if (sortBy.value === "price-asc")  list = [...list].sort((a, b) => a.price - b.price)
  if (sortBy.value === "price-desc") list = [...list].sort((a, b) => b.price - a.price)
  if (sortBy.value === "rating")     list = [...list].sort((a, b) => b.rating - a.rating)
  if (sortBy.value === "discount")   list = [...list].sort((a, b) => b.discountPercentage - a.discountPercentage)
  return list
})

const cartTotal = computed(() =>
  cart.value.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2)
)

const cartCount = computed(() =>
  cart.value.reduce((s, i) => s + i.quantity, 0)
)

const originalPrice = computed(() => {
  if (!selectedProduct.value) return "0.00"
  const p = selectedProduct.value
  return (p.price / (1 - p.discountPercentage / 100)).toFixed(2)
})

const savings = computed(() =>
  (Number(originalPrice.value) - (selectedProduct.value?.price ?? 0)).toFixed(2)
)

// ─── LIVE COUNTDOWN (ends at midnight) ───────────────────
const countdown = ref({ h: "00", m: "00", s: "00" })
let timer: ReturnType<typeof setInterval>

function updateCountdown() {
  const now      = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  let diff = Math.floor((midnight.getTime() - now.getTime()) / 1000)
  const h  = Math.floor(diff / 3600); diff -= h * 3600
  const m  = Math.floor(diff / 60);   diff -= m * 60
  const s  = diff
  countdown.value = {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  }
}

onMounted(() => { updateCountdown(); timer = setInterval(updateCountdown, 1000) })
onUnmounted(() => clearInterval(timer))

// ─── DARK MODE ────────────────────────────────────────────
const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem("pm_dark")
  if (saved === "true") isDark.value = true
  document.documentElement.classList.toggle("dark", isDark.value)
})

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle("dark", isDark.value)
  localStorage.setItem("pm_dark", String(isDark.value))
}

// ─── ESC KEY ─────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (selectedProduct.value) selectedProduct.value = null
    else if (showCart.value) showCart.value = false
  }
}
onMounted(() => window.addEventListener("keydown", onKeydown))
onUnmounted(() => window.removeEventListener("keydown", onKeydown))
</script>

<template>
  <div class="app-root">

    <!-- ══════════════ HEADER ══════════════ -->
    <header class="app-header">
      <div class="header-inner">
        <!-- Logo -->
        <div class="logo">
          <div class="logo-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" class="logo-svg">
              <rect x="5" y="2" width="14" height="20" rx="3" fill="white" opacity="0.15"/>
              <rect x="7" y="4" width="10" height="14" rx="1.5" fill="white" opacity="0.9"/>
              <circle cx="12" cy="20" r="1" fill="white" opacity="0.7"/>
              <rect x="9" y="7" width="6" height="1" rx="0.5" fill="#c0392b"/>
              <rect x="9" y="9.5" width="4" height="1" rx="0.5" fill="#c0392b" opacity="0.6"/>
            </svg>
          </div>
          <div class="logo-text-wrap">
            <span class="logo-text">Phone<em>Mart</em></span>
            <span class="logo-tagline">Premium Mobile Store</span>
          </div>
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            placeholder="Search phones, brands..."
            class="search-input"
            aria-label="Search products"
          />
          <button class="search-btn">Search</button>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          <!-- Wishlist -->
          <button
            class="action-btn"
            @click="fireToast(`${wishlist.length} item(s) wishlisted`, 'info')"
            :aria-label="`Wishlist (${wishlist.length})`"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="action-label">Wishlist</span>
            <span v-if="wishlist.length > 0" class="wish-badge">{{ wishlist.length }}</span>
          </button>

          <!-- Dark Mode -->
          <button class="action-btn" @click="toggleDark" :aria-label="isDark ? 'Light mode' : 'Dark mode'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="!isDark" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              <circle v-else cx="12" cy="12" r="5"/>
              <template v-if="isDark">
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </template>
            </svg>
            <span class="action-label">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Logout -->
          <button class="action-btn" @click="handleLogout" aria-label="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span class="action-label">Sign Out</span>
          </button>

          <!-- Cart — proper cart icon -->
          <button class="action-btn cart-btn" @click="showCart = true" aria-label="Open cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="action-label">Cart</span>
            <transition name="badge-pop">
              <span v-if="cartCount > 0" class="cart-badge" key="b">{{ cartCount }}</span>
            </transition>
          </button>
        </div>
      </div>

      <!-- Nav — properly distributed -->
      <nav class="header-nav">
        <div class="nav-inner">
          <div class="nav-left">
            <a href="#" class="nav-link active">🔥 Flash Deals</a>
            <a href="#" class="nav-link">📦 New Arrivals</a>
            <a href="#" class="nav-link">⭐ Top Rated</a>
          </div>
          <div class="nav-divider"></div>
          <div class="nav-right">
            <a href="#" class="nav-link">🏷️ Clearance</a>
            <a href="#" class="nav-link">🛡️ Warranty</a>
            <a href="#" class="nav-link">📞 Contact</a>
          </div>
        </div>
      </nav>
    </header>

    <!-- ══════════════ HERO SLIDESHOW ══════════════ -->
    <section class="hero">
      <!-- Slides -->
      <transition-group name="hero-fade" tag="div" class="hero-slides">
        <div
          v-for="(slide, i) in heroSlides"
          :key="i"
          v-show="currentSlide === i"
          class="hero-slide"
        >
          <div
            class="hero-slide-bg"
            :style="`background-image: url('${slide.img}')`"
          ></div>
          <div class="hero-slide-overlay"></div>
        </div>
      </transition-group>

      <!-- Content -->
      <div class="hero-content">
        <div class="hero-badge-pill">⚡ {{ heroSlides[currentSlide].tag }}</div>
        <h1 class="hero-title">{{ heroSlides[currentSlide].title }}</h1>
        <p class="hero-sub">{{ heroSlides[currentSlide].sub }}</p>

        <div class="hero-offer-strip">
          <span class="hero-offer-text">{{ heroSlides[currentSlide].badge }}</span>
          <span class="hero-offer-sep">·</span>
          <span class="hero-offer-ends">Sale ends in:</span>
          <div class="hero-countdown">
            <span class="cd-block">{{ countdown.h }}<small>h</small></span>
            <span class="cd-sep">:</span>
            <span class="cd-block">{{ countdown.m }}<small>m</small></span>
            <span class="cd-sep">:</span>
            <span class="cd-block">{{ countdown.s }}<small>s</small></span>
          </div>
        </div>

        <div class="hero-btns">
          <button
            class="hero-cta"
            @click="(document.querySelector('.products-section') as HTMLElement)?.scrollIntoView({ behavior: 'smooth' })"
          >
            Shop Now →
          </button>
          <button class="hero-cta-ghost">View Deals</button>
        </div>
      </div>

      <!-- Slide dots -->
      <div class="hero-dots">
        <button
          v-for="(_, i) in heroSlides"
          :key="i"
          class="hero-dot"
          :class="{ active: currentSlide === i }"
          @click="goToSlide(i)"
          :aria-label="`Slide ${i + 1}`"
        ></button>
      </div>

      <!-- Prev/Next arrows -->
      <button class="hero-arrow hero-prev" @click="goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="hero-arrow hero-next" @click="goToSlide((currentSlide + 1) % heroSlides.length)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </section>

    <!-- ══════════════ TRUST STRIP ══════════════ -->
    <div class="trust-strip">
      <div class="trust-item">🚚 Free Shipping over $49</div>
      <div class="trust-divider"></div>
      <div class="trust-item">🔄 30-Day Returns</div>
      <div class="trust-divider"></div>
      <div class="trust-item">🔒 Secure Checkout</div>
      <div class="trust-divider"></div>
      <div class="trust-item">🎧 24/7 Support</div>
    </div>

    <!-- ══════════════ FILTER + SORT BAR ══════════════ -->
    <div class="filter-bar">
      <span class="filter-label">Brands:</span>
      <div class="filter-chips">
        <button
          v-for="b in brands" :key="b"
          class="chip" :class="{ 'chip-active': selectedBrand === b }"
          @click="selectedBrand = b"
        >{{ b }}</button>
      </div>

      <div class="sort-wrap">
        <label class="filter-label" for="sort-select">Sort:</label>
        <select id="sort-select" v-model="sortBy" class="sort-select">
          <option value="default">Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>
    </div>

    <!-- ══════════════ PRODUCT GRID ══════════════ -->
    <main class="products-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-accent">🔥</span>
          {{ selectedBrand === "All" ? "All Smartphones" : selectedBrand }}
        </h2>
        <span class="section-count">{{ filteredProducts.length }} products</span>
      </div>

      <div v-if="loading" class="product-grid">
        <div v-for="n in 10" :key="n" class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w80"></div>
            <div class="skeleton-line w60"></div>
            <div class="skeleton-line w40"></div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <span>😔</span>
        <p>No products found for "{{ search }}"</p>
        <button class="empty-reset" @click="search = ''; selectedBrand = 'All'">Reset filters</button>
      </div>

      <div class="product-grid" v-else>
        <ProductCard
          v-for="p in filteredProducts"
          :key="p.id"
          :product="p"
          :wishlisted="isWishlisted(p.id)"
          @select="selectedProduct = p"
          @wishlist="toggleWishlist(p.id)"
          @add-to-cart="handleAddToCart(p)"
        />
      </div>
    </main>

    <!-- ══════════════ OVERLAY ══════════════ -->
    <transition name="fade-overlay">
      <div
        v-if="selectedProduct || showCart"
        class="overlay"
        @click="selectedProduct = null; showCart = false"
        aria-hidden="true"
      ></div>
    </transition>

    <!-- ══════════════ PRODUCT DETAIL DRAWER ══════════════ -->
    <transition name="slide-right">
      <div
        v-if="selectedProduct"
        class="detail-drawer"
        role="dialog" aria-modal="true"
        :aria-label="selectedProduct.title"
      >
        <button class="drawer-close" @click="selectedProduct = null" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="detail-img-wrap">
          <img :src="selectedProduct.thumbnail" :alt="selectedProduct.title" class="detail-img" />
          <span class="detail-discount-badge">-{{ selectedProduct.discountPercentage.toFixed(0) }}%</span>
          <button
            class="detail-wish-btn"
            :class="{ active: isWishlisted(selectedProduct.id) }"
            @click="toggleWishlist(selectedProduct.id)"
          >{{ isWishlisted(selectedProduct.id) ? "♥" : "♡" }}</button>
        </div>

        <div class="detail-body">
          <span class="detail-brand">{{ selectedProduct.brand }}</span>
          <h2 class="detail-title">{{ selectedProduct.title }}</h2>

          <div class="detail-rating">
            <span v-for="i in 5" :key="i" class="detail-star" :class="i <= Math.round(selectedProduct.rating) ? 'filled' : ''">★</span>
            <span class="detail-rating-val">{{ selectedProduct.rating.toFixed(1) }}</span>
            <span class="detail-reviews">(284 reviews)</span>
          </div>

          <div class="detail-price-block">
            <span class="detail-price">${{ selectedProduct.price.toFixed(2) }}</span>
            <span class="detail-original">${{ originalPrice }}</span>
            <span class="detail-saving">Save ${{ savings }}</span>
          </div>

          <p class="detail-desc">{{ selectedProduct.description }}</p>

          <div class="detail-stock">
            <span class="stock-dot"></span>
            <span class="stock-text">In Stock — {{ selectedProduct.stock ?? 30 }} units left</span>
          </div>

          <div class="detail-qty-row">
            <span class="qty-label">Qty:</span>
            <div class="qty-control">
              <button class="qty-btn" @click="detailQty > 1 && detailQty--">−</button>
              <span class="qty-val">{{ detailQty }}</span>
              <button class="qty-btn" @click="detailQty++">+</button>
            </div>
          </div>

          <div class="detail-tags">
            <span class="dtag">✅ In Stock</span>
            <span class="dtag">🚚 Free Shipping</span>
            <span class="dtag">🔒 Buyer Protection</span>
          </div>

          <div class="detail-actions">
            <button class="btn-cart" @click="handleAddToCart()">🛒 Add to Cart</button>
            <button class="btn-buy"  @click="handleBuyNow()">⚡ Buy Now</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════════ CART DRAWER ══════════════ -->
    <transition name="slide-right">
      <div
        v-if="showCart"
        class="cart-drawer"
        role="dialog" aria-modal="true" aria-label="Shopping cart"
      >
        <div class="cart-header">
          <h2 class="cart-title">🛒 My Cart <span class="cart-title-count">({{ cartCount }})</span></h2>
          <div class="cart-header-actions">
            <button v-if="cart.length > 0" class="cart-clear-btn" @click="clearCart">Clear all</button>
            <button class="drawer-close static" @click="showCart = false" aria-label="Close cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cart-body">
          <div v-if="cart.length === 0" class="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
            <button class="empty-reset" @click="showCart = false">Browse Products</button>
          </div>

          <transition-group name="cart-item-anim" tag="div" class="cart-items-list">
            <div v-for="item in cart" :key="item.product.id" class="cart-item">
              <img :src="item.product.thumbnail" class="cart-item-img" :alt="item.product.title" />
              <div class="cart-item-info">
                <p class="cart-item-title">{{ item.product.title }}</p>
                <p class="cart-item-price">${{ (item.product.price * item.quantity).toFixed(2) }}</p>
                <div class="cart-qty-control">
                  <button class="cqty-btn" @click="decrementQty(item.product.id)">−</button>
                  <span class="cqty-val">{{ item.quantity }}</span>
                  <button class="cqty-btn" @click="incrementQty(item.product.id)">+</button>
                </div>
              </div>
              <button class="cart-item-remove" @click="removeFromCart(item.product.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </transition-group>
        </div>

        <div v-if="cart.length > 0" class="cart-footer">
          <div class="cart-subtotals">
            <div class="subtotal-row">
              <span>Subtotal ({{ cartCount }} items)</span>
              <span>${{ cartTotal }}</span>
            </div>
            <div class="subtotal-row">
              <span>Shipping</span>
              <span class="free-tag">FREE</span>
            </div>
            <div class="subtotal-row bold">
              <span>Total</span>
              <span class="cart-total-val">${{ cartTotal }}</span>
            </div>
          </div>
          <button class="btn-checkout" @click="fireToast('Checkout coming soon! 🚀', 'info')">
            Proceed to Checkout →
          </button>
          <button class="btn-continue" @click="showCart = false">← Continue Shopping</button>
        </div>
      </div>
    </transition>

    <!-- ══════════════ TOAST ══════════════ -->
    <transition name="toast-pop">
      <div v-if="showToast" class="toast" :class="`toast-${toastType}`" role="status" aria-live="polite">
        <span class="toast-icon">{{ toastType === "success" ? "✅" : toastType === "warn" ? "⚠️" : "ℹ️" }}</span>
        <span class="toast-msg">{{ toastMsg }}</span>
      </div>
    </transition>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Urbanist:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
/* Fallback: Syne + DM Sans still imported by ProductCard */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Refined palette – deep crimson instead of pure red */
  --primary:    #c0392b;
  --primary-dk: #922b21;
  --primary-lt: #e74c3c;
  --primary-bg: #fdf2f0;
  --gold:       #f39c12;
  --gold-lt:    #f7c863;
  --green:      #27ae60;
  --bg:         #f5f5f7;
  --white:      #ffffff;
  --text:       #1c1c1e;
  --text-2:     #3a3a3c;
  --muted:      #8e8e93;
  --border:     #e5e5ea;
  /* Header uses a very dark charcoal so it reads as premium, not garish */
  --header-bg:  #1c1c1e;
  --header-nav: #2c2c2e;
}

body { background: var(--bg); font-family: 'Urbanist', 'DM Sans', sans-serif; color: var(--text); }
.app-root { min-height: 100vh; }

/* ── HEADER ── */
.app-header {
  background: var(--header-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0,0,0,.4);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

/* ── LOGO ── */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  text-decoration: none;
}

.logo-icon-wrap {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--primary-lt));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(192,57,43,.5);
  flex-shrink: 0;
}

.logo-svg { width: 22px; height: 22px; }

.logo-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -.03em;
  white-space: nowrap;
}

.logo-text em {
  font-style: normal;
  color: var(--gold-lt);
}

.logo-tagline {
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(255,255,255,.4);
  margin-top: 1px;
}

/* ── SEARCH ── */
.search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #2c2c2e;
  border: 1.5px solid #3a3a3c;
  border-radius: 8px;
  overflow: hidden;
  max-width: 580px;
  transition: border-color .2s;
}

.search-wrap:focus-within {
  border-color: var(--primary-lt);
}

.search-icon { width: 16px; height: 16px; margin: 0 10px; color: var(--muted); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Urbanist', sans-serif;
  font-size: 14px;
  padding: 10px 0;
  color: #fff;
  background: transparent;
}

.search-input::placeholder { color: var(--muted); }

.search-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 0 20px;
  height: 42px;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .06em;
  cursor: pointer;
  transition: background .2s;
  flex-shrink: 0;
}

.search-btn:hover { background: var(--primary-lt); }

/* ── ACTIONS ── */
.header-actions { display: flex; gap: 4px; flex-shrink: 0; }

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,.7);
  cursor: pointer;
  font-family: 'Urbanist', sans-serif;
  position: relative;
  transition: color .2s, background .2s;
  padding: 6px 10px;
  border-radius: 8px;
}

.action-btn:hover { color: #fff; background: rgba(255,255,255,.08); }
.action-btn svg { width: 20px; height: 20px; }
.action-label { font-size: 10px; font-weight: 600; letter-spacing: .02em; }

.cart-badge, .wish-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  background: var(--primary);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  min-width: 17px;
  height: 17px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--header-bg);
}

.wish-badge { background: #e74c3c; }

/* ── NAV ── */
.header-nav {
  background: var(--header-nav);
  border-top: 1px solid rgba(255,255,255,.06);
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.nav-left, .nav-right { display: flex; align-items: center; }
.nav-left { flex: 1; }
.nav-right { flex: 1; justify-content: flex-end; }

.nav-divider {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,.1);
  flex-shrink: 0;
}

.nav-link {
  color: rgba(255,255,255,.65);
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 600;
  padding: 9px 18px;
  white-space: nowrap;
  transition: background .15s, color .15s;
  border-bottom: 2px solid transparent;
  letter-spacing: .01em;
}

.nav-link:hover { color: #fff; background: rgba(255,255,255,.05); }
.nav-link.active { color: #fff; border-bottom-color: var(--primary-lt); }

/* ══════════ HERO SLIDESHOW ══════════ */
.hero {
  position: relative;
  height: 480px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-slides {
  position: absolute;
  inset: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
}

.hero-slide-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 30%;
  transition: transform 8s ease;
  animation: hero-zoom 8s ease forwards;
}

@keyframes hero-zoom {
  from { transform: scale(1.08); }
  to   { transform: scale(1); }
}

.hero-slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(10,5,5,.82) 0%,
    rgba(10,5,5,.65) 40%,
    rgba(10,5,5,.2) 70%,
    transparent 100%
  );
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 10;
  max-width: 560px;
  padding: 0 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(192,57,43,.25);
  border: 1px solid rgba(231,76,60,.5);
  color: #ff8a7a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  width: fit-content;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(38px, 5.5vw, 64px);
  font-weight: 800;
  color: #fff;
  line-height: 1.02;
  letter-spacing: -.04em;
  white-space: pre-line;
  text-shadow: 0 2px 20px rgba(0,0,0,.5);
}

.hero-sub {
  font-size: 15px;
  color: rgba(255,255,255,.7);
  font-weight: 400;
  letter-spacing: .01em;
}

.hero-offer-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 8px 16px;
  width: fit-content;
  flex-wrap: wrap;
}

.hero-offer-text {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--gold-lt);
}

.hero-offer-sep { color: rgba(255,255,255,.3); }
.hero-offer-ends { font-size: 12px; color: rgba(255,255,255,.6); font-weight: 500; }

.hero-countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  color: #fff;
  font-size: 15px;
}

.cd-block small {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,.55);
  margin-left: 1px;
}

.cd-sep { color: rgba(255,255,255,.4); }

.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }

.hero-cta {
  background: linear-gradient(135deg, var(--primary), var(--primary-lt));
  color: #fff;
  border: none;
  padding: 13px 30px;
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(192,57,43,.5);
  transition: transform .2s, box-shadow .2s;
}

.hero-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(192,57,43,.6); }

.hero-cta-ghost {
  background: rgba(255,255,255,.1);
  color: rgba(255,255,255,.85);
  border: 1.5px solid rgba(255,255,255,.25);
  padding: 13px 24px;
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background .2s, border-color .2s;
}

.hero-cta-ghost:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.4); }

/* Dots */
.hero-dots {
  position: absolute;
  bottom: 22px;
  left: 60px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.hero-dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  border: none;
  background: rgba(255,255,255,.3);
  cursor: pointer;
  transition: background .3s, width .3s;
  padding: 0;
}

.hero-dot.active { background: #fff; width: 44px; }

/* Arrows */
.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,.25);
  background: rgba(0,0,0,.4);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s, border-color .2s;
  opacity: 0;
}

.hero:hover .hero-arrow { opacity: 1; }
.hero-arrow:hover { background: rgba(192,57,43,.7); border-color: var(--primary-lt); }
.hero-arrow svg { width: 18px; height: 18px; }
.hero-prev { left: 16px; }
.hero-next { right: 16px; }

/* Slide transition */
.hero-fade-enter-active,
.hero-fade-leave-active { transition: opacity .7s ease; }
.hero-fade-enter-from,
.hero-fade-leave-to { opacity: 0; }

/* ── TRUST ── */
.trust-strip {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}

.trust-item { font-size: 12px; font-weight: 600; color: var(--text-2); white-space: nowrap; padding: 0 24px; }
.trust-divider { width: 1px; height: 18px; background: var(--border); flex-shrink: 0; }

/* ── FILTER BAR ── */
.filter-bar {
  background: #fff;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-wrap: wrap;
}

.filter-label { font-size: 11.5px; font-weight: 700; color: var(--muted); letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
.filter-chips { display: flex; gap: 8px; flex-wrap: nowrap; }

.chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-family: 'Urbanist', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  white-space: nowrap;
  transition: all .18s;
}

.chip:hover { border-color: var(--primary); color: var(--primary); }
.chip-active { background: var(--primary); border-color: var(--primary); color: #fff !important; box-shadow: 0 2px 8px rgba(192,57,43,.3); }

.sort-wrap { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }

.sort-select {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 5px 10px;
  font-family: 'Urbanist', sans-serif;
  font-size: 12.5px;
  color: var(--text);
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color .18s;
}

.sort-select:focus { border-color: var(--primary); }

/* ── PRODUCTS ── */
.products-section { max-width: 1400px; margin: 0 auto; padding: 24px 20px 48px; }

.section-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 18px; }
.section-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 6px; }
.section-count { font-size: 12.5px; color: var(--muted); font-weight: 500; }

.product-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
@media (min-width:600px)  { .product-grid { grid-template-columns: repeat(3,1fr); } }
@media (min-width:900px)  { .product-grid { grid-template-columns: repeat(4,1fr); } }
@media (min-width:1200px) { .product-grid { grid-template-columns: repeat(5,1fr); } }

/* Skeleton */
.skeleton-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border); }
.skeleton-img { width: 100%; height: 170px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer-load 1.4s infinite; }
.skeleton-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.skeleton-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer-load 1.4s infinite; }
.w80{width:80%} .w60{width:60%} .w40{width:40%}
@keyframes shimmer-load { to { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 60px 0; font-size: 15px; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-state span { font-size: 48px; }
.empty-reset { margin-top: 4px; padding: 8px 20px; border-radius: 20px; border: 1.5px solid var(--primary); color: var(--primary); background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .18s; }
.empty-reset:hover { background: var(--primary); color: #fff; }

/* ── OVERLAY ── */
.overlay { position: fixed; inset: 0; background: rgba(10,0,5,.55); backdrop-filter: blur(3px); z-index: 200; }

/* ── DETAIL DRAWER ── */
.detail-drawer { position: fixed; right: 0; top: 0; width: min(440px,100vw); height: 100%; background: var(--white); z-index: 300; overflow-y: auto; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,.18); }
.drawer-close { position: absolute; top: 14px; right: 14px; z-index: 10; width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.12); transition: background .2s; color: var(--text); }
.drawer-close.static { position: static; box-shadow: none; background: transparent; }
.drawer-close:hover { background: #f0f0f0; }
.drawer-close svg { width: 16px; height: 16px; }
.detail-img-wrap { position: relative; width: 100%; height: 280px; background: #f4f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.detail-img { width: 100%; height: 100%; object-fit: contain; padding: 16px; }
.detail-discount-badge { position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg,var(--primary),var(--primary-lt)); color: #fff; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; box-shadow: 0 3px 10px rgba(192,57,43,.4); }
.detail-wish-btn { position: absolute; bottom: 12px; right: 12px; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.9); backdrop-filter: blur(6px); border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .2s, color .2s; color: #ccc; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.detail-wish-btn.active { color: var(--primary); }
.detail-wish-btn:hover { transform: scale(1.15); }
.detail-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.detail-brand { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--primary); }
.detail-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.3; color: var(--text); }
.detail-rating { display: flex; align-items: center; gap: 4px; }
.detail-star { font-size: 14px; color: #ddd; }
.detail-star.filled { color: var(--gold); }
.detail-rating-val { font-size: 13px; font-weight: 600; color: var(--text); }
.detail-reviews { font-size: 12px; color: var(--muted); }
.detail-price-block { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.detail-price { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--primary); letter-spacing: -.03em; }
.detail-original { font-size: 14px; color: var(--muted); text-decoration: line-through; }
.detail-saving { font-size: 12px; font-weight: 600; background: var(--primary-bg); color: var(--primary); padding: 2px 8px; border-radius: 4px; }
.detail-stock { display: flex; align-items: center; gap: 7px; }
.stock-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(39,174,96,.2); flex-shrink: 0; animation: pulse-green 2s ease-in-out infinite; }
@keyframes pulse-green { 0%,100%{box-shadow:0 0 0 3px rgba(39,174,96,.2)} 50%{box-shadow:0 0 0 6px rgba(39,174,96,.08)} }
.stock-text { font-size: 12px; color: var(--green); font-weight: 600; }
.detail-qty-row { display: flex; align-items: center; gap: 12px; }
.qty-label { font-size: 13px; font-weight: 600; color: #555; }
.qty-control { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden; }
.qty-btn { width: 32px; height: 32px; border: none; background: #f4f4f6; font-size: 18px; cursor: pointer; color: var(--text); transition: background .15s; display: flex; align-items: center; justify-content: center; }
.qty-btn:hover { background: #e8e8e8; }
.qty-val { min-width: 36px; text-align: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); }
.detail-desc { font-size: 13.5px; color: #555; line-height: 1.55; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.dtag { font-size: 11.5px; font-weight: 500; background: #f4f4f6; color: #444; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border); }
.detail-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.btn-cart { width: 100%; padding: 13px; background: #fff; color: var(--primary); border: 2px solid var(--primary); border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; }
.btn-cart:hover { background: var(--primary); color: #fff; }
.btn-buy { width: 100%; padding: 13px; background: linear-gradient(135deg,var(--primary),var(--primary-lt)); color: #fff; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(192,57,43,.35); transition: opacity .2s,transform .2s; }
.btn-buy:hover { opacity: .9; transform: translateY(-1px); }

/* ── CART DRAWER ── */
.cart-drawer { position: fixed; right: 0; top: 0; width: min(380px,100vw); height: 100%; background: var(--white); z-index: 300; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,.14); }
.cart-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.cart-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
.cart-title-count { color: var(--muted); font-weight: 400; }
.cart-header-actions { display: flex; align-items: center; gap: 8px; }
.cart-clear-btn { font-size: 11px; color: var(--muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; cursor: pointer; transition: all .18s; }
.cart-clear-btn:hover { color: var(--primary); border-color: var(--primary); }
.cart-body { flex: 1; overflow-y: auto; padding: 14px; }
.cart-items-list { display: flex; flex-direction: column; gap: 10px; }
.cart-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--muted); font-size: 14px; padding: 40px 0; }
.cart-empty span { font-size: 44px; }
.cart-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #fafafa; border-radius: 10px; border: 1px solid var(--border); }
.cart-item-img { width: 54px; height: 54px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-title { font-size: 12.5px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-item-price { font-size: 13px; color: var(--primary); font-weight: 700; margin: 2px 0 5px; }
.cart-qty-control { display: inline-flex; align-items: center; border: 1.5px solid var(--border); border-radius: 6px; overflow: hidden; }
.cqty-btn { width: 26px; height: 26px; border: none; background: #f4f4f6; font-size: 16px; cursor: pointer; color: var(--text); transition: background .15s; display: flex; align-items: center; justify-content: center; }
.cqty-btn:hover { background: #e0e0e0; }
.cqty-val { min-width: 28px; text-align: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; }
.cart-item-remove { background: none; border: none; color: #ccc; cursor: pointer; padding: 4px; transition: color .2s; flex-shrink: 0; border-radius: 4px; }
.cart-item-remove:hover { color: var(--primary); background: var(--primary-bg); }
.cart-footer { padding: 16px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
.cart-subtotals { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
.subtotal-row { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: var(--muted); }
.subtotal-row.bold { font-size: 13.5px; color: var(--text); font-weight: 600; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 2px; }
.free-tag { color: var(--green); font-weight: 700; font-size: 12px; }
.cart-total-val { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--primary); }
.btn-checkout { width: 100%; padding: 13px; background: linear-gradient(135deg,var(--primary),var(--primary-lt)); color: #fff; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(192,57,43,.3); transition: opacity .2s; }
.btn-checkout:hover { opacity: .9; }
.btn-continue { width: 100%; padding: 11px; background: transparent; color: var(--muted); border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: border-color .2s, color .2s; }
.btn-continue:hover { border-color: var(--primary); color: var(--primary); }

/* ── TOAST ── */
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 500; background: #1c1c1e; color: #fff; display: flex; align-items: center; gap: 10px; padding: 12px 22px; border-radius: 50px; font-size: 13px; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,.25); white-space: nowrap; max-width: 90vw; overflow: hidden; text-overflow: ellipsis; border-left: 4px solid transparent; }
.toast-success { border-left-color: var(--green); }
.toast-info    { border-left-color: #3498db; }
.toast-warn    { border-left-color: var(--gold); }
.toast-icon { font-size: 16px; flex-shrink: 0; }

/* ── TRANSITIONS ── */
.fade-overlay-enter-active,.fade-overlay-leave-active { transition: opacity .25s; }
.fade-overlay-enter-from,.fade-overlay-leave-to { opacity: 0; }
.slide-right-enter-active,.slide-right-leave-active { transition: transform .32s cubic-bezier(.4,0,.2,1); }
.slide-right-enter-from,.slide-right-leave-to { transform: translateX(100%); }
.toast-pop-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.toast-pop-leave-active { transition: all .25s ease; }
.toast-pop-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(.85); }
.toast-pop-leave-to   { opacity: 0; transform: translateX(-50%) translateY(12px); }
.badge-pop-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.badge-pop-enter-from { opacity: 0; transform: scale(0); }
.cart-item-anim-enter-active { transition: all .25s ease; }
.cart-item-anim-leave-active { transition: all .2s ease; }
.cart-item-anim-enter-from { opacity: 0; transform: translateX(20px); }
.cart-item-anim-leave-to   { opacity: 0; transform: translateX(20px); }

/* ── DARK MODE ── */
html.dark {
  --bg:        #0a0a0c;
  --white:     #161618;
  --text:      #f2f2f7;
  --text-2:    #d1d1d6;
  --muted:     #98989f;
  --border:    #2c2c2e;
  --primary-bg: #2a0f0c;
  --header-bg:  #000000;
  --header-nav: #111113;
}

html.dark body { background: var(--bg); }
html.dark .trust-strip,
html.dark .filter-bar  { background: #161618; border-color: var(--border); }
html.dark .search-wrap { background: #1c1c1e; border-color: #3a3a3c; }
html.dark .search-input { color: var(--text); }
html.dark .chip { background: #1c1c1e; color: #bbb; border-color: var(--border); }
html.dark .sort-select { background: #1c1c1e; color: var(--text); border-color: var(--border); }
html.dark .skeleton-card { background: #161618; border-color: var(--border); }
html.dark .skeleton-img,
html.dark .skeleton-line { background: linear-gradient(90deg,#222224 25%,#2e2e30 50%,#222224 75%); background-size: 200% 100%; }
html.dark .detail-drawer,
html.dark .cart-drawer  { background: #161618; }
html.dark .cart-item     { background: #1e1e20; border-color: var(--border); }
html.dark .cart-header,
html.dark .cart-footer   { border-color: var(--border); }
html.dark .cqty-btn,
html.dark .qty-btn       { background: #2c2c2e; color: var(--text); }
html.dark .qty-control,
html.dark .cart-qty-control { border-color: var(--border); }
html.dark .dtag          { background: #1e1e20; color: #bbb; border-color: var(--border); }
html.dark .btn-cart      { background: transparent; }
html.dark .detail-img-wrap { background: #1e1e20; }
html.dark .subtotal-row.bold { border-color: var(--border); }
html.dark .trust-item    { color: var(--text-2); }
</style>