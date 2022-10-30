
import ToWindow from "../../../lib/toWindow.js"
import Page from "../../../lib/page.js"
import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../../../")

export default async function defaultIndex(path, root){
    if(!fs.existsSync(path + "/index.html") || fs.readFileSync(path + "/index.html") == ""){
        fs.writeFileSync(path + "/index.html", fs.readFileSync(__dirname + "/models/index-perso.html"))
    }
    if(!fs.existsSync(path + "/loadingOverlay.html")){
        fs.writeFileSync(path + "/loadingOverlay.html", fs.readFileSync(__dirname + "/models/components.html"))
    }
    if(!fs.existsSync(path + "/global.json") || fs.readFileSync(path + "/global.json") == ""){
        fs.writeFileSync(path + "/global.json", "{\n\n}")
    }

    root.json = JSON.parse(fs.readFileSync(path + "/global.json"))
    let rootIndex = ToWindow(root.index)
    let persoIndex = ToWindow(fs.readFileSync(path + "/index.html"))
    root.importBody = persoIndex.window.document.documentElement.outerHTML
    persoIndex.window.document.body.innerHTML = ""


    for(const tag of persoIndex.window.document.head.children){
        tag.dataset.jsideDefault = ""
    }

    for(const tag of rootIndex.window.document.head.children){
        tag.dataset.jside = ""
        persoIndex.window.document.head.prepend(tag.cloneNode(true))
    }
    for(const tag of rootIndex.window.document.body.children){
        tag.dataset.jside = ""
        persoIndex.window.document.body.append(tag.cloneNode(true))
    }

    persoIndex.window.document.body.children[0].querySelector("#loading-overlay").innerHTML = fs.readFileSync(path + "/loadingOverlay.html")
    for(const s of persoIndex.window.document.body.children[0].querySelector("#loading-overlay").querySelectorAll("script")){
        s.dataset.jsideDefault = ""
    }

    root.index = (new Page("index", persoIndex.window.document.documentElement.outerHTML)).render(root)
    
    let importBody = ToWindow((new Page("import-body", root.importBody)).render(root))
    for(const script of importBody.window.document.querySelectorAll("script")){
        let div = importBody.window.document.createElement("noscript")
        div.textContent = script.textContent
        script.replaceWith(div)
    }
    root.importBody = "<!DOCTYPE html>\n" + importBody.window.document.body.outerHTML
    
    importBody.window.close()
    persoIndex.window.close()
    rootIndex.window.close()
}