import fs from "fs"
import { add } from "../index.js"
import { RootDirectories } from "../../directories.js";

export default function extComponents(){
    console.log("ExtComponent:");
    let extComponentPath = RootDirectories.extComponent
    if(!fs.existsSync(extComponentPath))fs.mkdirSync(extComponentPath);

    (function pathFindingExtComponents(dir){
        for (const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingExtComponents(dir + "/" + file)
            else if(file.endsWith(".html")){
                add.extComponent(dir + "/" + file)
            }
        }
    })(extComponentPath)

    console.log(" ");
}