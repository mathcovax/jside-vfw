import fs from "fs"

export default async function di(path){
    let temp = "tmp-vieujs-" + Date.now() + (Math.random() + 1).toString(36) + ".mjs"
    let tempath = path.split("/")
    tempath.pop()
    tempath = tempath.join("/") + "/" + temp
    fs.writeFileSync(tempath, fs.readFileSync(path))
    try{
        let result = await import("file:///" + tempath)
        fs.unlink(tempath, () => {})
        return result
    }catch(e){
        fs.unlink(tempath, () => {})
        throw e
    }
}