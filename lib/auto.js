import Module from "./module.js"
import Component from "./component.js"
import Page from "./page.js"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../")
import fs from "fs"

export default async function auto(path, root){
    if(!fs.existsSync(path))fs.mkdirSync(path)

    //extComponent folder
    console.log("ExtComponent:");
    let extComponentPath = path + "/extComponent"
    if(!fs.existsSync(extComponentPath))fs.mkdirSync(extComponentPath)

    async function pathFindingExtComponents(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingExtComponents(dir + "/" + file)
            else if(file.endsWith(".html")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/components.html"))
                }
                let name = ((dir + "/").replace(extComponentPath + "/", "") + file.replace(".html", "")).replace(/\//g, ".")
                console.log("|-->" + name);
                new Component(name, dir + "/" + file, true)
            }
        }
    }
    await pathFindingExtComponents(extComponentPath)
    console.log(" ");

    //html folder
    let rootPath = path + "/root"
    if(!fs.existsSync(rootPath))fs.mkdirSync(rootPath)

    if(!fs.existsSync(rootPath + "/$")){
        fs.mkdirSync(rootPath + "/$")
    }
    if(!fs.existsSync(rootPath + "/$/$.html")){
        fs.writeFileSync(rootPath + "/$/$.html", fs.readFileSync(__dirname + "/models/index.html"))
    }
    if(!fs.existsSync(rootPath + "/$/$.mjs")){
        fs.writeFileSync(rootPath + "/$/$.mjs", fs.readFileSync(__dirname + "/models/index.js"))
    }
    if(!fs.existsSync(rootPath + "/$/httpAcces.mjs")){
        fs.writeFileSync(rootPath + "/$/httpAcces.mjs", fs.readFileSync(__dirname + "/models/httpAcces.js"))
    }
    if(!fs.existsSync(rootPath + "/$/$.json")){
        fs.writeFileSync(rootPath + "/$/$.json", fs.readFileSync(__dirname + "/models/json.json"))
    }

    let js = await import("file:///" + rootPath + "/$/$.mjs")
    let module = root.addModule(new Module(""))
    module.httpAcces((await import("file:///" + rootPath + "/$/httpAcces.mjs")).default)
    js.default.before(root, module)
    if(fs.readFileSync(rootPath + "/$/$.html") != ""){
        console.log("Module $:");
        console.log("|-->/");
        module.addPage(new Page("$", rootPath + "/$/$.html"))
        module.get("", (req, res, short) => {
            short.sp("$")
        })
    }

    for(const folder of fs.readdirSync(rootPath)){
        if(!fs.lstatSync(rootPath + "/" + folder).isDirectory() || folder === "$")continue
        if(!fs.existsSync(rootPath + "/" + folder + "/components")){
            fs.mkdirSync(rootPath + "/" + folder + "/components")
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/get")){
            fs.mkdirSync(rootPath + "/" + folder + "/get")
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/post")){
            fs.mkdirSync(rootPath + "/" + folder + "/post")
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/httpAcces")){
            fs.mkdirSync(rootPath + "/" + folder + "/httpAcces")
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/" + folder + ".html")){
            fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".html", fs.readFileSync(__dirname + "/models/index.html"))
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/" + folder + ".mjs")){
            fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".mjs", fs.readFileSync(__dirname + "/models/index.js"))
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/" + folder + ".json")){
            fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".json", fs.readFileSync(__dirname + "/models/json.json"))
        }
        if(!fs.existsSync(rootPath + "/" + folder + "/httpAcces.mjs")){
            fs.writeFileSync(rootPath + "/" + folder + "/httpAcces.mjs", fs.readFileSync(__dirname + "/models/httpAcces.js"))
        }
        
        console.log("Module " + folder + ":");

        let js = await import("file:///" + rootPath + "/" + folder + "/" + folder + ".mjs")
        let module = root.addModule(new Module(folder))
        let json = JSON.parse(fs.readFileSync(rootPath + "/" + folder + "/" + folder + ".json"))
        module.httpAcces((await import("file:///" + rootPath + "/" + folder + "/httpAcces.mjs")).default)
        js.default.before(root, module)

        async function pathFindingJson(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingJson(dir + "/" + file)
                else if(file.endsWith(".html")){
                    let name = dir.replace(rootPath + "/" + folder + "/get", "") + "/" + file.replace(".html", "")
                    if(!json.pageRender[name]){
                        json.pageRender[name] = {}
                        fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".json", JSON.stringify(json, null, 2))
                    }
                }
            }
            for(const page in json.pageRender){
                if(!fs.existsSync(rootPath + "/" + folder + "/get" + page + ".html") && Object.keys(json.pageRender[page]).length === 0 && page !== folder){
                    delete json.pageRender[page]
                    fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".json", JSON.stringify(json, null, 2))
                }
            }
        }
        await pathFindingJson(rootPath + "/" + folder + "/get")
        module.json(json)

        async function pathFindingComponents(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingComponents(dir + "/" + file)
                else if(file.endsWith(".html")){
                    if(fs.readFileSync(dir + "/" + file) == ""){
                        fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/components.html"))
                    }
                    let name = ((dir + "/").replace(rootPath + "/" + folder + "/components/", "") + file.replace(".html", "")).replace(/\//g, ".")
                    console.log("|-->" + name);
                    module.addComponent(new Component(name, dir + "/" + file))
                }
            }
        }
        console.log("|");
        console.log("|Components:");
        await pathFindingComponents(rootPath + "/" + folder + "/components")

        console.log("|");
        console.log("|GET:");
        if(fs.readFileSync(rootPath + "/" + folder + "/" + folder + ".html") != ""){
            if(!json.pageRender[folder]){
                json.pageRender[folder] = {}
                fs.writeFileSync(rootPath + "/" + folder + "/" + folder + ".json", JSON.stringify(json, null, 2))
                module.json(json)
            }
            console.log("|-->/" + folder);
            module.addPage(new Page(folder, rootPath + "/" + folder + "/" + folder + ".html"))
            module.get("", (req, res, short) => {
                short.sp(folder)
            })
            let pathHttpAcces = rootPath + "/" + folder + "/httpAcces/" + folder + ".mjs"
            if(
                fs.existsSync(pathHttpAcces) && 
                fs.readFileSync(pathHttpAcces) == ""
            ) fs.writeFileSync(pathHttpAcces, fs.readFileSync(__dirname + "/models/sub-httpAcces.js"))
            if(fs.existsSync(pathHttpAcces)){
                module.getHttpAcces("", (await import("file:///" + pathHttpAcces)).default)
            }
        }

        async function pathFindingGet(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingGet(dir + "/" + file)
                else if(file.endsWith(".html")){
                    if(fs.readFileSync(dir + "/" + file) == "")fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/index.html"))
                    let name = dir.replace(rootPath + "/" + folder + "/get", "") + "/" + file.replace(".html", "")
                    module.addPage(new Page(name, dir + "/" + file))
                    if(!file.startsWith(":")){
                        console.log("|-->/" + folder + name);
                        module.get(name, (req, res, short) => {
                            short.sp(name)
                        })
                        let pathHttpAcces = path + "/" + folder + "/httpAcces" + name + ".mjs"
                        if(
                            fs.existsSync(pathHttpAcces) && 
                            fs.readFileSync(pathHttpAcces) == ""
                        ) fs.writeFileSync(pathHttpAcces, fs.readFileSync(__dirname + "/models/sub-httpAcces.js"))
                        if(fs.existsSync(pathHttpAcces)){
                            module.getHttpAcces(name, (await import("file:///" + pathHttpAcces)).default)
                        }
                    }
                }
            }
        }
        await pathFindingGet(rootPath + "/" + folder + "/get")

        async function pathFindingPost(dir){
            for await(const file of fs.readdirSync(dir)){
                if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingPost(dir + "/" + file)
                else if(file.endsWith(".mjs")){
                    if(fs.readFileSync(dir + "/" + file) == ""){
                        fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/post.js"))
                    }
                    let name = ((dir + "/").replace(rootPath + "/" + folder + "/post/", "") + file.replace(".mjs", "")).replace(/\//g, "-")
                    console.log("|-->" + name);
                    module.post(name, (await import("file:///" + dir + "/" + file)).default)
                }
            }
        }
        console.log("|");
        console.log("|POST:");
        await pathFindingPost(rootPath + "/" + folder + "/post")

        js.default.after(root, module)

    }

    //extPost folder
    console.log(" ");
    console.log("ExtPOST:");
    let extPostPath = path + "/extPost"
    if(!fs.existsSync(extPostPath))fs.mkdirSync(extPostPath)

    async function pathFindingExtPost(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingExtPost(dir + "/" + file)
            else if(file.endsWith(".mjs")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/post.js"))
                }
                let name = ((dir + "/").replace(extPostPath + "/", "") + file.replace(".mjs", "")).replace(/\//g, "-")
                console.log("|-->" + name);
                root.addExtPost(name, (await import("file:///" + dir + "/" + file)).default)
            }
        }
    }
    await pathFindingExtPost(extPostPath)
    
    console.log(" ");
}