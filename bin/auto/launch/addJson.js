import fs from "fs"

export default function addJson(module, path, wd, pathJson){
    let name = path.replace(wd, "").replace(".html", "")
    if(!module.json.pageRender[name]){
        module.json.pageRender[name] = {pageTitle: "page name"}
        fs.writeFileSync(pathJson, JSON.stringify(module.json, null, 2))
    }
}