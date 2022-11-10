import fs from "fs";
import di from "../../../lib/di.js";
import { models, RootDirectoriesFile, ModuleDirectories } from "../directories.js";

export default async function httpAcces(module, path){
    let dir = ModuleDirectories.getModule(module.name);
    let name = "/" + path.replace(dir.get + "/", "").replace(RootDirectoriesFile.page_extention, "");
    if(fs.existsSync(path) && fs.readFileSync(path) == "") fs.writeFileSync(path, fs.readFileSync(models.subHttpAcces));
    if(fs.existsSync(path)){
        console.log("|-->Acces:" + name);
        module.getHttpAcces(name, (await di(path)).default);
    }
}