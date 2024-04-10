<script setup>
  import RegisterView from '../components/RegisterComponent.vue'
  import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas)
</script>

<template>
    <h3 class="text-dark">Login</h3>
    <div class="q-pa-md" style="width: 50vh;">
        
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
        <q-input
          filled
          v-model="model.account.username"
          label="Your username *"
          lazy-rules
          :rules="[ val => val !== '' || 'Please type something']"
        />
  
        <q-input
          filled
          type="password"
          v-model="model.account.password"
          label="Your password *"
          lazy-rules
          :rules="[ val => val !== '' || 'Please type your password']"
        />
  
        <div>
          <q-btn label="Login" type="submit" color="primary"/>
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          <q-btn label=" You don't have an account? Register here" @click="dialog = true"  flat style="font-size:small" color="red"  />
        </div>
      </q-form>
      <div class="q-pa-md q-gutter-sm">
        <q-dialog
          v-model="dialog"
          persistent
          :maximized="maximizedToggle"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="text-white"  >
            <q-bar class="bg-dark">
              <q-title class="">
                Register
              </q-title>
              <q-space />

              <q-btn dense flat  @click="maximizedToggle = false" :disable="!maximizedToggle">
                <font-awesome-icon :icon="['fas', 'window-minimize']" color="white" size="lg" />
                <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
              </q-btn>
              <q-btn dense flat  @click="maximizedToggle = true" :disable="maximizedToggle" style="margin-left: 0.5vmax; margin-right: 0.5vmax;">
                <font-awesome-icon :icon="['fas', 'window-maximize']" color="white" size="lg" />
                <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
              </q-btn>
              <q-btn dense flat  v-close-popup>
                <font-awesome-icon :icon="['fas', 'xmark']" color="red" size="lg" />
                <q-tooltip class="bg-white text-red">Close</q-tooltip>
              </q-btn>
            </q-bar>

            <q-card-section class="q-pt-none resgister-max" v-if="maximizedToggle" >
              <RegisterView />
            </q-card-section>
            <q-card-section class="q-pt-none resgister-min" v-if="!maximizedToggle" >
              <RegisterView />
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    data() {
      return {
        model: {
            account: {
                username: '',
                password: '',
            }
        }, 
        dialog: false,
        maximizedToggle: true,
      }
    },
    methods: {
      onSubmit() {
        axios.post('https://localhost:7014/api/Accounts/login', this.model.account).then(response => {
                            console.log(response.data);
                            alert('Login successfully');
                            this.$router.push('/');
                            this.$router.go();
                            localStorage.setItem('token', response.data.token);
                            localStorage.setItem('displayName', response.data.displayName);
                            localStorage.setItem('userId', response.data.id);
                }).catch(error => {
                    console.error('Error login:', error);
                });
            },
        onReset() {
        this.model.account.username = '';
        this.model.account.password = '';
      },
    }
    }
  </script>
  
  <style  scoped>
  .resgister-max {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  };
  .resgister-min {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  