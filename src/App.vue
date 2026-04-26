<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import ProductCard from "./components/ProductCard.vue"

interface Product {
  id: number
  title: string
  price: number
  thumbnail: string
}

const products = ref<Product[]>([])
const search = ref("")
const filteredProducts = computed(() => {
  return products.value.filter((p) =>
    p.title.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  const res = await fetch("https://dummyjson.com/products/category/smartphones")
  const data = await res.json()
  products.value = data.products
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

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :title="product.title"
        :price="product.price"
        :thumbnail="product.thumbnail"
      />
    </div>
  </main>
</template>