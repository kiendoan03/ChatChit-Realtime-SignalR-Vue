<script setup>
    import { QLayout, QHeader, QToolbar, QBtn, QSpace, QPageContainer, QPage, QIcon } from 'quasar'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas)

</script>

<template>
    <div class="q-pa-md bg-dark" >
      <q-layout view="lHh lpr lFf" container style="height: 45.5vmax;" class="shadow-2 rounded-borders">
        <q-header elevated class="bg-dark">
          <q-toolbar>
            <img src="../assets/images/images-removebg-preview.png" style="width: 10%;" alt="">
            <q-toolbar-title>
              <strong>O2 Tech</strong>
            </q-toolbar-title>
          </q-toolbar>
        </q-header>
  
        <q-page-container>
          <q-page class="q-pa-md">
              <q-scroll-area style="height: 38vmax; max-width: 30vmax;">
                <nav class="route ">
                    <RouterLink to="/"  ><img src="../assets/images/lobby.png" style="border-radius: 50%;object-fit: cover; overflow: hidden;height: 2.8vmax; width: 2.8vmax;"> Lobby</RouterLink>
                    <RouterLink to="/chat" >Chat</RouterLink>
                </nav>
              </q-scroll-area>
          </q-page>
        </q-page-container>
        <q-footer elevated class="bg-dark text-white">
          <q-toolbar>
            <q-space />
            <div class="cursor-pointer" @click="logout">
              <font-awesome-icon :icon="['fas', 'right-from-bracket']" size="xl" />
            </div>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </div>
  </template>
  
<script>
  export default {
    name: 'HeaderComponent',
    methods: {
      logout() {
        localStorage.clear();
        this.$router.push('/');
        this.$router.go();
      }
    }
  }         
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}
nav {
  width: 100%;
  font-size: 1.5em;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text-active); 
  background-color: var(--color-active); 
  border-radius: 0.2rem;
  
}

nav a:not(router-link-exact-active){
  color: var(--color-text); 
}
nav a:not(router-link-exact-active):hover{
  background-color: var(--color-hover-active);
  border-radius: 0.2rem;
}

nav a {
  text-decoration: none ;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  height: 2.5em;
  display: flex; align-items: center;
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    /* place-items: center; */
    padding-right: calc(var(--section-gap) / 2);
  }
 

  /* .logo {
    margin: 0 2rem 0 0;
  } */

  /* header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  } */

  /* nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  } */
}
</style>
