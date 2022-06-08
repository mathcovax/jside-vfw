import fs from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../")

export default class Upload {
    constructor(){
    }

    /**
     * 
     * @private
     */
    listUpload = {}

    /**
     * 
     * @private
     */
    uploadRequest(req, res){
        if(this[req.body.action]){
            return this[req.body.action](req.body, req, res)
        }
        else{
            return undefined
        } 
    }

    /**
     * 
     * @private
     */
    startUpLoad(body, req, res){
        if(!this.listUpload[body.nameUpload]) return false
        let path = this.listUpload[body.nameUpload](req, res)
        if(path === false){
            return false
        }
        if(path.indexOf("..") > -1){
            throw ""
        }
        this.#files[body.id] = {
            name: body.name,
            path: path,
            av: 0,
            last: Date.now(),
            interval: setInterval(() => {
                if(Date.now() - this.#files[body.id].last > this.parameters.timeVerif){
                    clearInterval(this.#files[body.id].interval)
                    fs.rmSync(__dirname + "/upLoad/" + body.id)
                    delete this.#files[body.id]
                }
            }, this.parameters.timeVerif),
            cut: {}
        }
        fs.writeFileSync(__dirname + "/upLoad/" + body.id, "", "base64")
        res.send({})
        return true
    }

    /**
     * 
     * @private
     */
    startCut(body, req, res){
        if(!this.#files[body.id]) return false
        this.#files[body.id].cut[body.index] = {
            chunk: "",
            status: false
        }
        res.send({})
        return true
    }

    /**
     * 
     * @private
     */
    upLoadChunk(body, req, res){
        if(!this.#files[body.id]) return false
        this.#files[body.id].last = Date.now()
        this.#files[body.id].cut[body.index].chunk += body.chunk
        res.send({})
        return true
    }

    /**
     * 
     * @private
     */
    endCut(body, req, res){
        if(!this.#files[body.id]) return false
        this.#files[body.id].cut[body.index].status = true
        if(body.index == this.#files[body.id].av){
            let temp = 0
            for(let index = body.index; this.#files[body.id].cut[index] && this.#files[body.id].cut[index].status; index++){
                fs.appendFileSync(__dirname + "/upLoad/" + body.id, this.#files[body.id].cut[index].chunk, "base64")
                delete this.#files[body.id].cut[index]
                temp++
            }
            this.#files[body.id].av += temp
        }
        res.send({})
        return true
    }

    /**
     * 
     * @private
     */
    endUpLoad(body, req, res){
        if(!this.#files[body.id]) return false
        fs.renameSync(__dirname + "/upLoad/" + body.id, this.#files[body.id].path + (this.#files[body.id].path.charAt(this.#files[body.id].path.lenght-1) == "/"? this.#files[body.id].name : ""))
        clearInterval(this.#files[body.id].interval)
        delete this.#files[body.id]
        res.send({})
        return true
    }

    /**
     * 
     * @private
     */
    getParameters(body, req, res){
        res.send(this.parameters)
    }

    #files = {}
    
    parameters = {
        maxSendingFile: 1,
        cutSize: 200000,
        chunkSize: 100000,
        maxSendingCut: 10,
        timeVerif: 30000
    }
}

if(!fs.existsSync(__dirname + "/upLoad"))fs.mkdirSync(__dirname + "/upLoad")
for(const file of fs.readdirSync(__dirname + "/upLoad"))fs.rmSync(__dirname + "/upLoad/" + file)