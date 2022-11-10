import Module from "../../../lib/module.js";
import auto from "../index.js";
import fs from "fs";
import { ModuleDirectories, RootDirectories } from "../directories.js";
import Root from "../../../lib/root.js";

export default async function modules(){
    console.log("Module :");
    if(!fs.existsSync(RootDirectories.root))fs.mkdirSync(RootDirectories.root);
    if(!fs.existsSync(RootDirectories.root + "/" + ModuleDirectories.name_folder_main_module))fs.mkdirSync(RootDirectories.root + "/" + ModuleDirectories.name_folder_main_module);
    
    await auto.add.module(Root.addModule(new Module("")));
    for await(const folder of fs.readdirSync(RootDirectories.root)){
        if(!fs.lstatSync(RootDirectories.root + "/" + folder).isDirectory() || folder == ModuleDirectories.name_folder_main_module)continue;
        console.log("Module " + folder + ":");
        await auto.add.module(Root.addModule(new Module(folder)));
    }

    console.log(" ");
}