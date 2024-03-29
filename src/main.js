import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar } from 'quasar'
import axios from 'axios'
import VueAxios from 'vue-axios'
// import quasarUserOptions from './quasar-user-options'
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
const app = createApp(App)

app.use(router)
app.use(Quasar)
app.use(VueAxios, axios)
app.mount('#app')