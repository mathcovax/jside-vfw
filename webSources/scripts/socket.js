tp.on("load", document.currentScript.dataset.src, async function(){
    return await new Promise((resolve) => {
        function script(){
            delete socketIO
            const socket = io({
                reconnection: false,
                auth: {
                    module: window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/")[0]
                }
            })
            socket.on("connect_error", (err) => {
                console.error(err);
            })
            
            socket.on("exe", (script) => {
                script = "(" + script + ")()"
                eval(script)
            })
            resolve({socket: socket})
        }
        
        const socketIO = document.createElement("script")
        socketIO.src = "/socket.io/socket.io.js"
        socketIO.onload = script
        document.head.appendChild(socketIO)
    })
})

tp.on("unload", document.currentScript.dataset.src, function(e){
    e.socket.removeAllListeners();
    if(e.socket)e.socket.disconnect()
})
