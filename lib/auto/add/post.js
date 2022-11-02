import fs from "fs"
import di from "../../di.js";
import { models, RootDirectoriesFile } from "../../directories.js";
import Module from "../../module.js";

/**
 * 
 * @param {Module} module
 */
export default async function post(module, path){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.post))
    let name = path.replace(module.directories.post + "/", "").replace(RootDirectoriesFile.script_extention, "").replace(/\//g, "-")
    console.log("|-->" + name);
    module.post(name, (await di(path)).default)
}