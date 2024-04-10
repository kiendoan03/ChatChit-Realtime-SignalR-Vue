<script setup>
import ChatPrivate from '../components/ChatPrivateComponent.vue'
import { QLayout, QHeader, QToolbar, QBtn, QSpace, QPageContainer, QPage } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas)
</script>

<template>
  <main>
    <q-layout view="lHh lpr lFf" container style="height: 44.92vmax;" class="shadow-2 rounded-borders">
        <q-header elevated class="bg-transparent">
          <q-toolbar>
            <q-avatar color="primary" text-color="white">
              {{ user && user.displayName ? generateAvatarFromName(user.displayName) : '' }}
            </q-avatar>
            <q-toolbar-title>
              <strong class="text-dark">{{this.user.displayName}}</strong>
            </q-toolbar-title>
            <q-space />
      
          
          </q-toolbar>
        </q-header>
        <q-page-container>
          <q-page class="">
              <q-scroll-area style="height: 39vmax; "> 
                <ChatPrivate/>
              </q-scroll-area>
          </q-page>
        </q-page-container>
      </q-layout>
  </main>
</template>

<script>
import axios from 'axios';
import * as signalR from "@aspnet/signalr";
    export default {
        name: 'ChatPrivateView',
        data() {
            return {
                connection: null,
                user: {},
            }
        },
        created() {
          this.initSignalRConnection();
        },
        mounted() {
          this.getUser(this.$route.params.id);
        },
        watch: {
            '$route.params.id': function(newId) {
                this.getUser(newId);
            }
        },
        methods:{
          initSignalRConnection() {
            this.connection = new signalR.HubConnectionBuilder()
              .withUrl("https://localhost:7014/chatHub")
              .build();

            this.connection.start().then(() => {
              console.log("Connected to SignalR Hub");
            }).catch((error) => {
              console.error("Error connecting to SignalR Hub: ", error);
            });
          },
          generateAvatarFromName(name) {
                const words = name.split(' ');
                let avatar = '';
                words.forEach(word => {
                    if (word.length > 0) {
                        avatar += word[0];
                    }
                });
                return avatar.toUpperCase();
            },
          getUser(userid){
            axios.get('https://localhost:7014/api/Users/'+userid)
            .then(response => {
              this.user = response.data;
              console.log(response.data); 
            })
            .catch(error => {
              console.log(error);
            })
          }
        }
    }

</script>
<style>
  .bg-selected {
    background-color: lightblue;
  }
</style>