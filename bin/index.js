#! /usr/bin/env node

import watcher from "watcher"
import fs from "fs"
import Root from "../lib/root.js";
import auto from "./auto/auto.js"
import { spawnSync } from "child_process";

var args = process.argv
args = args.slice(2, process.argv.length);

class cmd{
    constructor(args){
        let option = []
        for(let index = 1; index < args.length; index++){
            if(args[index].startsWith("-") && this.options[args[index].replace("-", "")]){
                option.push([args[index].replace("-", ""), args[index+1]])
                args.splice(index, 2)
                index--
            }
        }
        try{
            for(const o of option){
                this.options[o[0]](o[1])
            }
            this[args.splice(0, 1)](args, option)
        }catch{

        }
    }

    async start(args, option){

        process.on("exit", (e) => {
            if(e === "restart"){
                if(Root.root.server)Root.root.server.close()
                spawnSync(process.argv.shift(), process.argv, {
                    env: {...process.env, "jside_watcher": true},
                    cwd: process.cwd(),
                    stdio: "inherit",
                })
            }
        })
        if(!process.env["jside_watcher"]){
            console.log("start jside watcher 🔍");
            console.log("");
            process.exit("restart")
        }

        let mainFile = fs.existsSync(this.dir + "/" + args[0])? args[0] : "main.mjs";
        await import(this.dir + "/" + mainFile)
        for(const po of ["unhandledRejection", "uncaughtException"]){
            process.on(po, (e, f) => {
                console.log("");
                console.log("Error :");
                console.error(e);

                this.watchStatus = false
                for(const evt of ["add", "change"]){
                    (new watcher(this.worckDir, {ignoreInitial: true, recursive: true})).on(evt, () => {
                        this.reboot("Reboot after error.")
                    });
                }
            })
        }

        await new Promise((resolve) => {
            const inter = setInterval(() => {
                if(Root.root.server.listening){
                    clearInterval(inter)
                    resolve()
                } 
            }, 10);
        });

        (new watcher(this.worckDir + "/extComponent", {ignoreInitial: true, recursive: true}))

        .on("add", (path) => {
            if(!this.watchStatus || !path.endsWith(".html"))return
            this.watchStatus = false
            auto.launch.addExtComponent(Root.root, path)
            setTimeout(() => {
                this.watchStatus = true
            }, 500);
        })

        .on("change", (path) => {
            if(!this.watchStatus || !path.endsWith(".html"))return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                path: path
            }

            obj.extComponent = arr.join(".").replace(".html", "")
            let extComponent = Root.root.getExtComponent(obj.extComponent)
            extComponent.html = fs.readFileSync(obj.path, "utf8")
            extComponent.preRender()
            let lp = extComponent.page.splice(0, extComponent.page.length)
            let v = {}
            for(const p of lp){
                if(p.type === "restart")this.reboot("Reboot caused by a modification of a extComponent which is in a main html file.")
                if(v[p.url] === true) continue
                v[p.url] = true
                Root.root.getModule(p.module).getPage(p.page).render()
            }
            Root.root.io.emit("refresh_page_watcher", lp)
        })

        .on("unlink", (path) => {
            if(!this.watchStatus || !path.endsWith(".html"))return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                path: path
            }
            obj.extComponent = arr.join(".").replace(".html", "")
            let lp = structuredClone(Root.root.getExtComponent(obj.extComponent).page)
            Root.root.deleteExtComponent(obj.extComponent)
            let v = {}
            for(const p of lp){
                if(p.type === "restart")this.reboot("Reboot caused by a modification of a extComponent which is in a main html file.")
                if(v[p.url] === true) continue
                v[p.url] = true
                Root.root.getModule(p.module).getPage(p.page).render()
            }
            Root.root.io.emit("refresh_page_watcher", lp)
        });

        (new watcher(this.worckDir + "/root", {ignoreInitial: true, recursive: true}))

        .on("add", async (path) => {
            if(!this.watchStatus || path.split("/").pop().startsWith("tmp-jside-"))return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                module: arr.shift(),
                path: path
            }

            if(obj.path.endsWith(".html")){
                if(arr[0] === "get"){
                    this.watchStatus = false
                    auto.launch.addJson(Root.root.getModule(obj.module), obj.path)
                    auto.launch.addGet(Root.root.getModule(obj.module), obj.path)
                    setTimeout(() => {
                        this.watchStatus = true
                    }, 500);
                }
                else if(arr[0] === "component"){
                    auto.launch.addComponent(Root.root.getModule(obj.module), obj.path)
                }
            }
            else if(obj.path.endsWith(".mjs")){
                if(arr[0] === "post"){
                    this.watchStatus = false
                    auto.launch.addPost(Root.root.getModule(obj.module), obj.path)
                    setTimeout(() => {
                        this.watchStatus = true
                    }, 500);
                }
                else if(arr[0] === "httpAcces"){
                    this.watchStatus = false
                    auto.launch.addHttpAcces(Root.root.getModule(obj.module), obj.path)
                    setTimeout(() => {
                        this.watchStatus = true
                    }, 500);
                    arr.shift()
                    obj.url = "/" + obj.module + "/" + arr.join("/").replace(".mjs", "")
                    Root.root.io.emit("refresh_page_watcher", [obj])
                }
            }
        })

        .on("change", async (path) => {
            if(!this.watchStatus || path.split("/").pop().startsWith("tmp-jside-"))return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                module: arr.shift(),
                path: path
            }
            if(arr[0] === obj.module + ".json" || arr[0] === obj.module + ".mjs" || arr[0] === "httpAcces.mjs"){
                if(obj.module == "$")obj.module = ""
                Root.root.deleteModule(obj.module)
                this.watchStatus = false
                await auto.launch.module(path.replace("/" + arr[0], ""), Root.root)
                setTimeout(() => {
                    this.watchStatus = true
                }, 500);
                Root.root.io.emit("refresh_module_watcher", obj.module)
            }
            else if(obj.path.endsWith(".html")){
                if(obj.module == "$")obj.module = ""
                if(arr[0] === "get" || arr[0] === obj.module + ".html" || arr[0] === "$.html"){
                    if(arr[0] === "get"){
                        arr.shift()
                        obj.page = "/"
                        obj.url = "/" + obj.module + "/" + arr.join("/").replace(".html", "")
                    }
                    else{
                        obj.url = "/" + arr.join("/").replace(".html", "")
                    }
                    obj.url = obj.url == "/$"?"/":obj.url
                    obj.page = (obj.page || "") + arr.join("/").replace(".html", "")
                    let page = Root.root.getModule(obj.module).getPage(obj.page)
                    page.html = fs.readFileSync(obj.path, "utf8")
                    page.render()
                    Root.root.io.emit("refresh_page_watcher", [obj])
                }
                else if(arr[0] === "component"){
                    arr.shift()
                    obj.component = arr.join(".").replace(".html", "")
                    let component = Root.root.getModule(obj.module).getComponent(obj.component)
                    component.html = fs.readFileSync(obj.path, "utf8")
                    component.preRender()
                    let lp = component.page.splice(0, component.page.length)
                    let v = {}
                    for(const p of lp){
                        if(v[p.url] === true) continue
                        v[p.url] = true
                        Root.root.getModule(p.module).getPage(p.page).render()
                    }
                    Root.root.io.emit("refresh_page_watcher", lp)
                }
            }
            else if(obj.path.endsWith(".mjs")){
                if(arr[0] === "post"){
                    arr.shift()
                    Root.root.getModule(obj.module).deletePost(arr.join("-").replace(".mjs", ""))
                    auto.launch.addPost(Root.root.getModule(obj.module), obj.path)
                }
                else if(arr[0] === "httpAcces"){
                    arr.shift()
                    auto.launch.addHttpAcces(Root.root.getModule(obj.module), obj.path)
                    obj.url = "/" + obj.module + "/" + arr.join("/").replace(".mjs", "")
                    Root.root.io.emit("refresh_page_watcher", [obj])
                }
            }
        })

        .on("unlink", (path) => {
            if(!this.watchStatus || path.split("/").pop().startsWith("tmp-jside-"))return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                module: arr.shift(),
                path: path
            }

            if(arr[0] === obj.module + ".html" || arr[0] === obj.module + ".json" || arr[0] === obj.module + ".mjs" || arr[0] === "httpAcces.mjs"){
                this.reboot("Reboot caused by unlink a main file of a module.")
            }
            if(obj.path.endsWith(".html")){
                if(arr[0] === "get"){
                    arr.shift()
                    obj.url = "/" + obj.module + "/" + arr.join("/").replace(".html", "")
                    Root.root.getModule(obj.module).deletePage("/" + arr.join("/").replace(".html", ""))
                    Root.root.getModule(obj.module).deleteGet(arr.join("/").replace(".html", ""))
                    Root.root.io.emit("refresh_page_watcher", [obj])

                }
                else if(arr[0] === "component"){
                    arr.shift()
                    let lp = structuredClone(Root.root.getModule(obj.module).getComponent(arr.join(".").replace(".html", "")).page)
                    Root.root.getModule(obj.module).deleteComponent(arr.join(".").replace(".html", ""))
                    let v = {}
                    for(const p of lp){
                        if(v[p.url] === true) continue
                        v[p.url] = true
                        Root.root.getModule(p.module).getPage(p.page).render()
                    }
                    Root.root.io.emit("refresh_module_watcher", obj.module)
                }
            }
            else if(obj.path.endsWith(".mjs")){
                if(arr[0] === "post"){
                    arr.shift()
                    Root.root.getModule(obj.module).deletePost(arr.join("-").replace(".mjs", ""))
                }
                else if(arr[0] === "httpAcces"){
                    arr.shift()
                    Root.root.getModule(obj.module).deleteHttpAcces("/" + arr.join("/").replace(".mjs", ""))
                    obj.url = "/" + obj.module + "/" + arr.join("/").replace(".mjs", "")
                    Root.root.io.emit("refresh_page_watcher", [obj])
                }
            }
        })

        .on("addDir", async (path) => {
            if(!this.watchStatus)return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                path: path
            }
            if(arr.length == 1){
                this.watchStatus = false
                await auto.launch.module(obj.path, Root.root)
                setTimeout(() => {
                    this.watchStatus = true
                }, 500);
            }
        })
        .on('unlinkDir', (path) => {
            if(!this.watchStatus)return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                path: path
            }
            if(arr.length == 1){
                this.watchStatus = false
                Root.root.deleteModule(arr[0])
                setTimeout(() => {
                    this.watchStatus = true
                }, 500);
                Root.root.io.emit("refresh_module_watcher", arr[0])
            }
            
        });

        (new watcher(this.worckDir + "/extPost", {ignoreInitial: true, recursive: true}))

        .on("add", async (path) => {
            if(!this.watchStatus || !path.endsWith(".mjs") || path.split("/").pop().startsWith("tmp-jside-"))return
            this.watchStatus = false
            await auto.launch.addExtPost(Root.root, path)
            setTimeout(() => {
                this.watchStatus = true
            }, 500);
        })

        .on("change", async (path) => {
            if(!this.watchStatus || !path.endsWith(".mjs") || path.split("/").pop().startsWith("tmp-jside-"))return
            let arr = path.replace(this.worckDir + "/extPost/", "").split("/")
            this.watchStatus = false
            Root.root.deleteExtPost(arr.join("-").replace(".mjs", ""))
            await auto.launch.addExtPost(Root.root, path)
            setTimeout(() => {
                this.watchStatus = true
            }, 500);
        })

        .on("unlink", (path) => {
            if(!this.watchStatus || !path.endsWith(".mjs") || path.split("/").pop().startsWith("tmp-jside-"))return
            let arr = path.replace(this.worckDir + "/extPost/", "").split("/")
            Root.root.deleteExtPost(arr.join("-").replace(".mjs", ""))
        });

        (new watcher([this.worckDir + "/loadingOverlay.html", this.worckDir + "/index.html", this.worckDir + "/global.json", this.dir + "/" + mainFile]))

        .on("change", (path) => {
            if(!this.watchStatus)return
            switch (path.split("/").pop()) {
                case "index.html":
                    this.reboot("Reboot caused by a modification of the index file.")
                    break;

                case "loadingOverlay.html":
                    this.reboot("Reboot caused by a modification of the loadingOverlay file.")
                    break;

                case "global.json":
                    this.reboot("Reboot caused by a modification of the global json file.")
                    break;

                case mainFile:
                    this.reboot("Reboot caused by a modification of the main file.")
                    break;
            }
        })
    }

    options = {
        "cmd": (arg) => {

        }
    }

    watchStatus = true

    dir = process.env.PWD

    worckDir = process.env.PWD + "/src"

    reboot(message){
        console.log("");
        console.log(message);
        console.log("");
        process.exit("restart")
    }

}

new cmd(args)