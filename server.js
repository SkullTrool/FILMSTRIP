
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

      socket.emit('message', formatMessage(ADMIN, "Welcome to ChatApp!" )) // Welcome for user

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



const PORT = 80 || process.env.PORT

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
