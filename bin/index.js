#! /usr/bin/env node

import { VieujsDirectoriesBin } from "./directories.js";
import { resolve } from "path";
import { spawnSync } from "child_process";
import fs from "fs";
import { VieujsDirectories } from "../lib/directories.js";
import autoDir from "./auto/directories.js"

var args = process.argv
args = args.slice(2, process.argv.length);

export default class cmd{
    constructor(args=false){
        if(args === false) return;
        if(!process.env["vieujs"]){
            process.on("exit", (e) => {
                if(e === "restart"){
                    spawnSync(process.argv.shift(), process.argv, {
                        env: {...process.env, "vieujs": args[0]},
                        cwd: process.cwd(),
                        stdio: "inherit",
                    });
                }
            })
            this.constructor.reboot();
        }
        for(let index = 1; index < args.length; index++){
            if(args[index].startsWith(this.prefix) && this.options[args[index].replace(this.prefix, "")]){
                if(this.options[args[index].replace(this.prefix, "")].arg){
                    this.options[args[index].replace(this.prefix, "")].fnc(args[index+1]);
                    args.splice(index, 2);
                }
                else{
                    this.options[args[index].replace(this.prefix, "")].fnc();
                    args.splice(index, 1);
                }
                index--;
            }
        }

        (async()=>{
            switch (args.splice(0, 1)[0]) {
                case "start":
                    new (await import("file:///" + VieujsDirectoriesBin.command + "/start/start.js")).default(args);
                    break;

                case "stop":
                    new (await import("file:///" + VieujsDirectoriesBin.command + "/stop.js")).default(args);
                    break;

                case "status":
                    new (await import("file:///" + VieujsDirectoriesBin.command + "/status.js")).default(args);
                    break;
                
                case "update":
                    spawnSync("npm", ["update", "vieujs"], {cwd: process.cwd(), stdio: "inherit"});
                    break;

                case "customConfig":
                    if(!fs.existsSync(autoDir.RootDirectoriesFile.customConfig)){
                        fs.writeFileSync(autoDir.models.customConfig, fs.readFileSync());
                        console.log("Vieujs: The file for customConfig was created.");
                    }
                    else{
                        console.log("Vieujs: CustomConfig file already exists in this project.");
                    }
                    break;
                
                case "version":
                    console.log("vieujs " + JSON.parse(fs.readFileSync(VieujsDirectories.main + "/package.json")).version + "v");
                    break;
            }
        })();
    }

    prefix = "--"

    options = {

    }

    static get dir(){
        return resolve(autoDir.RootDirectories.main);
    }

    static get worckDir(){
        return autoDir.RootDirectories.workdir;
    }

    static reboot(message){
        if(message){
            console.log("");
            console.log(message);
            console.log("");
        }
        process.exit("restart");
    }

    static command(cmd, args=[]){
        return spawnSync("npx", ["vieujs", cmd, ...args], {env: {...process.env}, "vieujs": cmd, cwd: process.cwd(), stdio: "inherit"});
    }

}

new cmd(args);