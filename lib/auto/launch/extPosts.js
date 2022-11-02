
import fs from "fs"
import { add } from "../index.js"
import { RootDirectories } from "../../directories.js";

export default async function extPosts(){
    console.log("ExtPOST:");
    let extPostPath = RootDirectories.extPost
    if(!fs.existsSync(extPostPath))fs.mkdirSync(extPostPath);

    await (async function pathFindingExtPost(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingExtPost(dir + "/" + file)
            else if(file.endsWith(".mjs")){
                add.extPost(dir + "/" + file)
            }
        }
    })(extPostPath)

    console.log(" ");
}