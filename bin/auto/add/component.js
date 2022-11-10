import Component from "../../../lib/component.js";
import Module from "../../../lib/module.js";
import fs from "fs";
import { models, RootDirectoriesFile, ModuleDirectories } from "../directories.js";

/**
 * 
 * @param {Module} module
 */
export default function component(module, path){
    let dir = ModuleDirectories.getModule(module.name);
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.component));
    let name = path.replace(dir.component + "/", "").replace(RootDirectoriesFile.page_extention, "").replace(/\//g, ".");
    console.log("|-->" + name);
    module.addComponent(new Component(name, path));
}