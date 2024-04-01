<script setup>
import ChatRoom from '../components/ChatRoomComponent.vue'
import { QLayout, QHeader, QToolbar, QBtn, QSpace, QPageContainer, QPage } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas)
</script>

<template>
  <main>
    <!-- <h3 class="text-dark">{{this.room.roomName}}</h3> -->
    <q-layout view="lHh lpr lFf" container style="height: 44.92vmax;" class="shadow-2 rounded-borders">
        <q-header elevated class="bg-transparent">
          <q-toolbar>
            <img src="../assets/images/images-removebg-preview.png" style="width: 3%;" alt="">
            <q-toolbar-title>
              <strong class="text-dark">{{this.room.roomName}}</strong>
            </q-toolbar-title>
            <q-space />
            <div class="cursor-pointer" >
                <font-awesome-icon :icon="['fas', 'user-plus']" style="color: black;" size="lg" />
            </div>
          </q-toolbar>
        </q-header>
        <q-page-container>
          <q-page class="">
              <q-scroll-area style="height: 39vmax; "> 
                <ChatRoom/>
              </q-scroll-area>
          </q-page>
        </q-page-container>
      </q-layout>
   
  </main>
</template>

<script>
import axios from 'axios';
    export default {
        name: 'ChatRoomView',
        data() {
            return {
                connection: null,
                room:{
                    id: '',
                    roomName: '',
                    admin: '',
                },
            }
        },
        mounted() {
        this.getRoom(this.$route.params.id);
        },
        watch: {
            '$route.params.id': function(newId) {
                this.getRoom(newId);
            }
        },
        methods:{
            getRoom(roomId){
                axios.get('https://localhost:7014/api/rooms/'+roomId)
                .then(res => {
                    this.room = res.data;
                })
            }
        }
    }

</script>
