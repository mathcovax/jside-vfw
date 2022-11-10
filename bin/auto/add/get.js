import Page from "../../../lib/page.js";
import fs from "fs";
import { models, RootDirectoriesFile, ModuleDirectories } from "../directories.js";
import Module from "../../../lib/module.js";

/**
 * 
 * @param {Module} module
 */
export default function get(module, path){
    let dir = ModuleDirectories.getModule(module.name);
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.page));
    let name = "/" + path.replace(dir.get + "/", "").replace(RootDirectoriesFile.page_extention, "");
    module.addPage(new Page(name, path));
    if(!name.split("/").pop().startsWith(RootDirectoriesFile.char_file_ignore_get)){
        console.log("|-->/" + module.name + name);
        module.get(name, (req, res, short) => {
            short.sp(name);
        })
    }
}