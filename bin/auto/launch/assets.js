import fs from "fs"

export default async function assets(path, root){
    if(!fs.existsSync(path + "/assets"))fs.mkdirSync(path + "/assets")
    root.app.use('/assets', express.static(path + "/assets"))
}