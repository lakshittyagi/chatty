const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require("path");
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chatty')
    .then(() => console.log('Connected…'))
    .catch(err => console.error('Connection failed…'));


// Defning a schema


const userSchema = new mongoose.Schema({
    name: String,
    uuid: String,
});
const messageSchema = new mongoose.Schema({
    text: String,
    user: userSchema
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);


io.on('connection', (socket) => {
    console.log('new user connected...');
    socket.emit('init', 'you are connected to the socket server');

    socket.on('sendMessage', (data, socket, callback) => {
        io.emit('messages', { message: data.message, user: data.user });
        storeMessage(data);
    });
});


async function storeMessage(data) {
    message = new Message({
        'text': data.message,
        'user': new User({
            'uuid': data.user.id,
            'name': data.user.name
        })
    });
    message = await message.save();
    console.log('message saved...');
}

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "./src/index.html"));
});

app.get("/login", (request, response) => {
    response.sendFile(path.join(__dirname, "./src/login.html"));
});



server.listen(3000, () => {
    console.log('server running on port 3000...')
});