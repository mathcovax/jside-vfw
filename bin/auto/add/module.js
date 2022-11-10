import Page from "../../../lib/page.js";
import Module from "../../../lib/module.js";
import di from "../../../lib/di.js";
import auto from "../index.js";
import fs from "fs";
import { models, ModuleDirectories, RootDirectoriesFile } from "../directories.js";

/**
 * 
 * @param {Module} module
 */
export default async function module(module){
    const dir = new ModuleDirectories(module.name);
    if(module.name != ""){
        if(!fs.existsSync(dir.component)){
            fs.mkdirSync(dir.component);
        }
        if(!fs.existsSync(dir.get)){
            fs.mkdirSync(dir.get);
        }
        if(!fs.existsSync(dir.post)){
            fs.mkdirSync(dir.post);
        }
        if(!fs.existsSync(dir.httpAcces)){
            fs.mkdirSync(dir.httpAcces);
        }
    }
    if(!fs.existsSync(dir.file.mainPage)){
        fs.writeFileSync(dir.file.mainPage, fs.readFileSync(models.page));
    }
    if(!fs.existsSync(dir.file.script)){
        fs.writeFileSync(dir.file.script, fs.readFileSync(models.js));
    }
    if(!fs.existsSync(dir.file.json)){
        fs.writeFileSync(dir.file.json, fs.readFileSync(models.json));
    }
    if(!fs.existsSync(dir.file.httpAcces)){
        fs.writeFileSync(dir.file.httpAcces, fs.readFileSync(models.httpAcces));
    }

    let json = JSON.parse(fs.readFileSync(dir.file.json));
    if(!json.pageRender)json.pageRender = {};
    module.json = json;
    module.httpAcces((await di(dir.file.httpAcces)).default);
    let js = await di(dir.file.script);
    js.default.before(module);

    if(module.name != ""){
        (async function pathFindingJson(dir){
            for(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingJson(dir + "/" + file);
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    auto.add.json(module, dir + "/" + file);
                }
            }
        })(dir.get);

        console.log("|");
        console.log("|Components:");
        (async function pathFindingComponents(dir){
            for(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())pathFindingComponents(dir + "/" + file);
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    auto.add.component(module, dir + "/" + file);
                }
            }
        })(dir.component);
    }

    console.log("|");
    console.log("|GET:");
    if(fs.readFileSync(dir.file.mainPage) != ""){
        if(!json.pageRender[module.name]){
            json.pageRender[module.name] = {pageTitle: "page name"};
            fs.writeFileSync(dir.file.json, JSON.stringify(json, null, 2));
            module.josn = json;
        }
        console.log("|-->/" + module.name);
        module.addPage(new Page(module.name, dir.file.mainPage));
        module.get("", (req, res, short) => {
            short.sp(module.name);
        });
    }

    if(module.name != ""){
        await (async function pathFindingGet(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingGet(dir + "/" + file);
                else if(file.endsWith(RootDirectoriesFile.page_extention)){
                    auto.add.get(module, dir + "/" + file);
                    await auto.add.httpAcces(module, (dir + "/" + file).replace(RootDirectoriesFile.page_extention, RootDirectoriesFile.script_extention).replace(ModuleDirectories.name_folder_module_get, ModuleDirectories.name_folder_module_httpAcces));
                }
            }
        })(dir.get);

        console.log("|");
        console.log("|POST:");
        await (async function pathFindingPost(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingPost(dir + "/" + file);
                else if(file.endsWith(RootDirectoriesFile.script_extention)){
                    await auto.add.post(module, dir + "/" + file);
                }
            }
        })(dir.post);
    }

    js.default.after(module);
    
    console.log("");
}