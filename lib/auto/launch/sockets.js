import Socket from "../../socket.js"
import di from "../../di.js";
import { add } from "../index.js"
import fs from "fs"
import { RootDirectories, models } from "jside-vfw/lib/directories.js";
import Root from "jside-vfw/lib/root.js";

export default async function sockets(){
    console.log(" ");
    console.log("socket:");
    let socketPath = RootDirectories.socket
    if(!fs.existsSync(socketPath))fs.mkdirSync(socketPath);
    await (async function pathFindingSocket(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingSocket(dir + "/" + file)
            else if(file.endsWith(".mjs")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(models.socket))
                }
                let name = ((dir + "/").replace(socketPath + "/", "") + file.replace(".mjs", "")).replace(/\//g, "_")
                console.log("|-->" + name);
                let socket = new Socket(name)
                let js = (await di(dir + "/" + file)).default
                socket.socketAcces(js.acces)
                socket.socketClient(js.client)
                socket.socketServer(js.server)
                Root.addSocket(socket)
            }
        }
    })(socketPath)

    console.log(" ");
}