import Root from "../../../../lib/root.js";
import Socket from "../../../../lib/socket.js";

export default function makeIndex(){
    Root.addScriptSrcToVieujsIndex.push("/vieujs/js/watcher.js");
    
    if(Root.io === false)Root.io = "true";
    let socket = Root.addSocket(new Socket("watcher"));
    socket.socketAcces(() => {return true});
}