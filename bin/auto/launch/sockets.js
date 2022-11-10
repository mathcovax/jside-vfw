import fs from "fs"
import { RootDirectories, RootDirectoriesFile } from "../directories.js";
import Root from "../../../lib/root.js";
import auto from "../index.js";

export default async function sockets(){
    if(Root.io !== true)return
    console.log("socket:");
    let socketPath = RootDirectories.socket
    if(!fs.existsSync(socketPath))fs.mkdirSync(socketPath);
    await (async function pathFindingSocket(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingSocket(dir + "/" + file)
            else if(file.endsWith(RootDirectoriesFile.script_extention)){
                await auto.add.socket(dir + "/" + file)
            }
        }
    })(socketPath)

    console.log(" ");
}