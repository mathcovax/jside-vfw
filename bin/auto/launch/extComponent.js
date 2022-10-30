import Component from "../../../lib/component.js"
import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../../../")

export default async function extComponent(path, root){
    console.log("ExtComponent:");
    let extComponentPath = path + "/extComponent"
    if(!fs.existsSync(extComponentPath))fs.mkdirSync(extComponentPath);

    (async function pathFindingExtComponents(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingExtComponents(dir + "/" + file)
            else if(file.endsWith(".html")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(root.models.extComponent))
                }
                let name = ((dir + "/").replace(extComponentPath + "/", "") + file.replace(".html", "")).replace(/\//g, ".")
                console.log("|-->" + name);
                root.addExtComponent(new Component(name, dir + "/" + file))
            }
        }
    })(extComponentPath)

    console.log(" ");
}