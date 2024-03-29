<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeaderComponent from './components/HeaderComponent.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <HeaderComponent />
    </div>
  </header>
    <RouterView />
</template>
