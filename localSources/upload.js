const fs = require("fs")

module.exports = {
    startUpLoad: function(body, path){
        if(path.indexOf("..") > -1){
            throw ""
        }
        this.files[body.id] = {
            name: body.name,
            path: path,
            av: 0,
            last: Date.now(),
            interval: setInterval(() => {
                if(Date.now() - this.files[body.id].last > this.parameters.timeVerif){
                    clearInterval(this.files[body.id].interval)
                    fs.rmSync(__dirname + "/upLoad/" + body.id)
                    delete this.files[body.id]
                }
            }, this.parameters.timeVerif),
            cut: {}
        }
        fs.writeFileSync(__dirname + "/upLoad/" + body.id, "", "base64")
        return {}
    },
    startCut: function(body){
        this.files[body.id].cut[body.index] = {
            chunk: "",
            status: false
        }
        return {}
    },
    upLoadChunk: function(body){
        this.files[body.id].last = Date.now()
        this.files[body.id].cut[body.index].chunk += body.chunk
        return {}
    },
    endCut: function(body){
        this.files[body.id].cut[body.index].status = true
        if(body.index == this.files[body.id].av){
            let temp = 0
            for(let index = body.index; this.files[body.id].cut[index] && this.files[body.id].cut[index].status; index++){
                fs.appendFileSync(__dirname + "/upLoad/" + body.id, this.files[body.id].cut[index].chunk, "base64")
                delete this.files[body.id].cut[index]
                temp++
            }
            this.files[body.id].av += temp
        }
        return {}
    },
    endUpLoad: function(body){
        fs.renameSync(__dirname + "/upLoad/" + body.id, this.files[body.id].path + this.files[body.id].name)
        clearInterval(this.files[body.id].interval)
        delete this.files[body.id]
        return {}
    },
    files: {},
    parameters: {
        maxSendingFile: 1,
        cutSize: 200000,
        chunkSize: 100000,
        maxSendingCut: 10,
        timeVerif: 30000
    }
}

if(!fs.existsSync(__dirname + "/upLoad"))fs.mkdirSync(__dirname + "/upLoad")
for(const file of fs.readdirSync(__dirname + "/upLoad"))fs.rmSync(__dirname + "/upLoad/" + file)