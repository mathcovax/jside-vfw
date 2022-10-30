
import Component from "../../../lib/component.js"
import Page from "../../../lib/page.js"
import Module from "../../../lib/module.js"
import addGet from "./addGet.js"
import addJson from "./addJson.js"
import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../../../")

export default async function module(path, folder, root){
    console.log("Module " + folder + ":");
    if(folder != "$"){
        if(!fs.existsSync(path + "/" + folder + "/component")){
            fs.mkdirSync(path + "/" + folder + "/component")
        }
        if(!fs.existsSync(path + "/" + folder + "/get")){
            fs.mkdirSync(path + "/" + folder + "/get")
        }
        if(!fs.existsSync(path + "/" + folder + "/post")){
            fs.mkdirSync(path + "/" + folder + "/post")
        }
        if(!fs.existsSync(path + "/" + folder + "/httpAcces")){
            fs.mkdirSync(path + "/" + folder + "/httpAcces")
        }
    }
    if(!fs.existsSync(path + "/" + folder + "/" + folder + ".html")){
        fs.writeFileSync(path + "/" + folder + "/" + folder + ".html", fs.readFileSync(root.models.page))
    }
    if(!fs.existsSync(path + "/" + folder + "/" + folder + ".mjs")){
        fs.writeFileSync(path + "/" + folder + "/" + folder + ".mjs", fs.readFileSync(__dirname + "/models/index.js"))
    }
    if(!fs.existsSync(path + "/" + folder + "/" + folder + ".json")){
        fs.writeFileSync(path + "/" + folder + "/" + folder + ".json", fs.readFileSync(__dirname + "/models/json.json"))
    }
    if(!fs.existsSync(path + "/" + folder + "/httpAcces.mjs")){
        fs.writeFileSync(path + "/" + folder + "/httpAcces.mjs", fs.readFileSync(__dirname + "/models/httpAcces.js"))
    }

    let js = await import("file:///" + path + "/" + folder + "/" + folder + ".mjs")
    let module = root.addModule(new Module(folder=="$"?"":folder))
    let json = JSON.parse(fs.readFileSync(path + "/" + folder + "/" + folder + ".json"))
    if(!json.pageRender)json.pageRender = {}
    module.json = json
    module.httpAcces((await import("file:///" + path + "/" + folder + "/httpAcces.mjs")).default)
    js.default.before(root, module);

    if(folder != "$"){
        await (async function pathFindingJson(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingJson(dir + "/" + file)
                else if(file.endsWith(".html")){
                    addJson(module, dir + "/" + file, path + "/" + folder + "/get", path + "/" + folder + "/" + folder + ".json")
                }
            }
            for(const page in module.json.pageRender){
                if(!fs.existsSync(path + "/" + folder + "/get" + page + ".html") && Object.keys(module.json.pageRender[page]).length === 0 && page !== folder){
                    delete module.json.pageRender[page]
                    fs.writeFileSync(path + "/" + folder + "/" + folder + ".json", JSON.stringify(module.json, null, 2))
                }
            }
        })(path + "/" + folder + "/get")
    }


    if(folder != "$"){
        console.log("|");
        console.log("|Components:");
        await (async function pathFindingComponents(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingComponents(dir + "/" + file)
                else if(file.endsWith(".html")){
                    if(fs.readFileSync(dir + "/" + file) == ""){
                        fs.writeFileSync(dir + "/" + file, fs.readFileSync(root.models.component))
                    }
                    let name = ((dir + "/").replace(path + "/" + folder + "/component/", "") + file.replace(".html", "")).replace(/\//g, ".")
                    console.log("|-->" + name);
                    module.addComponent(new Component(name, dir + "/" + file))
                }
            }
        })(path + "/" + folder + "/component")
    }

    console.log("|");
    console.log("|GET:");
    if(fs.readFileSync(path + "/" + folder + "/" + folder + ".html") != ""){
        if(!json.pageRender[folder]){
            json.pageRender[folder] = {pageTitle: "page name"}
            fs.writeFileSync(path + "/" + folder + "/" + folder + ".json", JSON.stringify(json, null, 2))
            module.josn = json
        }
        console.log("|-->/" + folder);
        module.addPage(new Page(folder, path + "/" + folder + "/" + folder + ".html"))
        module.get("", (req, res, short) => {
            short.sp(folder)
        })
        if(folder != "$"){
            let pathHttpAcces = path + "/" + folder + "/httpAcces/" + folder + ".mjs"
            if(
                fs.existsSync(pathHttpAcces) && 
                fs.readFileSync(pathHttpAcces) == ""
            ) fs.writeFileSync(pathHttpAcces, fs.readFileSync(__dirname + "/models/sub-httpAcces.js"))
            if(fs.existsSync(pathHttpAcces)){
                module.getHttpAcces("", (await import("file:///" + pathHttpAcces)).default)
            }
        }
    }

    if(folder != "$"){
        await (async function pathFindingGet(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingGet(dir + "/" + file)
                else if(file.endsWith(".html")){
                    await addGet(module, dir + "/" + file, path + "/" + folder + "/get")
                }
            }
        })(path + "/" + folder + "/get")

        console.log("|");
        console.log("|POST:");
        await (async function pathFindingPost(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingPost(dir + "/" + file)
                else if(file.endsWith(".mjs")){
                    if(fs.readFileSync(dir + "/" + file) == ""){
                        fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/post.js"))
                    }
                    let name = ((dir + "/").replace(path + "/" + folder + "/post/", "") + file.replace(".mjs", "")).replace(/\//g, "-")
                    console.log("|-->" + name);
                    module.post(name, (await import("file:///" + dir + "/" + file)).default)
                }
            }
        })(path + "/" + folder + "/post")
    }

    js.default.after(root, module)
}