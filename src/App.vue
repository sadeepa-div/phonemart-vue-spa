<script setup lang="ts">
import { ref, onMounted } from "vue"

interface Product {
  id: number
  title: string
  price: number
  thumbnail: string
}

const products = ref<Product[]>([])

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

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white p-4 rounded-xl shadow"
      >
        <img :src="product.thumbnail" class="w-full h-40 object-cover rounded" />

        <h2 class="mt-2 font-semibold">
          {{ product.title }}
        </h2>

        <p class="text-blue-600 font-bold">
          ${{ product.price }}
        </p>
      </div>
    </div>
  </main>
</template>