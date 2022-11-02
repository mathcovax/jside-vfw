import Module from "../../module.js"
import { add } from "../index.js"
import fs from "fs"
import { ModuleDirectories, RootDirectories } from "../../directories.js"
import Root from "../../root.js"

export default async function modules(){
    if(!fs.existsSync(RootDirectories.root))fs.mkdirSync(RootDirectories.root)
    if(!fs.existsSync(RootDirectories.root + "/" + ModuleDirectories.name_folder_main_module))fs.mkdirSync(RootDirectories.root + "/" + ModuleDirectories.name_folder_main_module)
    console.log("Module :");
    await add.module(Root.addModule(new Module("")))
    for await(const folder of fs.readdirSync(RootDirectories.root)){
        if(!fs.lstatSync(RootDirectories.root + "/" + folder).isDirectory() || folder == ModuleDirectories.name_folder_main_module)continue
        console.log("Module " + folder + ":");
        await add.module(Root.addModule(new Module(folder)))
    }

    console.log(" ");
}