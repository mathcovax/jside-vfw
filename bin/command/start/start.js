import cmd from "../../index.js";
import { spawnSync, spawn } from "child_process";
import { resolve } from "path";
import { VieujsDirectoriesBin } from "../../directories.js";
import { subProcess } from "../../directories.js";

export default class start extends cmd{
    constructor(args){
        super();
        for(let index = 0; index < args.length; index++){
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

        this.main(args);
    }

    main(args){
        let a = JSON.stringify({
            import: this.import,
            port: this.port,
            startMessage: this.startMessage,
            watcher: this.watcher,
            nodemon: this.nodemon,
            commands: this.commands,
            detached: this.detached,
        });
        this.spawn("node", [VieujsDirectoriesBin.command + "/start/spawn.js", `'${a}'`], {env: {...process.env}, title:"vieujs", ...this.spawnOption});
    }

    spawn = spawnSync;

    spawnOption = {
        cwd: process.cwd(),
        stdio: "inherit",
    };

    prefix = "-";

    port = false;

    startMessage = false;

    import = false;

    io = false;
    
    watcher = false;

    nodemon = false;

    commands = false;

    detached = false;

    options = {
        "cmd": {
            arg: true,
            fnc: (arg) => {
                this.commands = arg.split("&&");
            }
        },
        "d": {
            arg: false,
            fnc: () => {
                this.spawn = (a, b, c) => {
                    if(subProcess.pid != ""){
                        try{cmd.command("stop", ["-m"]);}catch{};
                    }
                    let temp = spawn(a, b, c);
                    temp.unref();

                    console.log("Vieujs : launch of process...");
                    let timespan = Date.now();
                    const inter = setInterval(() => {
                        if(subProcess.pid && (subProcess.isReady || this.nodemon || this.watcher)){
                            clearInterval(inter);
                            console.log("Vieujs : " + (this.startMessage || "ready"));
                        }
                        else if(!subProcess.pid && !subProcess.isReady && Number(subProcess.error.timespan || 0) >= timespan){
                            clearInterval(inter);
                            console.log("Vieujs error :");
                            console.error(subProcess.error.message);
                        }
                    }, 100);
                };
                this.detached = true;
                this.spawnOption = { detached: true, stdio: "ignore", cwd: process.cwd() };
            }
        },
        "p": {
            arg: true,
            fnc: (arg) => {
                this.port = arg;
            }
        },
        "sm": {
            arg: true,
            fnc: (arg) => {
                this.startMessage = arg;
            }
        },
        "i": {
            arg: true,
            fnc: (arg) => {
                this.import = resolve(this.constructor.dir, arg);
            }
        },
        "io": {
            arg: false,
            fnc: () => {
                this.io = true;
            }
        },
        "w": {
            arg: false,
            fnc: () => {
                this.watcher = true;
            }
        },
        "nm": {
            arg: false,
            fnc: () => {
                this.nodemon = true;
            }
        }
        
    }
}