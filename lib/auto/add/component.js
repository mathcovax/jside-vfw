import Component from "../../component.js"
import Module from "../../module.js";
import fs from "fs"
import { models, RootDirectoriesFile } from "../../directories.js";

/**
 * 
 * @param {Module} module
 */
export default function component(module, path){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.component))
    let name = path.replace(module.directories.component + "/", "").replace(RootDirectoriesFile.page_extention, "").replace(/\//g, ".")
    console.log("|-->" + name);
    module.addComponent(new Component(name, path))
}