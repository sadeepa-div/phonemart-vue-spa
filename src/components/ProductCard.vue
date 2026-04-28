<script setup lang="ts">
defineProps<{
  product: {
    id: number
    title: string
    price: number
    thumbnail: string
    rating: number
    discountPercentage: number
    brand?: string
  }
}>()

const emit = defineEmits(["select"])
</script>

<template>
  <div class="pc-card" @click="emit('select', product)">
    <!-- Discount Badge -->
    <div class="pc-badge">
      -{{ product.discountPercentage.toFixed(0) }}%
    </div>

    <!-- Wishlist -->
    <button class="pc-wish" @click.stop>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>

    <!-- Image -->
    <div class="pc-img-wrap">
      <img :src="product.thumbnail" :alt="product.title" class="pc-img" />
      <div class="pc-img-overlay">
        <span class="pc-quick-view">Quick View</span>
      </div>
    </div>

    <!-- Body -->
    <div class="pc-body">
      <!-- Brand -->
      <span v-if="product.brand" class="pc-brand">{{ product.brand }}</span>

      <!-- Title -->
      <h2 class="pc-title">{{ product.title }}</h2>

      <!-- Rating -->
      <div class="pc-rating">
        <div class="pc-stars">
          <span
            v-for="i in 5"
            :key="i"
            class="pc-star"
            :class="i <= Math.round(product.rating) ? 'filled' : ''"
          >★</span>
        </div>
        <span class="pc-rating-num">{{ product.rating.toFixed(1) }}</span>
      </div>

      <!-- Price Row -->
      <div class="pc-price-row">
        <span class="pc-price">${{ product.price.toFixed(2) }}</span>
        <span class="pc-original">
          ${{ (product.price / (1 - product.discountPercentage / 100)).toFixed(2) }}
        </span>
      </div>

      <!-- CTA -->
      <button class="pc-cta" @click.stop="emit('select', product)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="pc-cta-icon">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Add to Cart
      </button>
    </div>

    <!-- Flash sale shimmer line -->
    <div class="pc-shimmer"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.pc-card {
  font-family: 'DM Sans', sans-serif;
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease;
  display: flex;
  flex-direction: column;
  border: 1.5px solid #f0f0f0;
}

.pc-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 16px 40px rgba(200,0,30,0.13), 0 4px 12px rgba(0,0,0,0.08);
  border-color: #e8002d22;
}

/* Discount badge */
.pc-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  background: linear-gradient(135deg, #e8002d, #ff4d6d);
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(232,0,45,0.35);
}

/* Wishlist */
.pc-wish {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(6px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.2s, transform 0.2s, color 0.2s;
  color: #bbb;
}

.pc-wish svg { width: 15px; height: 15px; }

.pc-card:hover .pc-wish {
  opacity: 1;
  transform: scale(1);
}

.pc-wish:hover {
  color: #e8002d;
  background: #fff;
}

/* Image */
.pc-img-wrap {
  position: relative;
  width: 100%;
  height: 200px;           /* ← taller box */
  overflow: hidden;
  background: #f7f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-img {
  width: 100%;
  height: 100%;
  object-fit: contain;     /* ← shows full image, no cropping */
  padding: 10px;           /* ← small breathing room */
  transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94);
}

.pc-card:hover .pc-img {
  transform: scale(1.07);
}

.pc-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
  opacity: 0;
  transition: opacity 0.25s;
}

.pc-card:hover .pc-img-overlay { opacity: 1; }

.pc-quick-view {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.3);
  padding: 4px 12px;
  border-radius: 20px;
}

/* Body */
.pc-body {
  padding: 11px 12px 13px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.pc-brand {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e8002d;
}

.pc-title {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Rating */
.pc-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pc-stars { display: flex; gap: 1px; }

.pc-star {
  font-size: 11px;
  color: #ddd;
  line-height: 1;
}

.pc-star.filled { color: #ffa800; }

.pc-rating-num {
  font-size: 11px;
  color: #888;
  font-weight: 500;
}

/* Price */
.pc-price-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.pc-price {
  font-family: 'Syne', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: #e8002d;
  letter-spacing: -0.02em;
}

.pc-original {
  font-size: 11.5px;
  color: #bbb;
  text-decoration: line-through;
}

/* CTA */
.pc-cta {
  margin-top: 6px;
  width: 100%;
  padding: 8px 0;
  background: linear-gradient(135deg, #e8002d 0%, #ff4060 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.02em;
  transition: opacity 0.18s, transform 0.18s;
  box-shadow: 0 3px 10px rgba(232,0,45,0.3);
}

.pc-cta:hover {
  opacity: 0.9;
  transform: scale(0.98);
}

.pc-cta-icon { width: 14px; height: 14px; }

/* Shimmer */
.pc-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%);
  background-size: 200% 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.pc-card:hover .pc-shimmer {
  opacity: 1;
  animation: shimmer 0.7s ease forwards;
}

@keyframes shimmer {
  0%   { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
</style>