import Root from "../../../lib/root.js";
import auto from "../../auto/index.js";
import watcher from "./watcher/watcher.js";
import { spawnSync } from "child_process";
import nodemon, { nodemonCatch } from "./nodemon/nodemon.js";
import { subProcess } from "../../directories.js";
import fs from "fs";
import { RootDirectoriesFile } from "../../auto/directories.js";

const argv = process.argv;
export const args = JSON.parse(argv[2].substring(1).substring(0, argv[2].length-2));

if(args.detached){
    process.on("exit", (e) => {
        if(e == 1 || e == 0)subProcess.pid = "";
    });
    
    if(!args.nodemon && !args.watcher){
        for(const po of ["unhandledRejection", "uncaughtException"]){
            process.on(po, (e, f) => {
                subProcess.error.message = e.stack;
                subProcess.error.timespan = Date.now();
                process.exit();
            });
        }
    }
}
if(args.nodemon){
    nodemonCatch();
}

(async () => {
    if(args.detached){
        subProcess.pid = process.pid;
        subProcess.isReady = "";
        subProcess.error.timespan = "";
        subProcess.error.message = "";
    }
    if(args.commands){
        for(const cmd of args.commands){
            spawnSync(cmd.split(" ").shift(), cmd.splice(1, cmd.length), {env: {...process.env}, title:"vieujs", cwd: process.cwd(), stdio: "inherit"});
        }
    }
    
    if(args.import)await import("file:///" + args.import);
    if(fs.existsSync(RootDirectoriesFile.customConfig))await import("file:///" + RootDirectoriesFile.customConfig);
    if(args.port)Root.port = args.port;
    if(args.startMessage)Root.callback(() => {console.log(args.startMessage);});
    if(args.io)Root.io = args.io;

    if(args.nodemon)nodemon();
    else if(args.watcher)await watcher();

    await auto.init();

    Root.init(Root.port, () => {
        if(args.detached)subProcess.isReady = Date.now();
    });

})();