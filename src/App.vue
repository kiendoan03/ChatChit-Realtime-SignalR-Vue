<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeaderComponent from './components/HeaderComponent.vue'
import LoginView from './views/LoginView.vue'
</script>

<template >
          <header v-if="auth">
            <div class="wrapper">
              <HeaderComponent />
            </div>
          </header>
          <div v-if="auth">
            <RouterView />
          </div>
          <div class="login" v-else>
            <LoginView />
          </div>
</template>


<script>
  export default {
    data() {
      return {
        auth : false
      };
    },
    mounted() {
      this.checkAuth()
    },  
      methods: {
        checkAuth() {
          if (localStorage.getItem('token') != null) {
            this.auth = true
          }
        }
      },
  }
</script>
<style>
  .login {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
</style>
