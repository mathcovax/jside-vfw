import { Server, Socket,  } from "socket.io"

export default {
    /**
     * @param {Socket} socket
     * @return {Boolean}
     */
    acces(socket){
        return false
    },

    /**
     * @param {Socket} socket 
     */
    client(socket){

    },

    /**
     * 
     * @param {Socket} socket 
     * @param {Server} io 
     */
    server(socket, io){

    }
}