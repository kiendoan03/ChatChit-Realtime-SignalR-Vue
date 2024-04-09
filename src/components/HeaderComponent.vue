<script setup>
    import { QLayout, QHeader, QToolbar, QBtn, QSpace, QPageContainer, QPage, QIcon } from 'quasar'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { fab } from '@fortawesome/free-brands-svg-icons'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    library.add(fas, fab)
    

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
              <!-- <div class="q-pa-md q-gutter-sm "> -->
                    <q-dialog v-model="dialogSignOut" :backdrop-filter="backdropFilter">
                      <q-card>
                        <q-card-section class="row items-center q-pb-none text-h6 text-red">
                          Sign out
                        </q-card-section>

                        <q-card-section class="text-dark" >
                          <q-item-secion>
                            <q-item-sec>
                              <q-item-label>
                                Are you sure you want to sign out?
                              </q-item-label>
                            </q-item-sec>
                          </q-item-secion>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn color="secondary" label="Yes" @click="logout" />
                          <q-btn flat label="No" color="primary" v-close-popup />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                <!-- </div> -->
            </div>
          </q-toolbar>
        </q-header>
  
        <q-page-container>
          <q-page class="q-pa-md">
              <q-scroll-area style="height: 38vmax; max-width: 30vmax;">
                <nav class="route ">
                  <div class="q-pa-md flex ">
                      <div style="max-width: 90%; width: 30vmax;">
                        <q-intersection
                          transition="flip-right"
                          class="example-item"
                        >
                        <RouterLink to="/chatLobby" >
                          <q-item v-ripple style="width: 30vmax;">
                            <q-item-section avatar>
                              <q-avatar color="light-green-4" text-color="white">
                                {{ generateAvatarFromName('Lobby') }}
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class ="text-white"><font-awesome-icon :icon="['fas', 'user-group']" size="2xs" /> Lobby</q-item-label>
                                <q-item-label caption lines="1" class ="text-grey-6" style="width: 15vmax;">
                                  <span class="text-secondary" v-if="this.lastMessageLobby.fromUser != this.user.name">
                                    {{this.lastMessageLobby.fromUser }}:
                                  </span>
                                  <span v-else class="text-secondary">
                                    You:
                                  </span>
                                   <template v-for="(element, index) in lastMessageLobby.content" >
                                    <span v-if="typeof element === 'string'">{{ element }}</span>
                                    <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
                                  </template>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side style="font-size: small;">
                              {{ this.lastMessageLobby.sentAt}}
                            </q-item-section>
                            </q-item> 
                          </RouterLink>
                          </q-intersection>
                        </div>
                      </div>
                    <div class="q-pa-md flex ">
                      <div style="max-width: 90%; width: 30vmax;">
                        <q-intersection
                          v-for="room in rooms"
                          :key="room.id"
                          transition="flip-right"
                          class="example-item"
                        >
                        <RouterLink :to="'/chatRoom/' + room.id" >
                          <q-item v-ripple style="width: 30vmax;">
                            <q-item-section avatar>
                              <q-avatar color="cyan-3" text-color="white">
                                {{ generateAvatarFromName(room.roomName) }}
                              </q-avatar>
                            </q-item-section>
                            <q-item-section >
                                <q-item-label class ="text-white"><font-awesome-icon :icon="['fas', 'user-group']" size="2xs" />  {{ room.roomName }}</q-item-label>
                                <q-item-label caption lines="1" class="text-grey-6" style="width: 15vmax;">
                                  <template v-if="lastMessageRoom[room.id]">
                                    <span class ="text-secondary" v-if="lastMessageRoom[room.id].fromUser != this.user.name">
                                       {{ lastMessageRoom[room.id].fromUser }}:
                                    </span>
                                    <span class="text-secondary" v-else >
                                      You:
                                    </span>
                                    <template v-for="(element, index) in lastMessageRoom[room.id].content">
                                        <span v-if="typeof element === 'string'">{{ element }}</span>
                                        <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
                                    </template>
                                  </template>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side style="font-size: small;">
                              <div v-if="lastMessageRoom[room.id]" class="message-sent-at">
                                  {{ lastMessageRoom[room.id].sentAt }}
                              </div>
                              <div v-else>
                                  No messages yet
                              </div>
                            </q-item-section>
                            </q-item> 
                          </RouterLink>
                          </q-intersection>
                        </div>
                      </div>
                    <div class="q-pa-md flex ">
                      <div style="max-width: 90%; width: 30vmax;">
                        <q-intersection
                          v-for="users in allUser"
                          :key="users.id"
                          transition="flip-right"
                          class="example-item"
                        > 
                        <RouterLink :to="'/chatPrivate/' + users.id" >
                          <q-item v-ripple style="width: 30vmax;">
                            <q-item-section avatar>
                              <q-avatar color="primary" text-color="white">
                                {{ generateAvatarFromName(users.displayName) }}
                              </q-avatar>
                            </q-item-section>
                         
                            <q-item-section>
                                <q-item-label class ="text-white">{{ users.displayName }}</q-item-label>
                                <q-item-label caption lines="1" class ="text-grey-6" style="width: 15vmax;">
                                  <template v-if="lastMessagePrivate[users.id]">
                                    <span class ="text-secondary" v-if="lastMessagePrivate[users.id].fromUser != '' && lastMessagePrivate[users.id].fromUser != this.user.name ">
                                       {{ lastMessagePrivate[users.id].fromUser }}: 
                                    </span>
                                    <span class="text-secondary" v-else-if="lastMessagePrivate[users.id].fromUser != ''" >
                                      You:
                                    </span>
                                    <template v-for="(element, index) in lastMessagePrivate[users.id].content">
                                        <span v-if="typeof element === 'string'">{{ element }}</span>
                                        <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
                                    </template>
                                  </template>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side style="font-size: small;">
                              <div v-if="lastMessagePrivate[users.id]" class="message-sent-at">
                                  {{ lastMessagePrivate[users.id].sentAt }}
                              </div>
                              <div v-else>
                                  No messages yet
                              </div>
                            </q-item-section>
                          </q-item>
                        </RouterLink>
                          
                          </q-intersection>
                        </div>
                      </div>
                </nav>
              </q-scroll-area>
          </q-page>
        </q-page-container>
        <q-footer elevated class="bg-dark text-white">
          <q-toolbar>
            <div class="user">
              <q-avatar color="pink-3" text-color="white">
                  {{ generateAvatarFromName(this.user.name) }}
              </q-avatar>
              <span style="margin-left: 1.5vh;">{{ this.user.name }}</span>
            </div>
            <q-space />
            <div class="cursor-pointer"  @click="openDialogSignOut('blur(4px) saturate(150%)')">
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
          avatar: '',
          id: '',
        },
        roomName: '',
        dialog: false,
        dialogSignOut: false,
        backdropFilter: '',
        rooms: [],
        allUser:[],
        userActive: [],
        lastMessageLobby:{},
        lastMessageRoom:[],
        lastMessagePrivate:[]
      }
    }, 
    created() {
    this.initSignalRConnection();
    },
    mounted() {
      this.getUser();
      var userId = this.user.id;
      this.getRooms(userId);
      this.getAllUsers(userId);
    },
    methods: {
      initSignalRConnection() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        this.listenForUsers();
        this.listenJoinNewRoom(this.user.id);
        this.listenForLeaveRoom(this.user.id);
        this.getLastMessageInLobby();
        this.listenForLastMessageInLobby();
        this.rooms.forEach(room => {
          this.getLastMessageInRoom(room.id);
          this.listenForLastMessageInRoom(room.id);
        });
        this.allUser.forEach(user => {
          this.getLastMessagePrivate(this.user.id, user.id);
          this.listenForLastMessagePrivate(user.id);
        });
        // this.sortConversationsByTime();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    calculateElapsedTime(sentAt) {
      const now = new Date(); // Thời gian hiện tại
      const sentTime = new Date(sentAt); // Thời gian gửi tin nhắn
      const elapsed = now - sentTime; // Thời gian trôi qua (đơn vị: mili giây)

      // Chuyển đổi thời gian trôi qua thành đơn vị phù hợp (ví dụ: phút, giờ, ngày)
      const secondsElapsed = Math.floor(elapsed / 1000); // 1000 mili giây = 1 giây
      const minutesElapsed = Math.floor(elapsed / 60000); // 60000 mili giây = 1 phút
      const hoursElapsed = Math.floor(elapsed / 3600000); // 3600000 mili giây = 1 giờ
      const daysElapsed = Math.floor(elapsed / 86400000); // 86400000 mili giây = 1 ngày
      const yearsElapsed = Math.floor(elapsed / 31536000000); // 31536000000 mili giây = 1 năm

      // Trả về thời gian trôi qua dưới dạng chuỗi để hiển thị cho người dùng
      if (yearsElapsed > 0) {
          return `${yearsElapsed} years ago`;
      } else if (daysElapsed > 0) {
          return `${daysElapsed} days ago`;
      } else if (hoursElapsed > 0) {
          return `${hoursElapsed} hours ago`;
      } else if (minutesElapsed > 0){
          return `${minutesElapsed} minutes ago`;
      } else if (secondsElapsed == 0){
          return `Just now`;
      } else if (secondsElapsed == 1){
          return `${secondsElapsed} second ago`;
      } else if (secondsElapsed > 1){
          return `${secondsElapsed} seconds ago`;
      } else {
          return `${secondsElapsed} seconds ago`;
      } 
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
    listenForNewRoom() {
      this.connection.on("addChatRoom", (newRoom) => {
        this.rooms.push( newRoom );
        console.log(newRoom);
      });
    },
      logout() {
        localStorage.clear();
        this.$router.push('/').then(() => {
          window.location.reload();
        });
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
      getAllUsers(userId) {
        axios.get('https://localhost:7014/api/Users/GetUserExceptMe?userId=' + userId)
        .then(res => {
          this.allUser = res.data;
          console.log(this.allUser);
        })
      },
      listenForUsers(){
        this.connection.on("newUser", (users) => {
          this.allUser.push(users);
          console.log(this.allUser);
        });
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
      listenForLeaveRoom(userId){
        this.connection.on("LeaveGroup" + userId, (room) => {
          this.rooms = this.rooms.filter(rooms => rooms.id !== room.id);
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
      },
      openDialogSignOut(filter) {
        if (typeof filter === 'string') { // Kiểm tra nếu filter là một chuỗi
          this.backdropFilter = filter;
          this.dialogSignOut = true;
        } else {
          console.error('Invalid backdrop filter value'); // In ra thông báo lỗi nếu filter không phải là chuỗi
        }
      },
      getLastMessageInLobby(){
        this.connection.invoke("GetLastMessageInLobby")
        .catch((error) => {
          console.error("Error getting last message in lobby: ", error);
        });
      },
      listenForLastMessageInLobby(){
        this.connection.on("ReceiveLastMessageInLobby", (message) => {
          const elapsedTime = this.calculateElapsedTime(message.sendAt);
          let messageContent = message.content;

          const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

          // Kiểm tra nếu tin nhắn chứa hình ảnh
          const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
          let match;
          let lastIndex = 0;

          while ((match = imageRegex.exec(messageContent)) !== null) {
            // Thêm văn bản trước hình ảnh (nếu có)
            if (match.index > lastIndex) {
              messageElements.push(messageContent.substring(lastIndex, match.index));
            }
            // Thêm hình ảnh
            messageElements.push({ type: 'emoji', src: match[1] });
            lastIndex = imageRegex.lastIndex;
          }
          // Thêm văn bản cuối cùng (nếu có)
          if (lastIndex < messageContent.length) {
            messageElements.push(messageContent.substring(lastIndex));
          }

          this.lastMessageLobby = {
            fromUser: message.fromUser,
            content: messageElements,
            sentAt: elapsedTime,
            // time: message.sendAt
          };

        });
      },
      getLastMessageInRoom(roomId){
        this.connection.invoke("GetLastMessageInRoom", roomId)
        .catch((error) => {
          console.error("Error getting last message in room: ", error);
        });
      },
      listenForLastMessageInRoom(roomId){
        this.connection.on("ReceiveLastMessageInRoom" +  roomId, (message) => {
          const elapsedTime = this.calculateElapsedTime(message.sendAt);
          let messageContent = message.content;

          const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

          // Kiểm tra nếu tin nhắn chứa hình ảnh
          const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
          let match;
          let lastIndex = 0;

          while ((match = imageRegex.exec(messageContent)) !== null) {
            // Thêm văn bản trước hình ảnh (nếu có)
            if (match.index > lastIndex) {
              messageElements.push(messageContent.substring(lastIndex, match.index));
            }
            // Thêm hình ảnh
            messageElements.push({ type: 'emoji', src: match[1] });
            lastIndex = imageRegex.lastIndex;
          }
          // Thêm văn bản cuối cùng (nếu có)
          if (lastIndex < messageContent.length) {
            messageElements.push(messageContent.substring(lastIndex));
          }

            this.lastMessageRoom[roomId] = {
            fromUser: message.fromUser,
            content: messageElements,
            sentAt: elapsedTime,
            roomId: message.room,
            // time: message.sendAt
          };
        });
      },
      getLastMessagePrivate(senderId, receiverId){
        this.connection.invoke("GetLastMessagePrivate", senderId, receiverId)
        .catch((error) => {
          console.error("Error getting last message in private: ", error);
        });
      },
      listenForLastMessagePrivate(receiverId){
        this.connection.on("ReceiveLastMessagePrivate" + receiverId, (message) => {
          if(message && message.sendAt){
             const elapsedTime = this.calculateElapsedTime(message.sendAt);
            let messageContent = message.content;

            const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

            // Kiểm tra nếu tin nhắn chứa hình ảnh
            const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
            let match;
            let lastIndex = 0;

            while ((match = imageRegex.exec(messageContent)) !== null) {
              // Thêm văn bản trước hình ảnh (nếu có)
              if (match.index > lastIndex) {
                messageElements.push(messageContent.substring(lastIndex, match.index));
              }
              // Thêm hình ảnh
              messageElements.push({ type: 'emoji', src: match[1] });
              lastIndex = imageRegex.lastIndex;
            }
            // Thêm văn bản cuối cùng (nếu có)
            if (lastIndex < messageContent.length) {
              messageElements.push(messageContent.substring(lastIndex));
            }

            this.lastMessagePrivate[receiverId] = {
              fromUser: message.fromUser,
              content: messageElements,
              sentAt: elapsedTime,
              // time: message.sendAt
            };
          }else{
            this.lastMessagePrivate[receiverId] = {
              fromUser: '',
              content: '',
              sentAt: '',
              // time: ''
            };
          }
        });
      },
      // sortConversationsByTime() {
      //   this.rooms.sort((a, b) => {
      //       if (this.lastMessageRoom[a.id] && this.lastMessageRoom[b.id]) {
      //         return new Date(this.lastMessageRoom[b.id].time) - new Date(this.lastMessageRoom[a.id].time);
      //       } else {
      //         return 0; // Không có tin nhắn cuối cùng, không có sắp xếp
      //       }
      //     });

      //     // Sắp xếp danh sách người dùng
      //     this.allUser.sort((a, b) => {
      //       if (this.lastMessagePrivate[a.id] && this.lastMessagePrivate[b.id]) {
      //         return new Date(this.lastMessagePrivate[b.id].time) - new Date(this.lastMessagePrivate[a.id].time);
      //       } else {
      //         return 0; // Không có tin nhắn cuối cùng, không có sắp xếp
      //       }
      //     });
      //   },
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
