import { Root, autoDir } from "vieujs";

Root.port = 80;
Root.callback(() => {console.log("ready");});
Root.io = false;
