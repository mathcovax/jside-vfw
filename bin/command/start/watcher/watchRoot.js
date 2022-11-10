import watcher from "watcher";
import Module from "../../../../lib/module.js";
import Root from "../../../../lib/root.js";
import autoDir from "../../../auto/directories.js";
import auto from "../../../auto/index.js";

export default function watchRoot(){
    (new watcher(autoDir.RootDirectories.root, {ignoreInitial: true}))
    .on("addDir", async (path) => {
        await auto.add.module(Root.addModule(new Module(path.split("/").pop())));
    })
    .on("unlinkDir", (path) => {
        Root.removeModule(path.split("/").pop())
        Root.io.emit("refresh_module_watcher", path.split("/").pop())
    })
}