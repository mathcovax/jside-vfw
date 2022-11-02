import fs from "fs"
import di from "../../di.js";
import { models, RootDirectoriesFile } from "../../directories.js";

export default async function httpAcces(module, path){
    let name = "/" + path.replace(module.directories.get + "/", "").replace(RootDirectoriesFile.page_extention, "")
    if(fs.existsSync(path) && fs.readFileSync(path) == "") fs.writeFileSync(path, fs.readFileSync(models["sub-httpAcces"]))
    if(fs.existsSync(path)){
        console.log("|-->Acces:" + name);
        module.getHttpAcces(name, (await di(path)).default)
    }
}