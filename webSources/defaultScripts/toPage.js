class tp{
    constructor(newUrl, oldUrl=window.location.href){
        
        newUrl = this.constructor.#rectiLink(newUrl)
        if(this.constructor.#page[newUrl.split("?")[0]]){
            this.constructor.#upDatePage(this.constructor.#page[newUrl.split("?")[0]], newUrl, oldUrl)
        }
        else{
            this.constructor.#getPage(newUrl).then((obj) => {
                this.constructor.#upDatePage(obj.html, obj.repUrl, oldUrl)
            })
        }
    }

    static #rectiLink(newUrl){
        return window.location.origin + (!newUrl || newUrl[0] == "/"? "" : "/") + (newUrl[newUrl.length-1] == "/"? newUrl.substring(0, newUrl.length-1) : newUrl)
    }

    static async #upDatePage(rep, newUrl, oldUrl){
        this.#unloadScripts(oldUrl)
        let temp = document.createElement("div")
        temp.innerHTML = rep
        await this.#loadHead(temp.children[0])
        await new Promise((resolve)=>{
            setTimeout(() => {
                resolve()
            }, 50);
        })
        window.history.pushState({}, null, newUrl)
        document.body.innerHTML = temp.children[1].innerHTML
        await this.#loadScripts(temp.children[2], newUrl)
        if(component)component.launch()
    }

    static async #loadHead(mhead){
        for(const he of document.head.children){
            if(mhead.innerHTML.indexOf(he.outerHTML) == -1)he.remove()
        }
        for(const ht of [...mhead.children]){
            if(document.head.innerHTML.indexOf(ht.outerHTML) == -1)document.head.appendChild(ht)
        }
    }

    static async #loadScripts(kid, newUrl){
        if(kid){
            for(const script of kid.children){
                if(!this.#scripts[script.src]){
                    this.#scripts[script.src] = {
                        load: ()=>{},
                        unload: ()=>{},
                        returnLoad: {}
                    }
                    this.#scriptsPage[newUrl.split("?")[0]] = []
                    await new Promise(function (resolve){
                        let js = document.createElement("script")
                        js.src = script.src
                        js.onload = ()=>{resolve()}
                        document.head.appendChild(js)
                    })
                    this.#scriptsPage[newUrl.split("?")[0]].push(script.src)
                }
                this.#scripts[script.src].returnLoad = await this.#scripts[script.src].load()
            }
        }

    }

    static #unloadScripts(oldUrl){
        if(this.#scriptsPage[oldUrl.split("?")[0]]){
            for(const src of this.#scriptsPage[oldUrl.split("?")[0]]){
                if(this.#scripts[src]){
                    this.#scripts[src].unload(this.#scripts[src].returnLoad)
                    this.#scripts[src].returnLoad = {}
                }
            }
        }
    }

    static async #getPage(newUrl){
        return await new Promise((resolve, reject) => {
            fetch(newUrl, { method: "GET", headers: { "jside": true } }).then(response=>{
                if(!response.headers.get('content-disposition')){
                    response.text().then((rep) => {
                        if(rep == ""){
                            window.location.reload()
                        }
                        else{
                            this.#page[response.url.split("?")[0]] = rep
                            window.sessionStorage.setItem('page', JSON.stringify(this.#page))
                            resolve({html: rep, repUrl: response.url})
                        }
                    })
                }
                else if(response.headers.get('content-disposition')){
                    response.blob().then((data) => {
                        var a = document.createElement("a")
                        a.href = window.URL.createObjectURL(data)
                        a.download = response.headers.get('content-disposition').split('=')[1].replace(/['"]/g, '')
                        a.click()
                        reject("download")
                    })
                }
            }).catch(this.error)
        })
    }

    static error = (e) => {throw e}

    static #page = window.sessionStorage.getItem("page")? JSON.parse(window.sessionStorage.getItem("page")) : {}
    
    static #scriptsPage = {}

    static #scripts = {}

    static on(event, src, fnc){
        this.#scripts[src][event] = fnc
    }
}

window.addEventListener("popstate", (e) => {
    window.location.reload()
})

new tp(window.location.href.replace(window.location.origin, ""))