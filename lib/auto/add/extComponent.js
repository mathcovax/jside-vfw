import Component from "../../component.js"
import fs from "fs"
import { RootDirectories, RootDirectoriesFile, models } from "../../directories.js";
import Root from "../../root.js";

export default function extComponent(path){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.extComponent))
    let name = path.replace(RootDirectories.extComponent + "/", "").replace(RootDirectoriesFile.page_extention, "").replace(/\//g, ".")
    console.log("|-->" + name);
    Root.addExtComponent(new Component(name, path))
}