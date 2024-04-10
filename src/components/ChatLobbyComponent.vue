<script setup>

import { QChatMessage } from 'quasar'
import { QIcon } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)


</script>

<template >
  <div ref="scrollContainer" class="q-pa-md row scroll text-dark" style="height:36.69vmax;"  >
    <div  v-for="(message, index) in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        name="Me"
        :size= "messageSize[index]"
        sent
        :stamp="[message.sendAt]"
        v-if="message.sender === this.user "
      >
        <template v-slot:avatar >
          <q-avatar color="pink-3" text-color="white"  class="q-message-avatar q-message-avatar--sent">
            {{ generateAvatarFromName(this.user) }}
          </q-avatar>
        </template>
      <div>
        <span v-html="message.content" ></span>
      </div>
      </q-chat-message>
      <q-chat-message v-else
        :name="[message.sender]"
        :size = "messageSize[index]"
        :stamp="[message.sendAt]" 
      >
      <template v-slot:avatar >
          <q-avatar color="primary" text-color="white"   class="q-message-avatar q-message-avatar--received">
            {{ generateAvatarFromName(message.sender) }}
          </q-avatar>
      </template>
        <div>
          <span v-html="message.content" ></span>
        </div>
      </q-chat-message>
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessage" style="width: 100%;"  label="Type your message" :dense="dense">
        <template v-slot:before>
          <q-avatar color="pink-3" text-color="white">
            {{ generateAvatarFromName(this.user) }}
          </q-avatar>
        </template>
        <template v-slot:append>
          <div v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </div>
          <div class="q-pa-md cursor-pointer" >
            <div>
                <q-avatar class="cursor-pointer" style="width: 50px; height: 50px; z-index: 100;">
                  <font-awesome-icon :icon="['fas', 'image']" @click="openFileDialog" />
                </q-avatar>
            </div>
          </div>
        </template>

        <template v-slot:after>
          <div round dense flat @click="sendMessage" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
          </div>
        </template>
    </q-input>
    <input ref="fileInput" id="fileInput" type="file" style="display: none" @change="handleFileSelection">
  </div>
  
</template>

<script>
  import * as signalR from "@aspnet/signalr";
  import  axios  from 'axios'
export default {
    name: 'ChatLobbyComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      messageSize: [], 
      uploadFile:{
        file: '',
        fromUserId:''
      }
    };
   
  },
  created() {
    this.initSignalRConnection();
  },
  mounted() {
    this.getUser();
  },
  methods: {
    openFileDialog() {
      console.log("Opening file dialog");
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      } else {
        console.log("File input not found");
      }
    },
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
        this.listenForMessages();
        this.getHistory();
        this.listenForChatHistory();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    getHistory() {
      this.connection.invoke("GetChatHistoryLobby")
      .catch((error) => {
        console.error("Error getting chat history: ", error);
      });
    },
    listenForChatHistory() {
      this.connection.on("ReceiveChatHistoryLobby", (messages) => {
        messages.forEach(message => {
          const elapsedTime = this.calculateElapsedTime(message.sendAt);
         
          this.messages.push({
            sender: message.fromUser,
            content: message.content,
            id: message.id,
            sendAt: elapsedTime
          });
        });

        this.calculateMessageSize();
        this.scrollToBottom();
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
    calculateMessageSize() {
      this.messages.forEach(message => {
        let size = 1;
        
        if (typeof message.content === 'string') {
          const content = message.content.trim(); 
         
          const hasImgTag = /<img.*?>/.test(message.content);
          const hasATag = /<a.*?>/.test(message.content);
          
          if (hasImgTag) {
            size = 1.5; 
          }else if(hasATag){
            size = 4;
          } else if (!hasATag && !hasImgTag) {
            if (content.length < 50) {
              size = 1.5;
            } else if (content.length < 100) {
              size = 3;
            } else {
              size = 5;
            }
          }
        }
        this.messageSize.push(size);
      });
    },
     //còn lỗi chỉnh kích thước tin nhắn phần gửi đi này!!!!!
    listenForMessages() {
      console.log("Listening for messages");
      this.connection.on("ReceiveMessage", (message) => {
        const elapsedTime = this.calculateElapsedTime(message.sendAt);
        this.messages.push( {sender: message.fromUser, content: message.content, sendAt: elapsedTime} );
        this.scrollToBottom();
        this.calculateMessageSize();
      });
    },
    sendMessage() {
      if (this.text.trim() !== "") {
        console.log("Sending message: ", this.text);
        this.connection.invoke("SendMessage", this.userId, this.text)
          .then(() => {
            console.log("Message sent successfully");
            this.text = ""; // Clear input field after sending message
            this.getLastMessageInLobby();
          })
          .catch((error) => {
            console.error("Error sending message: ", error);
          });
      }
    },
    handleFileSelection(event) {
      const selectedFile = event.target.files[0];
      console.log(selectedFile);
      this.uploadFile.file = selectedFile;
      this.uploadFile.fromUserId = this.userId;
      axios.post('https://localhost:7014/api/Uploads/UploadToLobby', this.uploadFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log(response.data);
        this.text = response.data;
        console.log(this.text);
        this.text = '';
        // this.listenForMessages();
        this.scrollToBottom();
      }).catch(error => {
        console.error('Error uploading file: ', error);
      });
    },
    getLastMessageInLobby(){
        this.connection.invoke("GetLastMessageInLobby")
        .catch((error) => {
          console.error("Error getting last message in lobby: ", error);
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

<style>
.post-image {
    width: 20vmax !important;
}
</style>