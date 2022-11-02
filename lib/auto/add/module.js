import Page from "../../page.js"
import Module from "../../module.js"
import di from "../../di.js"
import { add } from "../index.js"
import fs from "fs"
import { models, ModuleDirectories, RootDirectoriesFile } from "../../directories.js";

/**
 * 
 * @param {Module} module
 */
export default async function module(module){
    if(module.name != ""){
        if(!fs.existsSync(module.directories.component)){
            fs.mkdirSync(module.directories.component)
        }
        if(!fs.existsSync(module.directories.get)){
            fs.mkdirSync(module.directories.get)
        }
        if(!fs.existsSync(module.directories.post)){
            fs.mkdirSync(module.directories.post)
        }
        if(!fs.existsSync(module.directories.httpAcces)){
            fs.mkdirSync(module.directories.httpAcces)
        }
    }
    if(!fs.existsSync(module.directories.file.mainPage)){
        fs.writeFileSync(module.directories.file.mainPage, fs.readFileSync(models.page))
    }
    if(!fs.existsSync(module.directories.file.script)){
        fs.writeFileSync(module.directories.file.script, fs.readFileSync(models.index))
    }
    if(!fs.existsSync(module.directories.file.json)){
        fs.writeFileSync(module.directories.file.json, fs.readFileSync(models.json))
    }
    if(!fs.existsSync(module.directories.file.httpAcces)){
        fs.writeFileSync(module.directories.file.httpAcces, fs.readFileSync(models.httpAcces))
    }

    let json = JSON.parse(fs.readFileSync(module.directories.file.json))
    if(!json.pageRender)json.pageRender = {}
    module.json = json
    module.httpAcces((await di(module.directories.file.httpAcces)).default)
    let js = await di(module.directories.file.script)
    js.default.before(module);

    if(module.name != ""){
        (async function pathFindingJson(dir){
            for(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingJson(dir + "/" + file)
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    add.json(module, dir + "/" + file)
                }
            }
        })(module.directories.get)

        console.log("|");
        console.log("|Components:");
        (async function pathFindingComponents(dir){
            for(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingComponents(dir + "/" + file)
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    add.component(module, dir + "/" + file)
                }
            }
        })(module.directories.component)
    }

    console.log("|");
    console.log("|GET:");
    if(fs.readFileSync(module.directories.file.mainPage) != ""){
        if(!json.pageRender[module.name]){
            json.pageRender[module.name] = {pageTitle: "page name"}
            fs.writeFileSync(module.directories.file.json, JSON.stringify(json, null, 2))
            module.josn = json
        }
        console.log("|-->/" + module.name);
        module.addPage(new Page(module.name, module.directories.file.mainPage))
        module.get("", (req, res, short) => {
            short.sp(module.name)
        })
    }

    if(module.name != ""){
        await (async function pathFindingGet(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingGet(dir + "/" + file)
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    add.get(module, dir + "/" + file)
                    await add.httpAcces(module, (dir + "/" + file).replace(RootDirectoriesFile.page_extention, RootDirectoriesFile.script_extention).replace(ModuleDirectories.name_folder_module_get, ModuleDirectories.name_folder_module_httpAcces))
                }
            }
        })(module.directories.get)

        console.log("|");
        console.log("|POST:");
        await (async function pathFindingPost(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingPost(dir + "/" + file)
                else if(file.endsWith(RootDirectoriesFile.script_extention)){
                    await add.post(module, dir + "/" + file)
                }
            }
        })(module.directories.post)
    }

    js.default.after(module)
    
    console.log("");
}