#! /usr/bin/env node

import chokidar from "chokidar"
import fs from "fs"
import Root from "jside-vfw/lib/root.js";
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

        await new Promise((resolve) => {
            const inter = setInterval(() => {
                if(Root.root.server.listening){
                    clearInterval(inter)
                    resolve()
                } 
            }, 10);
        })

        chokidar.watch(this.worckDir + "/extComponent")
        .on("add", (path) => {

        })
        .on("change", (path) => {
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
            Root.root.io.emit("refresh_watcher", lp)
        })

        const rootWatcher = chokidar.watch(this.worckDir + "/root")
        .on("ready", () => {
            rootWatcher.on("add", async (path) => {
                if(!this.watchStatus)return
                let arr = path.replace(this.worckDir + "/", "").split("/")
                let obj = {
                    type: arr.shift(),
                    module: arr.shift(),
                    path: path
                }

                if(obj.path.endsWith(".html")){
                    if(arr[0] !== "component"){
                        this.watchStatus = false
                        auto.launch.addJson(Root.root.getModule(obj.module), obj.path, this.worckDir + "/root/" + obj.module + "/get", this.worckDir + "/root/" + obj.module + "/" + obj.module + ".json")
                        await auto.launch.addGet(Root.root.getModule(obj.module), obj.path, this.worckDir + "/root/" + obj.module + "/get")
                        setTimeout(() => {
                            this.watchStatus = true
                        }, 500);
                    }
                    else{
                        
                    }
                }
            })
        })
        .on("change", (path) => {
            if(!this.watchStatus)return
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                module: arr.shift(),
                path: path
            }

            if(obj.path.endsWith(".html")){
                if(obj.module == "$")obj.module = ""
                if(arr[0] !== "component"){
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
                    try{
                        let page = Root.root.getModule(obj.module).getPage(obj.page)
                        page.html = fs.readFileSync(obj.path, "utf8")
                        page.render()
                    }catch{

                    }
                    Root.root.io.emit("refresh_watcher", [obj])
                }
                else{
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
                    Root.root.io.emit("refresh_watcher", lp)
                }
            }
        })
        .on("unlink", (path) => {
            
        })
        .on('ready', () => {
            rootWatcher.on("addDir", async (path) => {
                let arr = path.replace(this.worckDir + "/", "").split("/")
                let obj = {
                    type: arr.shift(),
                    path: path
                }
                if(arr.length == 1){
                    let temp = obj.path.split("/")
                    temp.pop()
                    this.watchStatus = false
                    await auto.launch.module(temp.join("/") + "/", arr[0], Root.root)
                    setTimeout(() => {
                        this.watchStatus = true
                    }, 500);
                }
            })
        })
        .on('unlinkDir', (path) => {
            let arr = path.replace(this.worckDir + "/", "").split("/")
            let obj = {
                type: arr.shift(),
                path: path
            }
            if(arr.length == 1){
                Root.root.deleteModule(arr[0])
                Root.root.io.emit("refresh_watcher", [{reload: true}])
            }
            
        })

        chokidar.watch([this.worckDir + "/loadingOverlay.html", this.worckDir + "/index.html", this.dir + "/" + mainFile])
        .on("change", (path) => {
            switch (path.split("/").pop()) {
                case "index.html":
                    this.reboot("Reboot caused by a modification of the index file.")
                    break;

                case "loadingOverlay.html":
                    this.reboot("Reboot caused by a modification of the loadingOverlay file.")
                    break;

                case mainFile:
                    this.reboot("Reboot caused by a modification of the main file.")
                    break;
            }
        })
    }

    options = {
        "cmd": (arg) => {

        },
        "d": (arg) => {
            this.dir = arg
        },
        "wd": (arg) => {
            this.worckDir = this.dir + "/" + arg
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