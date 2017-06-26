const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

let usersList = [];

io.on('connection', socket => {

    const currentUser = {
        id: null,
        pseudo: null
    };

    socket.on('setPseudo', pseudo => {
        console.log(`${pseudo} vient de se connecter`);

        currentUser.id = socket.id;
        currentUser.pseudo = pseudo;

        usersList.push(currentUser);

        socket.emit('usersList', usersList);
        socket.broadcast.emit('newUser', currentUser);

        socket.on('message', (message) => {
            socket.broadcast.emit('message', message)
        });

        socket.on('disconnect', function() {
            console.log(currentUser);
            console.log(`${pseudo} vient de se déconnecter`);
            socket.broadcast.emit('userDisconnected', currentUser);
            usersList.splice(usersList.indexOf(currentUser));
        });
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));