
import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../../")

export default async function extPost(path, root){
    console.log(" ");
    console.log("ExtPOST:");
    let extPostPath = path + "/extPost"
    if(!fs.existsSync(extPostPath))fs.mkdirSync(extPostPath);

    await (async function pathFindingExtPost(dir){
        for await(const file of fs.readdirSync(dir)){
            if(fs.lstatSync(dir + "/" + file).isDirectory())await pathFindingExtPost(dir + "/" + file)
            else if(file.endsWith(".mjs")){
                if(fs.readFileSync(dir + "/" + file) == ""){
                    fs.writeFileSync(dir + "/" + file, fs.readFileSync(__dirname + "/models/extPost.js"))
                }
                let name = ((dir + "/").replace(extPostPath + "/", "") + file.replace(".mjs", "")).replace(/\//g, "-")
                console.log("|-->" + name);
                root.addExtPost(name, (await import("file:///" + dir + "/" + file)).default)
            }
        }
    })(extPostPath)
}