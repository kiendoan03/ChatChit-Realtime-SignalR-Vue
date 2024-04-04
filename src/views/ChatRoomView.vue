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
            <q-avatar>
                <img src="https://static.vecteezy.com/system/resources/previews/026/019/617/original/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg">
            </q-avatar>
            <!-- <img src="https://static.vecteezy.com/system/resources/previews/026/019/617/original/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg" style="width: 3%;" alt=""> -->
            <q-toolbar-title>
              <strong class="text-dark">{{this.room.roomName}}</strong>
            </q-toolbar-title>
            <q-space />
            <div class="cursor-pointer" >
                <font-awesome-icon :icon="['fas', 'user-plus']" style="color: black; margin-right: 1vmax;" size="lg"  @click="openDialog('blur(4px) saturate(150%)')"/>
                <font-awesome-icon :icon="['fas', 'person-through-window']" style="color: black;" size="xl" @click="openDialogOut('blur(4px) saturate(150%)')"/>
            </div>
            <div class="q-pa-md q-gutter-sm ">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                      <q-card>
                        <q-card-section class="row items-center q-pb-none text-h6 text-dark">
                          Add User to group
                        </q-card-section>

                        <q-card-section class="text-dark scroll " style="width: 20vmax; height: 15vmax;">
                          <q-list>
                            <q-item v-for="user in users" :key="user.id">
                              <q-item-section>
                                <q-checkbox v-model="user.checked"  :value="user.id" style="text-align: center;justify-content: center;">
                                 <q-item-section >
                                    <q-avatar>
                                      <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg" >
                                    </q-avatar>
                                  </q-item-section>
                                  <!-- <q-item-section> -->
                                     <q-item-label>{{ user.displayName }}</q-item-label>
                                  <!-- </q-item-section> -->
                                </q-checkbox>
                              </q-item-section>
                              
                            </q-item>
                          </q-list>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn color="secondary" label="Add" @click="addUsersToGroup" />
                          <q-btn flat label="Close" color="primary" v-close-popup />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                </div>
                <div class="q-pa-md q-gutter-sm ">
                    <q-dialog v-model="dialogOut" :backdrop-filter="backdropFilter">
                      <q-card>
                        <q-card-section class="row items-center q-pb-none text-h6 text-red">
                          Leave Group
                        </q-card-section>

                        <q-card-section class="text-dark" >
                          <q-item-secion>
                            <q-item-sec>
                              <q-item-label>Are you sure you want to leave this group?</q-item-label>
                            </q-item-sec>
                          </q-item-secion>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn color="secondary" label="Yes" @click="leaveRoom" />
                          <q-btn flat label="No" color="primary" v-close-popup />
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
import * as signalR from "@aspnet/signalr";
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
                dialogOut: false,
                backdropFilter: '', 
                users: [],
                selectedUsers: [], 
            }
        },
        created() {
          this.initSignalRConnection();
        },
        mounted() {
        this.getRoom(this.$route.params.id);
        this.getUsers(this.$route.params.id);  
        },
        watch: {
            '$route.params.id': function(newId) {
                this.getRoom(newId);
                this.getUsers(newId);
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
            getRoom(roomId){
                axios.get('https://localhost:7014/api/rooms/'+roomId)
                .then(res => {
                    this.room = res.data;
                })
            },
            getUsers(roomId) {
            axios.get('https://localhost:7014/api/Users/GetUserNotInGroup?groupId='+roomId)
                .then(res => {
                    this.users = res.data; 
                    console.log(this.users);
                });
            },
            addUsersToGroup() {
              this.selectedUsers = this.users.filter(user => user.checked).map(user => user.id);
              console.log(this.selectedUsers); 
              this.selectedUsers.forEach(user => {
                this.connection.invoke("AddUserToRoom", this.room.id, user );
              });
              this.users.forEach(user => user.checked = false);
              this.dialog = false;
              this.$forceUpdate();
            },
            leaveRoom() {
              this.connection.invoke("LeaveRoom", this.room.id, localStorage.getItem('userId'))
              .catch(err => console.error(err));
              this.$router.push('/');
              // this.$forceUpdate();
              // this.$router.go();
             
            },
            openDialog(filter) {
                if (typeof filter === 'string') { // Kiểm tra nếu filter là một chuỗi
                this.backdropFilter = filter;
                this.dialog = true;
                } else {
                console.error('Invalid backdrop filter value'); // In ra thông báo lỗi nếu filter không phải là chuỗi
                }
            },
            openDialogOut(filter) {
                if (typeof filter === 'string') { // Kiểm tra nếu filter là một chuỗi
                this.backdropFilter = filter;
                this.dialogOut = true;
                } else {
                console.error('Invalid backdrop filter value'); // In ra thông báo lỗi nếu filter không phải là chuỗi
                }
            },
        }
    }

</script>
<style>
  .bg-selected {
    background-color: lightblue; /* Đổi màu nền khi được chọn */
  }
</style>