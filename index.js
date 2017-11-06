var httpd = require('http').createServer(handler)
var io = require('socket.io').listen(httpd)
var fs = require('fs')
var path = require('path')

httpd.listen(4000)

function handler(req, res) {
    fs.readFile(path.join(__dirname, '/index.html'), function(err, data) {
        if (err) {
            res.writeHead(500)
            return res.end('Error!')
        }
        res.writeHead(200)
        res.end(data)
    })
}

io.sockets.on('connection', function(socket) {
    socket.on('clientMessage', function(content) {
        // 自己
        socket.emit('serverMessage', 'You said: ' + content)
        // 发给其他用户(这个方法会排除发射方自身)
        socket.broadcast.emit('serverMessage', socket.id + ' said: ' + content)
    })
})

