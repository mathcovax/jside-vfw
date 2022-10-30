
import Socket from "../../../lib/socket.js"
import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../../../")

export default async function extPost(path, root){
    console.log(" ");
    console.log("socket:");
    let socketPath = path + "/socket"
    if(!fs.existsSync(socketPath))fs.mkdirSync(socketPath);
    await (async function pathFindingSocket(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingSocket(dir + "/" + file)
            else if(file.endsWith(".mjs")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/socket.js"))
                }
                let name = ((dir + "/").replace(socketPath + "/", "") + file.replace(".mjs", "")).replace(/\//g, "_")
                console.log("|-->" + name);
                let socket = new Socket(name)
                let js = (await import("file:///" + dir + "/" + file)).default
                socket.socketAcces(js.acces)
                socket.socketClient(js.client)
                socket.socketServer(js.server)
                root.addSocket(socket)
            }
        }
    })(socketPath)
}