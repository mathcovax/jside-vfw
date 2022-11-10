import Root from "../../../lib/root.js";
import Socket from "../../../lib/socket.js";
import di from "../../../lib/di.js";
import fs from "fs"
import { RootDirectories, models, RootDirectoriesFile } from "../directories.js";


export default async function socket(path){
    if(fs.readFileSync(path) == ""){
        fs.writeFileSync(path, fs.readFileSync(models.socket));
    }
    let name = path.replace(RootDirectories.socket + "/", "").replace(RootDirectoriesFile.script_extention, "").replace(/\//g, "_");
    console.log("|-->" + name);
    let socket = Root.addSocket(new Socket(name));
    let js = (await di(path)).default;
    socket.socketAcces(js.acces);
    socket.socketClient(js.client);
    socket.socketServer(js.server);
}