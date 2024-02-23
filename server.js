
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./public/utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./public/utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const ADMIN = 'Admin'


app.get('/favicon.ico', (req, res) => res.status(204));

app.use(express.static(path.join(__dirname, 'public')));



io.on('connection', socket => {
   const typingUsers = {};

   socket.on('joinRoom', ({ username, room }) => {

      const user = userJoin(socket.id, username, room)

      socket.join(user.room)

      io.to("FilmNews").emit('message', formatMessage(ADMIN, "Welcome to FilmNews - this chat room is designed to discuss the latest film industry news!" ));
      io.to("RecentReleases").emit('message', formatMessage(ADMIN, "Welcome to RecentReleases - this chat room is for discussing the latest cinema releases!" ));
      io.to("Rumours").emit('message', formatMessage(ADMIN, "Welcome to Rumours - this chat room is for discussing rumours in the film world!" ));
      io.to("Retrospective").emit('message', formatMessage(ADMIN, "Welcome to Retrospective - This chat is created to discuss old iconic franchises and in general, a look into the past of the film world!" ));
      io.to("Serials").emit('message', formatMessage(ADMIN, "Welcome to Serials - This chat is created to discuss TV series!" ));
      io.to("Films").emit('message', formatMessage(ADMIN, "Welcome to Films - this chat is created to discuss films!" ));
      io.to("Cartoons").emit('message', formatMessage(ADMIN, "Welcome to Cartoons - this chat room is for discussing cartoons!" ));

      socket.emit('message', formatMessage(ADMIN, "Please observe the following rules when communicating in chat: be polite and respect other participants, avoid foul language and insults, support the topic of conversation, do not spread false information, respect privacy and do not share personal data, avoid spam. Thank you for your understanding and respect for the rules of the chat!" )) // Welcome for user

      socket.broadcast.to(user.room).emit('message', formatMessage(ADMIN, `${user.username} has joined the room`)); // User connects for all people

      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room)
      })
      
      socket.on('startTyping', () => {
         const user = getCurrentUser(socket.id);
         if (user) {
            typingUsers[user.id] = true;
      
            setTimeout(() => {
               if (typingUsers[user.id]) {
                  socket.to(user.room).emit('typing', `${user.username} is typing...`);
               }
            }, 1000);
         }
      });
      
      socket.on('stopTyping', () => {
         const user = getCurrentUser(socket.id);
         if (user) {
            typingUsers[user.id] = false;
            socket.to(user.room).emit('typing', '');
         }
      });

})

   socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id)

      io.to(user.room).emit('message', formatMessage(user.username, msg))
   })
   
      socket.on('disconnect', () => {
         const user = getCurrentUser(socket.id)
         userLeave(socket.id)

         if (user) {
            io.to(user.room).emit('message', formatMessage(ADMIN, `${user.username} has left the room`))

            io.to(user.room).emit('roomUsers', {
               room: user.room,
               users: getRoomUsers(user.room)
           })

      }
   }) // User disconnects

});



const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
