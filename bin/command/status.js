import cmd from "../index.js";
import { execSync } from "child_process";
import { subProcess } from "../directories.js";

export default class status extends cmd{
    constructor(args=[]){
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

        this[process.platform]();
    }

    win32(){
        
    }

    darwin(){

    }

    linux(){
        if(!subProcess.pid){
            console.log("Vieujs : Nothing process running.");
        }
        else{
            console.log("Vieujs Status :");
            console.log("PID: " + subProcess.pid);
            try{
                let grepInfo = execSync("lsof -i -P -n | grep " + subProcess.pid).toString()
                console.log("Process status: RUNING" );
                while(grepInfo.indexOf("  ") >= 0){
                    grepInfo = grepInfo.replace(/  /g, " ");
                }
                grepInfo = grepInfo.split(" ");
                console.log("address: '" + grepInfo[8] + "' (LISTEN)");
                let date = new Date(Number(subProcess.isReady));
                console.log("Started " + date.toISOString().split("T")[0] + " at " + date.toISOString().split("T")[1] + ".");
            }catch{
                if(Number(subProcess.error.timespan || 0) >= Number(subProcess.isReady) && subProcess.error.message){
                    console.log("Process status: STOPPED");
                    let date = new Date(Number(subProcess.error.timespan));
                    console.log("Stopped " + date.toISOString().split("T")[0] + " at " + date.toISOString().split("T")[1] + ".");
                    console.log("Cause: error");
                    console.error(subProcess.error.message);
                }
                else{
                    console.log("Process status: UNKNOWN");
                }
            }
        }
    }

    prefix = "-";

    options = {
        "e": {
            arg: false,
            fnc: (arg) => {
                
            }
        }
    }
}