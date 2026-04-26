<script setup lang="ts">
defineProps<{
  title: string
  price: number
  thumbnail: string
}>()
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow">
    <img :src="thumbnail" class="w-full h-40 object-cover rounded" />

    <h2 class="mt-2 font-semibold">
      {{ title }}
    </h2>

    <p class="text-blue-600 font-bold">
      ${{ price }}
    </p>
  </div>
</template>