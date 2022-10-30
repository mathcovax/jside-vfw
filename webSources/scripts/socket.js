function jsideIO(name){
    let socket = io({
        reconnection: false,
        auth: {
            name: name
        }
    })

    socket.on("connect_error", (err) => {
        console.error(err);
    })

    socket.on("exec", (script, fnc) => {
        script = "(function " + script + ")"
        eval(script)(socket)
        fnc()
    })

    return socket
}

function jsideIODelete(socket){
    socket.removeAllListeners()
    socket.disconnect()
}