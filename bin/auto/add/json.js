import fs from "fs";
import { RootDirectoriesFile, ModuleDirectories } from "../directories.js";
import Module from "../../../lib/module.js";

/**
 * 
 * @param {Module} module
 */
export default function json(module, path){
    let dir = ModuleDirectories.getModule(module.name);
    let name = "/" + path.replace(dir.get + "/", "").replace(RootDirectoriesFile.page_extention, "");
    if(!module.json.pageRender[name]){
        module.json.pageRender[name] = {pageTitle: "page name"};
        fs.writeFileSync(dir.file.json, JSON.stringify(module.json, null, 2));
    }
}