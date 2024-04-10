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
    <div v-for="(message, index) in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        name="Me"
        :size="messageSize[index]"
        sent
        :stamp="[message.sendAt]"
        v-if="message.sender === this.user"
      >
        <template v-slot:avatar >
            <q-avatar color="pink-3" text-color="white"  class="q-message-avatar q-message-avatar--sent">
              {{ generateAvatarFromName(this.user) }}
            </q-avatar>
          </template>
        <div>
          <!-- <template v-for="(element, index) in message.content">
            <span v-if="typeof element === 'string'">{{ element }}</span>
            <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
          </template> -->
          <span v-html="message.content" ></span>
        </div>
      </q-chat-message>
      <q-chat-message v-else
        :name="[message.sender]"
        :size="messageSize[index]"
        :stamp="[message.sendAt]" 
      >
        <template v-slot:avatar >
            <q-avatar color="primary" text-color="white"   class="q-message-avatar q-message-avatar--received">
              {{ generateAvatarFromName(message.sender) }}
            </q-avatar>
        </template>
        <div>
          <!-- <template v-for="(element, index) in message.content">
            <span v-if="typeof element === 'string'">{{ element }}</span>
            <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
          </template> -->
          <span v-html="message.content" ></span>
        </div>
      </q-chat-message>
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessagePrivate" style="width: 100%;"  label="Type your message" :dense="dense">
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
          <div round dense flat @click="sendMessagePrivate" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
          </div>
        </template>
    </q-input>
    <input ref="fileInput" id="fileInput" type="file" style="display: none" @change="handleFileSelection">
  </div>
  
</template>

<script>
  import * as signalR from "@aspnet/signalr";
  import axios from 'axios';
export default {
    name: 'ChatPrivateComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      now: Date.now(),
      messageSize: [], 
      uploadFile:{
        file: '',
        fromUserId:'',
        toUserId: '',
      }
    };
   
  },
  created() {
    this.initSignalRConnection();
  },
  mounted() {
    this.getUser();
    // this.room.id = this.$route.params.id;
    // this.getHistoryChatPrivate(this.userId, this.$route.params.id);
  },
  watch: {
            '$route.params.id': function(newId) {
                this.getHistoryChatPrivate(this.userId, newId);
                this.messages = [];
            },
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
        this.listenForReceive(this.userId);
        this.getHistoryChatPrivate(this.userId, this.$route.params.id);
        this.listenForHistoryChatPrivate();
        // this.listonForConnet();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    // listonForConnet(){
    //   this.connection.on("ReceiveMessageConnect", (message) => {
    //     console.log(message);
    //   });
    // },
    listenForMessages() {
      this.connection.on("ReceiveMessagePrivate", (message) => {
        const elapsedTime = this.calculateElapsedTime(message.sendAt);
        // let messageContent = message.content;

        // const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

        // // Kiểm tra nếu tin nhắn chứa hình ảnh
        // const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
        // let match;
        // let lastIndex = 0;

        // while ((match = imageRegex.exec(messageContent)) !== null) {
        //   // Thêm văn bản trước hình ảnh (nếu có)
        //   if (match.index > lastIndex) {
        //     messageElements.push(messageContent.substring(lastIndex, match.index));
        //   }
        //   // Thêm hình ảnh
        //   messageElements.push({ type: 'emoji', src: match[1] });
        //   lastIndex = imageRegex.lastIndex;
        // }
        // // Thêm văn bản cuối cùng (nếu có)
        // if (lastIndex < messageContent.length) {
        //   messageElements.push(messageContent.substring(lastIndex));
        // }
        this.messages.push( {sender:message.fromUser,content:message.content, sendAt: elapsedTime} );
        console.log(message);
        this.scrollToBottom();
        this.calculateMessageSize();
      });
    },
    listenForReceive(receiveId){
        this.connection.on("ReceiveMessagePrivate" + receiveId, (message) => {
            const elapsedTime = this.calculateElapsedTime(message.sendAt);
            // let messageContent = message.content;

            // const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

            // // Kiểm tra nếu tin nhắn chứa hình ảnh
            // const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
            // let match;
            // let lastIndex = 0;

            // while ((match = imageRegex.exec(messageContent)) !== null) {
            //   // Thêm văn bản trước hình ảnh (nếu có)
            //   if (match.index > lastIndex) {
            //     messageElements.push(messageContent.substring(lastIndex, match.index));
            //   }
            //   // Thêm hình ảnh
            //   messageElements.push({ type: 'emoji', src: match[1] });
            //   lastIndex = imageRegex.lastIndex;
            // }
            // // Thêm văn bản cuối cùng (nếu có)
            // if (lastIndex < messageContent.length) {
            //   messageElements.push(messageContent.substring(lastIndex));
            // }
            this.messages.push( {sender:message.fromUser, content:message.content, sendAt: elapsedTime} );
            console.log(this.messages);
            this.scrollToBottom();
            this.calculateMessageSize();
        });
    },
    handleFileSelection() {
      // const selectedFile = event.target.files[0];
      const selectedFile = this.$refs.fileInput.files[0];
      console.log(selectedFile);
      this.uploadFile.file = selectedFile;
      this.uploadFile.fromUserId = this.userId;
      this.uploadFile.toUserId = this.$route.params.id;
      axios.post('https://localhost:7014/api/Uploads/UploadToUser', this.uploadFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log(response.data);
        this.text = response.data;
        console.log(this.text);
        // this.sendMessage();
        this.text = '';
        this.listenForMessages();
        this.scrollToBottom();
      }).catch(error => {
        console.error('Error uploading file: ', error);
      });
    },
    sendMessagePrivate() {
        try {
            if (this.text.trim() !== "") {
                console.log("Sending message to room...");
                this.connection.invoke("SendPrivate", this.userId,this.$route.params.id, this.text)
                    .then(() => {
                        console.log("Message sent successfully");
                        this.text = ""; // Clear input field after sending message
                        this.getLastMessagePrivate(this.userId, this.$route.params.id);
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
    getLastMessagePrivate(senderId, receiverId){
        this.connection.invoke("GetLastMessagePrivate", senderId, receiverId)
        .catch((error) => {
          console.error("Error getting last message in private: ", error);
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
    calculateMessageSize() {
      // this.messages.forEach(message => {
      //   let size = 1; 
      //   message.content.forEach(item => {
      //     if (typeof item === 'string') {
      //       const itemLength = item.length;
      //       if (itemLength < 50) {
      //         size = 1.5; 
      //       } else if (itemLength < 100) {
      //         size = 3; 
      //       } else {
      //         size = 5; 
      //       }
      //     } else if (item && item.type === 'emoji') {
      //         size = 1.5;
      //     }
      //   });
      //   // Thêm kích thước vào mảng messageSize
      //   this.messageSize.push(size);
      // });
      this.messages.forEach(message => {
        let size = 1;
        
        // Kiểm tra nếu content là chuỗi string
        if (typeof message.content === 'string') {
          const content = message.content.trim(); // Loại bỏ khoảng trắng thừa
         
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
    getHistoryChatPrivate(senderId, receiveId){
        this.connection.invoke("GetHistoryChatPrivate", senderId, receiveId)
        .catch((error) => {
            console.error("Error getting chat history: ", error);
        });
    },
    listenForHistoryChatPrivate(){
        this.connection.on("ReceiveChatHistoryPrivate", (messages) => {
            // Cập nhật dữ liệu lịch sử chat
            messages.forEach(message => {
                const elapsedTime = this.calculateElapsedTime(message.sendAt);
                // let messageContent = message.content;

                // const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

                // // Kiểm tra nếu tin nhắn chứa hình ảnh
                // const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
                // let match;
                // let lastIndex = 0;

                // while ((match = imageRegex.exec(messageContent)) !== null) {
                //   // Thêm văn bản trước hình ảnh (nếu có)
                //   if (match.index > lastIndex) {
                //     messageElements.push(messageContent.substring(lastIndex, match.index));
                //   }
                //   // Thêm hình ảnh
                //   messageElements.push({ type: 'emoji', src: match[1] });
                //   lastIndex = imageRegex.lastIndex;
                // }

                // // Thêm văn bản cuối cùng (nếu có)
                // if (lastIndex < messageContent.length) {
                //   messageElements.push(messageContent.substring(lastIndex));
                // }

                this.messages.push( {sender:message.fromUser, content: message.content, sendAt: elapsedTime});
            });
            this.scrollToBottom();
            this.calculateMessageSize();
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
      } else if(minutesElapsed > 0) {
          return `${minutesElapsed} minutes ago`;
      } else if (secondsElapsed == 0){
          return `Just now`;
      } else if (secondsElapsed == 1){
          return `${secondsElapsed} second ago`;
      } else if (secondsElapsed > 1){
          return `${secondsElapsed} seconds ago`;
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
