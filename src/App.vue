<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import ProductCard from "./components/ProductCard.vue"

interface Product {
  id: number
  title: string
  price: number
  thumbnail: string
  description: string
  brand: string
}


const products = ref<Product[]>([])
const search = ref("")
const selectedProduct = ref<Product | null>(null)

const filteredProducts = computed(() => {
  return products.value.filter((p) =>
    p.title.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  try {
    const res = await fetch("https://dummyjson.com/products/category/smartphones")
    const data = await res.json()
    products.value = data.products
  } catch (error) {
    console.error("Failed to load products:", error)
  }
})
</script>

<template>
  <main class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-4xl font-bold text-center text-blue-600 mb-8">
      PhoneMart
    </h1>

    <input
      v-model="search"
      type="text"
      placeholder="Search smartphones..."
      class="w-full mb-6 p-3 border rounded-lg"
    />
    

    <!-- PRODUCT GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :title="product.title"
        :price="product.price"
        :thumbnail="product.thumbnail"
        @select="selectedProduct = product"
      />
    </div>

    <!-- MODAL -->
    <div
      v-if="selectedProduct"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-xl w-96">
        <h2 class="text-xl font-bold mb-2">
          {{ selectedProduct.title }}
        </h2>

        <img
          :src="selectedProduct.thumbnail"
          class="w-full h-40 object-cover rounded"
        />

        <p class="mt-2 text-blue-600 font-bold">
          ${{ selectedProduct.price }}
        </p>
        <p class="mt-2 text-blue-600 font-bold">
  ${{ selectedProduct.price }}
</p>

<!-- 🔥 ADD THESE 2 LINES RIGHT HERE -->
<p class="mt-2 text-gray-600">
  {{ selectedProduct.description }}
</p>

<p class="mt-2 text-sm text-gray-500">
  Brand: {{ selectedProduct.brand }}
</p>

        <button
          @click="selectedProduct = null"
          class="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  </main>
</template>