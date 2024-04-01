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
                <font-awesome-icon :icon="['fas', 'user-plus']" style="color: black;" size="lg"  @click="openDialog('blur(4px) saturate(150%)')"/>
            </div>
            <div class="q-pa-md q-gutter-sm ">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                      <q-card>
                        <q-card-section class="row items-center q-pb-none text-h6 text-dark">
                          Add User to group
                        </q-card-section>

                        <q-card-section class="text-dark">
                          <q-input outlined v-model="user" @keyup.enter="" style="width: 20vw;" label="User name" />
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn color="secondary" label="Add" @click="" />
                          <q-btn flat label="Close" color="primary" v-close-popup />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
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
                dialog: false,
                backdropFilter: '', 
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
            },
            addUserToRoom(){
                this.dialog = true;
            },
            openDialog(filter) {
                if (typeof filter === 'string') { // Kiểm tra nếu filter là một chuỗi
                this.backdropFilter = filter;
                this.dialog = true;
                } else {
                console.error('Invalid backdrop filter value'); // In ra thông báo lỗi nếu filter không phải là chuỗi
                }
            },
        }
    }

</script>
