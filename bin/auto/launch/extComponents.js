import fs from "fs"
import auto from "../index.js"
import { RootDirectories, RootDirectoriesFile } from "../directories.js";

export default function extComponents(){
    console.log("ExtComponent:");
    let extComponentPath = RootDirectories.extComponent
    if(!fs.existsSync(extComponentPath))fs.mkdirSync(extComponentPath);

    (function pathFindingExtComponents(dir){
        for (const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingExtComponents(dir + "/" + file)
            else if(file.endsWith(RootDirectoriesFile.page_extention)){
                auto.add.extComponent(dir + "/" + file)
            }
        }
    })(extComponentPath)

    console.log(" ");
}