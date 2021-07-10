const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require("path");
const mongoose = require('mongoose');
var cors = require('cors')
const { body, validationResult } = require('express-validator');

var corsOptions = {
    origin: 'http://localhost:3000/*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// app.use(app.use(cors(corsOptions)));
app.use(express.urlencoded());
app.use(express.json());
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

app.post("/login", cors(corsOptions), (request, response) => {
    // console.log(request.body);
    const name = request.body.name;
    Data(name, request, response);
});

async function Data(name, request, response) {
    console.log(name);
    // return response.send(name);
    let user = await User.findOne({ 'name': name });
    if (!user) {
        user = new User({ 'name': name, 'uuid': new Date().getTime() });
        user = await user.save();
    }
    console.log(user);
    return response.json(user);
}



server.listen(3000, () => {
    console.log('server running on port 3000...')
});