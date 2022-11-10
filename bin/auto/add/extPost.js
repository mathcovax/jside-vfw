import fs from "fs";
import di from "../../../lib/di.js";
import { RootDirectories, RootDirectoriesFile, models } from "../directories.js";
import Root from "../../../lib/root.js";

export default async function extPost(path){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(models.extPost));
    let name = path.replace(RootDirectories.extPost + "/", "").replace(RootDirectoriesFile.script_extention, "").replace(/\//g, "-");
    console.log("|-->" + name);
    Root.addExtPost(name, (await di(path)).default);
}