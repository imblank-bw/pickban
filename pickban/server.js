const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let teams = { team1: '', team2: '' };
let mapSelections = [];
let sideSelections = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('assignTeams', (data) => {
        teams.team1 = data.team1;
        teams.team2 = data.team2;
        io.emit('updateTeams', teams);
    });

    socket.on('selectMap', (data) => {
        mapSelections.push(data);
        io.emit('mapSelected', data);
    });

    socket.on('selectSide', (data) => {
        sideSelections.push(data);
        io.emit('sideSelected', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
