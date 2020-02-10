
// SAMPLE SOCKET.IO CHAT APP FOR LETTING CLIENTS TALK TO EACH OTHER THROUGH SOCKET.IO SERVER

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/socket_io_client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(3000, function () {
    console.log('Frt Sample Chat App is listening on port 3000!');
});

var io = require('socket.io')(serv, {});

// GLOBAL VARIABLES FOR THE SOCKET APP
var userList = [], userId = 0;
var messages = [];
var chatId = Date.now();

io.sockets.on('connection', function (socket) {
    console.log('socket connected: ', socket.id);
    userId++;

    socket.emit('myNewConnection', { // message to only myself
        msg: "I joined the chat",
        chatId: chatId,
        userId: userId
    });

    socket.broadcast.emit('newConnection', { // message to all except me
        msg: "someone else joined the chat"
    });

    io.sockets.emit('messageList', { // message to all including me
        messages: messages
    });

    io.sockets.emit('userList', {
        userList: userList
    });

    //console.log(socket);
    socket.on('addUser', function (me) {
        me.socketId = this.id;
        console.log("addUser event triggered: " + JSON.stringify(me));
        userList.push(me);
        console.log('Num Of Users:', userList.length);
        io.sockets.emit('userList', {
            userList: userList
        });
    });

    socket.on('typingStarted', function (who) {
        socket.broadcast.emit('addTyper', who); // to all (except me)
        //io.sockets.emit('addTyper', who); // to all
    });

    socket.on('typingEnded', function (who) {
        socket.broadcast.emit('removeTyper', who); // to all (except me)
        //io.sockets.emit('removeTyper', who); // to all
    });

    socket.on('messageSent', function (msg) {
        console.log("messageSent event triggered: " + msg.messageText);
        messages.push(msg);
        io.sockets.emit('messageList', {
            messages: messages
        });
    });

    socket.on('disconnect', function () {
        console.log('socket disconnected: ', this.id);
        var userIndex;
        for (var i = 0; i < userList.length; i++) {
            if (userList[i].socketId == this.id) { userIndex = i; }
        }
        userList.splice(userIndex, 1); // delete disconnected user from the list
        io.sockets.emit('userList', { userList: userList });
        console.log('Num Of Users:', userList.length);
    });
});