import fs from "fs"
import di from "../../../lib/di.js";
import { models, RootDirectoriesFile, ModuleDirectories } from "../directories.js";
import Module from "../../../lib/module.js";

/**
 * 
 * @param {Module} module
 */
export default async function post(module, path){
    let dir = ModuleDirectories.getModule(module.name);
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.post));
    let name = path.replace(dir.post + "/", "").replace(RootDirectoriesFile.script_extention, "").replace(/\//g, "-");
    console.log("|-->" + name);
    module.post(name, (await di(path)).default);
}