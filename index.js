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
        var room = socket.room || ''
        if (room) {
            socket.broadcast.to(room)
        }
        // 发给其他用户(这个方法会排除发射方自身)
        socket.broadcast.emit('serverMessage', socket.username + ' said: ' + content)
        socket.emit('serverMessage', 'You said: ' + content)
    })

    // 客户端发射login事件，服务端获取到用户名，然后广播用户登录
    socket.on('login', function(username) {
        socket.username = username
        // 设置用户名
        socket.emit('serverMessage', 'Now logged in as ' + username)
        socket.broadcast.emit('serverMessage', 'User ' + username + ' logged in')
    })
    // 给客户端发射login事件，这样客户端就会提示用户输入登录名
    socket.emit('login')
    socket.on('disconnecting', function() {
        // 获取用户名
        var username = socket.username || socket.id
        socket.broadcast.emit('serverMessage', 'User ' + username + ' disconnected')
    })

    socket.on('join', function(room) {
        var oldRoom = socket.room
        socket.room = room
        socket.join(room)
        if (oldRoom) {
            socket.leave(oldRoom)
        }
        var username = socket.username || socket.id
        socket.emit('serverMessage', 'you joined room :' + room)
        socket.broadcast.to(room).emit('serverMessage', 'User ' + username + ' joined this room')
    })
})



