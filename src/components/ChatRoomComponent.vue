<script setup>

import { QChatMessage } from 'quasar'
import { QIcon } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)


</script>

<template >
  <div ref="scrollContainer" class="q-pa-md row scroll text-dark" style="height:33.4vmax;"  >
    <div class="" v-for="message in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        :name="[message.sender]"
        avatar="https://cdn.quasar.dev/img/avatar4.jpg"
        :text="[message.content]"
        sent
        stamp="7 minutes ago"
        v-if="message.sender === this.user"
      />
       <!--  -->
      <q-chat-message v-else
        :name="[message.sender]"
        avatar="https://cdn.quasar.dev/img/avatar3.jpg"
        :text="[message.content]"
        stamp="4 minutes ago" 
      />
      <!-- <q-chat-message
        name="Jane"
        avatar="https://cdn.quasar.dev/img/avatar5.jpg"
        bg-color="primary"
      >
        <q-spinner-dots size="2rem" />
      </q-chat-message> -->
      <!-- -->
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessageToRoom(this.room.id )" style="width: 100%;"  label="Type your message" :dense="dense">
        <template v-slot:before>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar5.jpg">
          </q-avatar>
        </template>

        <template v-slot:append>
          <div v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </div>
        </template>

        <template v-slot:after>
          <div round dense flat @click="sendMessageToRoom(this.room.id )" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
          </div>
        </template>
    </q-input>
    <!-- <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."> -->
    <!-- <button type="button" @click="sendMessage">Send</button> -->
  </div>
  
</template>

<script>
  import * as signalR from "@aspnet/signalr";

export default {
    name: 'ChatRoomComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      room: {
        id: '',
        roomName: '',
        admin: '',
      },
      now: Date.now(),
      initSignalR : false
    };
   
  },
  created() {
    this.initSignalRConnection();
    // this.initSignalR = false;
  },
  mounted() {
    this.getUser();
    this.room.id = this.$route.params.id;
    // this.getHistoryChatRoom(this.$route.params.id);
  },
  watch: {
    //van loi vl
            '$route.params.id': function(newId) {
                this.room.id = newId; 
                this.initSignalR = true;
                // this.listenForMessages(newId);
                this.initSignalRConnection();
                this.listenForMessages(newId);
                // this.getHistoryChatRoom(newId);
                this.sendMessageToRoom(newId);
                // this.listenForMessages(newId);
                this.messages = [];
            }
        },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.scrollContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    initSignalRConnection() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        if(this.initSignalR == 0){
          this.listenForMessages(this.$route.params.id);
        }
        this.getHistoryChatRoom(this.room.id);
        this.listenForHistoryChatRoom();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    listenForMessages(roomId) {
      this.connection.on("ReceiveMessageRoom" + roomId, (message) => {
        this.messages.push( {sender:message.fromUser,content:message.content} );
        console.log(message);
        this.scrollToBottom();
      });
    },
    sendMessageToRoom(roomId) {
        try {
            if (this.text.trim() !== "") {
                console.log("Sending message to room...");
                this.connection.invoke("SendToRoom", this.userId,roomId, this.text)
                    .then(() => {
                        console.log("Message sent successfully");
                        this.text = ""; // Clear input field after sending message
                    })
                    .catch((error) => {
                        console.error("Error sending message: ", error);
                        // Xử lý lỗi ở đây
                    });
            }
        } catch (error) {
            console.error("Error sending message: ", error);
            // Xử lý lỗi ở đây
        }
    },
    getHistoryChatRoom(roomId){
        this.connection.invoke("GetHistoryChatRoom", roomId)
        .catch((error) => {
            console.error("Error getting chat history: ", error);
        });
    },
    listenForHistoryChatRoom(){
        this.connection.on("ReceiveChatHistoryRoom", (messages) => {
            // Cập nhật dữ liệu lịch sử chat
            messages.forEach(message => {
                this.messages.push( {sender:message.fromUser,content:message.content} );
            });
            this.scrollToBottom();
        }); 
    },
    getUser() {
      if (localStorage.getItem('token')){
        this.user = localStorage.getItem('displayName');
        this.userId = localStorage.getItem('userId');
        console.log(this.user);
        console.log(this.userId);
      }
    }
  }
};
</script>

<style scoped>

</style>
