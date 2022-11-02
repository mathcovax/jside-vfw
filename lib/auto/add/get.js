import Page from "../../page.js"
import fs from "fs"
import { models, RootDirectoriesFile } from "../../directories.js";
import Module from "../../module.js";

/**
 * 
 * @param {Module} module
 */
export default function get(module, path){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.page))
    let name = "/" + path.replace(module.directories.get + "/", "").replace(RootDirectoriesFile.page_extention, "")
    module.addPage(new Page(name, path))
    console.log("|-->/" + module.name + name);
    module.get(name, (req, res, short) => {
        short.sp(name)
    })
}