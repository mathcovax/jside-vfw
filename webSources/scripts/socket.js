tp.on("load", async function(){
    return await new Promise((resolve) => {
        function script(){
            delete socketIO
            const socket = io({
                reconnection: false,
                auth: {
                    module: loc.path[0],
                    href: window.location.href
                }
            })
            socket.on("connect_error", (err) => {
                console.error(err);
            })
            
            socket.on("exe", (script, fnc) => {
                script = "(" + script + ")()"
                eval(script)
                fnc()
            })
            pv = socket
            resolve({socket: socket})
        }
        
        const socketIO = document.createElement("script")
        socketIO.src = "/socket.io/socket.io.js"
        socketIO.onload = script
        document.head.appendChild(socketIO)
        socketIO.remove()
    })
})

tp.on("unload", function(e){
    e.socket.removeAllListeners();
    if(e.socket)e.socket.disconnect()
})