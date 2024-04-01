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
        </div>
      </q-form>
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
        }
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
      }
      },
      
    }
  </script>
  
  <style lang="scss" scoped>
  
  </style>
  