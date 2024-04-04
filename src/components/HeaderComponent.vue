<script setup>
    import { QLayout, QHeader, QToolbar, QBtn, QSpace, QPageContainer, QPage, QIcon } from 'quasar'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas)
    

</script>

<template>
    <div class="q-pa-md bg-dark" style="border-radius: 1%;" >
      <q-layout view="lHh lpr lFf" container style="height: 45.5vmax;" class="shadow-2 rounded-borders">
        <q-header elevated class="bg-dark">
          <q-toolbar>
            <img src="../assets/images/images-removebg-preview.png" style="width: 10%;" alt="">
            <q-toolbar-title>
              <strong>O2 Tech</strong>
            </q-toolbar-title>
            <q-space />
            <div class="cursor-pointer" >
              <span style="margin-right: 1vw">
                 <font-awesome-icon :icon="['fas', 'magnifying-glass']" size="lg" />
              </span>
              <span>
                <font-awesome-icon :icon="['fas', 'user-group']" size="lg" @click="openDialog('blur(4px) saturate(150%)')" />
              </span>
              <div class="q-pa-md q-gutter-sm ">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                      <q-card>
                        <q-card-section class="row items-center q-pb-none text-h6 text-dark">
                          Add new group
                        </q-card-section>

                        <q-card-section class="text-dark">
                          <q-input outlined v-model="roomName" @keyup.enter="addRoom" style="width: 20vw;" label="Room name" />
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn color="secondary" label="Add" @click="addRoom" />
                          <q-btn flat label="Close" color="primary" v-close-popup />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                </div>
            </div>
          </q-toolbar>
        </q-header>
  
        <q-page-container>
          <q-page class="q-pa-md">
              <q-scroll-area style="height: 38vmax; max-width: 30vmax;">
                <nav class="route ">
                    <RouterLink to="/chatLobby"  ><img src="../assets/images/lobby.png" style="border-radius: 50%;object-fit: cover; overflow: hidden;height: 2.8vmax; width: 2.8vmax;"> Lobby</RouterLink>
                    <div v-for="room in rooms" :key="room.id">
                      <RouterLink :to="'/chatRoom/' + room.id" ># {{ room.roomName }}</RouterLink>
                    </div>
                    <div v-for="user in allUser" :key="user.id">
                      <RouterLink :to="'/chatPrivate/' + user.id" >
                        <q-avatar>
                          <img src="https://cdn.quasar.dev/img/avatar5.jpg">
                        </q-avatar>
                        <span style="margin-left: 1vmax;">{{ user.displayName }}</span> 
                      </RouterLink>
                    </div>
                    <!-- <div v-for="user in userActive" :key="user.id">
                      <RouterLink :to="'/chatPrivate/' + user.id" >
                        <q-avatar>
                          <img src="https://cdn.quasar.dev/img/avatar5.jpg">
                        </q-avatar>
                        <span style="margin-left: 1vmax;">{{ user.displayName }}</span> 
                      </RouterLink>
                    </div> -->
                </nav>
              </q-scroll-area>
          </q-page>
        </q-page-container>
        <q-footer elevated class="bg-dark text-white">
          <q-toolbar>
            <div class="user">
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar5.jpg">
              </q-avatar>
              <span style="margin-left: 1.5vh;">{{ this.user.name }}</span>
            </div>
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
import axios from 'axios'
import * as signalR from "@aspnet/signalr";
import { RouterLink } from 'vue-router'
  export default {
    name: 'HeaderComponent',
    data() {
      return {
        connection: null,
        user:{
          name: '',
          avatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
          id: '',
        },
        roomName: '',
        dialog: false,
        backdropFilter: '',
        rooms: [],
        allUser:[],
        userActive: [],
        // active: false,
      }
    }, 
    created() {
    this.initSignalRConnection();
    },
    mounted() {
      this.getUser();
      var userId = this.user.id;
      this.getRooms(userId);
      this.getAllUsers();
    },
    methods: {
      initSignalRConnection() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        this.checkUserActive();
        this.listenForUserActive();
        this.listenJoinNewRoom(this.user.id);
        console.log(this.user.id);
        this.listonForLeaveRoom(this.user.id);
        // this.listenForNewRoom();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    listenForNewRoom() {
      this.connection.on("addChatRoom", (newRoom) => {
        this.rooms.push( newRoom );
        console.log(newRoom);
        // this.scrollToBottom();
      });
    },
      logout() {
        localStorage.clear();
        this.$router.push('/');
        this.$router.go();
      },
      getUser() {
        this.user.name = localStorage.getItem('displayName');
        this.user.id = localStorage.getItem('userId');
      },
      addRoom() {
        axios.post('https://localhost:7014/api/Rooms', {
          roomName: this.roomName,
        })
        .then(res => {
          console.log(res.data);
          this.dialog = false;
          this.$router.go();
        })
      },
      getAllUsers() {
        axios.get('https://localhost:7014/api/Users/GetUserExceptMe?userId=' + this.user.id )
        .then(res => {
          this.allUser = res.data;
          console.log(this.allUser);
        })
      },
      checkUserActive() {
        this.connection.invoke("GetUserActive")
        .catch((error) => {
          console.error("Error getting user active: ", error);
        });
      },
      listenJoinNewRoom(userId){
        console.log('listenJoinNewRoom');
        console.log(userId);
        this.connection.on("JoinNewGroup" + userId, (room) => {
          this.rooms.push(room);
          console.log(room);
          this.$forceUpdate();
        });
      },
      listonForLeaveRoom(userId){
        this.connection.on("LeaveGroup" + userId, (room) => {
          this.rooms = this.rooms.filter(rooms => rooms.id !== room.id);
          // const index = this.rooms.findIndex(rooms => rooms.id === room.id);
          //   if (index !== -1) {
          //       this.rooms.splice(index, 1);
          //   }
          console.log(room);
          this.$forceUpdate();
        });
      },
      listenForUserActive() {
        this.connection.on("ReceiveUserActive", (users) => {
          this.userActive = users;
          console.log(users);
        });
      },
      getRooms(userId) {
        axios.get(`https://localhost:7014/api/Rooms?userId=${userId}`)
        .then(res => {
          this.rooms = res.data;
          console.log(this.rooms);
        })
      },
      openDialog(filter) {
        if (typeof filter === 'string') { // Kiểm tra nếu filter là một chuỗi
          this.backdropFilter = filter;
          this.dialog = true;
        } else {
          console.error('Invalid backdrop filter value'); // In ra thông báo lỗi nếu filter không phải là chuỗi
        }
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
