pv.Upload = class{
    constructor(name, input, label){
        this.#name = name
        this.#input = input
        this.#label = label
        this.#input.addEventListener("change", () => {
            if(!this.#input.files[0]){
                return
            }
            else{
                this.#files = this.#input.files
                this.#id = Date.now()
                this.start()
            }
        })
    }

    async start(){
        if(this.#status) return
        this.#status = true
        let sendingFile = 0
        let numFileSend = 0
        this.#start(this.#files)
        let parameters = await this.#post({action: "getParameters"})
        this.#chunkSize = parameters.chunkSize
        this.#cutSize = parameters.cutSize
        this.#maxSendingFile = parameters.maxSendingFile
        this.#maxSendingCut = parameters.maxSendingCut
        for await(const file of this.#files){
            if(sendingFile >= this.#maxSendingFile){
                await new Promise((resolve) => {
                    const interval = setInterval(async () => {
                        if(sendingFile < this.#maxSendingFile){
                            clearInterval(interval)
                            sendingFile++
                            resolve()
                        }
                    }, 500);
                })
            }
            else{
                sendingFile++
            }
            (async () => {
                numFileSend++
                let numFile = numFileSend
                let byteSend = 0
                let byteFile = file.size
                let id = Math.round(this.#id+Date.now()*Math.random())
                let sendingChunk = 0
                let numberCut = 0

                await this.#post({
                    action: "startUpLoad",
                    nameUpload: this.#name,
                    name: file.name,
                    info: this.info, 
                    id: id,
                })

                this.#startFileUpLoad(file, numFile)

                for(let index = 0; index < byteFile; index += this.#cutSize){
                    const tempIndex = Math.ceil(index/this.#cutSize)

                    if(sendingChunk >= this.#maxSendingCut){
                        await new Promise((resolve) => {
                            const interval = setInterval(() => {
                                if(numberCut == tempIndex){
                                    clearInterval(interval)
                                    resolve()
                                }
                                else if(!this.#status){
                                    clearInterval(interval)
                                    resolve()
                                }
                            }, 100)
                        })
                    }
                    sendingChunk++

                    await this.#post({
                        action: "startCut",
                        index: tempIndex,
                        id: id,
                    })

                    this.#startFileCut(file, numFile, byteSend)
                    
                    const reader = new FileReader();
                    let slice = file.slice(index, index + this.#cutSize);
                    byteSend += slice.size
                    reader.readAsArrayBuffer(slice);

                    reader.onload = async () => {
                        let result = pv.arrayBufferToBase64(reader.result)
                        for(let byts = 0; byts <= result.length; byts += this.#chunkSize){
                            let temp = result.slice(byts, byts + this.#chunkSize)
                            if(temp.length == 0) return

                            await this.#post({
                                action: "upLoadChunk",
                                id: id,
                                index: tempIndex, 
                                chunk: temp,
                            })
                        }

                        await this.#post({
                            action: "endCut",
                            id: id,
                            index: tempIndex,
                        })
                        sendingChunk--

                        this.#endFileCut(file, numFile, byteSend)

                        numberCut++
                    }

                }
                await new Promise((resolve) => {
                    const interval = setInterval(async () => {
                        if(numberCut == Math.ceil(byteFile/this.#cutSize)){
                            clearInterval(interval)
                            await this.#post({
                                action: "endUpLoad",
                                id: id,
                            })
                            resolve()
                        }
                        
                    }, 100);
                })
                sendingFile--
                this.#endFileUpLoad(file, numFile)
                if(numFileSend == this.#files.length){
                    this.#status = false
                    this.#files = []
                    this.#input.value = []
                    this.#end()
                }
            })()
        }
    }

    async #post(body){
        return new Promise((resolve, reject) => {
            fetch("/jside/upload", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then( response => {
                if(response.status == 403){
                    reject("Forbidden")
                }
                else{
                    response.json().then( response => {
                        if(this.#postResponse(response)){
                            resolve(response)
                        }
                        else{
                            reject(response)
                        }
                    })
                }
            })
            .catch(this.#error)
        })
    }

    on(event, callBack){
        switch(event){
            case "error":
                this.#error = callBack
                break;

            case "start":
                this.#start = callBack
                break;

            case "startFileUpLoad":
                this.#startFileUpLoad = callBack
                break;

            case "startFileCut":
                this.#startFileCut = callBack
                break;

            case "endFileCut":
                this.#endFileCut = callBack
                break;

            case "endFileUpLoad":
                this.#endFileUpLoad = callBack
                break;

            case "end":
                this.#end = callBack
                break;

            case "requestResponse":
                this.#postResponse = callBack
                break;
        
            default:
                break;
        }
    }

    info = {}

    #name = ""

    #maxSendingFile = 1

    #cutSize = 500000

    #chunkSize = 100000

    #maxSendingCut = 5

    stop(){ this.#status == false }

    #start = () => {}

    #end = () => {this.#label.innerText = ""}

    #endFileUpLoad = () => {}

    #endFileCut = (file, numFile, byteSend) => {
        if(this.#label){
            this.#label.innerText = file.name + " :" + "\n" + Math.ceil(byteSend/1024/1024) + "/" + Math.ceil(file.size/1024/1024) + "Mo" + " " + numFile + "/" + this.#files.length
        }
    }

    #startFileCut = () => {}

    #startFileUpLoad = (file, numFile) => {
        if(this.#label){
            this.#label.innerText = "début de l'envoi de  :" + "\n" + file.name + numFile + "/" + this.#files.length
        }
    }

    #error = (err) => { this.#status == false; throw err }

    #postResponse = () => { return true }

    #input = {}
    
    #label = {}

    #files = []

    #id = 0

    #status = false

    #url = window.location.origin + "/jside/upload/" + window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/")[0]
    
    #arg = window.location.href.replace(window.location.origin + "/", "").split("?")[1]? "?" + window.location.href.replace(window.location.origin + "/", "").split("?")[1] : ""
}

pv.arrayBufferToBase64 = function(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}