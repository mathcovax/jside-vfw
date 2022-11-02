import fs from "fs"
import { RootDirectoriesFile } from "../../directories.js";
import Module from "../../module.js";

/**
 * 
 * @param {Module} module
 */
export default function json(module, path){
    let name = "/" + path.replace(module.directories.get + "/", "").replace(RootDirectoriesFile.page_extention, "")
    if(!module.json.pageRender[name]){
        module.json.pageRender[name] = {pageTitle: "page name"}
        fs.writeFileSync(module.directories.file.json, JSON.stringify(module.json, null, 2))
    }
}