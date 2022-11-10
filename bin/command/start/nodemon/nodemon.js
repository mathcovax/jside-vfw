import watcher from "watcher";
import Root from "../../../../lib/root.js";
import { subProcess } from "../../../directories.js";
import { resolve } from "path";
import { spawnSync, spawn } from "child_process";
import autoDir from "../../../auto/directories.js";

const argv = process.argv;
const args = JSON.parse(argv[2].substring(1).substring(0, argv[2].length-2));

const listWatcher = [];

export default function nodemon(){
    listWatcher.push((new watcher(resolve(autoDir.RootDirectories.main), {ignoreInitial: true, recursive: true, ignore: (path)=>(path.indexOf("node_modules")>=0)})).on("all", (event, path) => {
        if(path.split("/").pop().startsWith("tmp-vieujs-") || path.indexOf("node_modules")>=0) return;
        process.exit("restart");
    }));
}

export function nodemonCatch(){
    process.on("exit", (e) => {
        if(e === "restart"){
            Root.destroy();
            for(const watcher of listWatcher)watcher.close();
            console.log("");
            console.log("restarting...");
            console.log("");
            if(args.detached){
                spawn(process.argv.shift(), process.argv, {
                    env: {...process.env},
                    cwd: process.cwd(),
                    detached: true,
                    stdio: "ignore",
                    title:"vieujs",
                });
            }
            else{
                spawnSync(process.argv.shift(), process.argv, {
                    env: {...process.env},
                    cwd: process.cwd(),
                    stdio: "inherit",
                    title:"vieujs",
                });
            }
        }
    });
    
    for(const po of ["unhandledRejection", "uncaughtException"]){
        process.on(po, (e, f) => {
            console.log("");
            console.log("Error :");
            console.error(e);
            
            subProcess.error.message = e.stack;
            subProcess.error.timespan = Date.now();

            listWatcher.push((new watcher(resolve(autoDir.RootDirectories.main), {ignoreInitial: true, recursive: true, ignore: (path)=>(path.indexOf("node_modules")>=0)})).on("all", (event, path) => {
                if(path.split("/").pop().startsWith("tmp-vieujs-") || path.indexOf("node_modules")>=0) return;
                process.exit("restart");
            }));
        });
    }
}