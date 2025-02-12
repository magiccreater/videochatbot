var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var api = require('./api');
var conn = function () {
    server.listen(65080);
    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
    });
};
var fromClient = function () {
    io.on('connection', function (socket) {
        socket.on('fromClient', function (data) {
            api.getRes(data.client).then(function (res) {
                socket.emit('fromServer', { server: res });
            });
        });
    });
}
module.exports = { conn, fromClient }