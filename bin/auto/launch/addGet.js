import Page from "../../../lib/page.js"
import fs from "fs"

export default async function addGet(module, path, wd){
    if(fs.readFileSync(path) == "")fs.writeFileSync(path, fs.readFileSync(module.root.models.page))
    let name = path.replace(wd, "").replace(".html", "")
    module.addPage(new Page(name, path))
    console.log("|-->/" + module.name + name);
    module.get(name, (req, res, short) => {
        short.sp(name)
    })
    let pathHttpAcces = path.replace("get", "httpAcces").replace(".html", '.mjs')
    if(fs.existsSync(pathHttpAcces) && fs.readFileSync(pathHttpAcces) == "") fs.writeFileSync(pathHttpAcces, fs.readFileSync(__dirname + "/models/sub-httpAcces.js"))
    if(fs.existsSync(pathHttpAcces)){
        module.getHttpAcces(name, (await import("file:///" + pathHttpAcces)).default)
    }
}