import fs from "fs"

export default async function di(path){
    let temp = "tmp-jside-" + Date.now() + (Math.random() + 1).toString(36) + ".mjs"
    let tempath = path.split("/")
    tempath.pop()
    tempath = tempath.join("/") + "/" + temp
    fs.writeFileSync(tempath, fs.readFileSync(path))
    let result = await import("file:///" + tempath)
    fs.unlink(tempath, () => {})
    return result
}