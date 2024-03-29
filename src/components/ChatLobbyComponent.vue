<script setup>

import { QChatMessage } from 'quasar'
import { QIcon } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)


</script>

<template >
  <div class="q-pa-md row scroll text-dark" style="height:36.69vmax;"  >
    <div class="" v-for="message in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        :name="[message.sender]"
        avatar="https://cdn.quasar.dev/img/avatar4.jpg"
        :text="[message.content]"
        sent
        stamp="7 minutes ago"
        v-if="message.sender === this.user"
      />
      <q-chat-message v-else
        :name="[message.sender]"
        avatar="https://cdn.quasar.dev/img/avatar3.jpg"
        :text="[message.content]"
        stamp="4 minutes ago" 
      />
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessage" style="width: 100%;"  label="Type your message" :dense="dense">
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
          <div round dense flat @click="sendMessage" class="cursor-pointer">
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
    name: 'ChatComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      now: Date.now()
    };
   
  },
  created() {
    this.initSignalRConnection();
  },
  mounted() {
    this.getUser();
  },
  methods: {
    initSignalRConnection() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        this.listenForMessages();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    listenForMessages() {
      this.connection.on("ReceiveMessage", (sender, content) => {
      // this.connection.on("newMessage",content => {
        this.messages.push( {sender,content} );
      });
    },
    sendMessage() {
      if (this.text.trim() !== "") {
        this.connection.invoke("SendMessage", this.userId, this.text)
          .then(() => {
            console.log("Message sent successfully");
            this.text = ""; // Clear input field after sending message
          })
          .catch((error) => {
            console.error("Error sending message: ", error);
          });
      }
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
