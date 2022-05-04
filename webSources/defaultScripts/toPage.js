class tp{
    constructor(newUrl, oldUrl=window.location.href){
        
        newUrl = newUrl.split("?")[1]? this.constructor.#rectiLink(newUrl) : this.constructor.#rectiLink(newUrl) + loc.urlArgs
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
        let newDoc = new DOMParser().parseFromString(rep, "text/html")
        await this.#loadHead(newDoc.head)
        if(loc.parse(newUrl).path[0] == loc.parse(oldUrl).path[0]){
            this.#loadBody(newDoc.body)
        }
        else{
            document.body.replaceWith(newDoc.body)
        }
        this.#loadHref()
        await this.#unloadHead(newDoc.head)
        window.history.pushState({}, null, newUrl)
        await this.#loadScripts(document.body, newUrl)
        if(component)component.launch()
    }

    static async #loadHead(mhead){
        for await(const ht of mhead.children){
            if(ht.nodeName == "LINK" && ht.rel == "stylesheet" && document.head.innerHTML.indexOf(ht.outerHTML) == -1){
                await new Promise((resolve) => {
                    let temp = ht.cloneNode(true)
                    temp.onload = resolve
                    document.head.appendChild(temp)
                })
            }
            else if(document.head.innerHTML.indexOf(ht.outerHTML) == -1)document.head.appendChild(ht.cloneNode(true))
        }
    }

    static #loadBody(newBody){
        let currantBody = document.body
        let skip1 = 0
        let skip2 = 0
        let cb = currantBody.cloneNode(true)
        let nb = newBody.cloneNode(true)
        currantBody = currantBody.children
        newBody = newBody.children
        for(let index = 0; cb.children[index-skip1] || nb.children[index-skip2]; index++){
            if(cb.children[index-skip1] && cb.children[index-skip1].nodeType == "SCRIPT"){skip2++; currantBody[index-skip1].remove()}
            else if(nb.children[index-skip2] && nb.children[index-skip2].nodeType == "SCRIPT"){skip1++; document.body.appendChild(newBody[index-skip2].cloneNode(true))}
            else if(cb.children[index-skip1]?.dataset?.name && nb.children[index-skip2]?.dataset?.name && currantBody[index-skip1].dataset.name == newBody[index-skip2].dataset.name) continue
            else if(cb.children[index-skip1] && nb.children[index-skip2])currantBody[index-skip1].replaceWith(newBody[index-skip2].cloneNode(true))
            else if(cb.children[index-skip1] && !nb.children[index-skip2])currantBody[index-skip1].remove()
            else if(!cb.children[index-skip1] && nb.children[index-skip2]){document.body.appendChild(newBody[index-skip2].cloneNode(true))}
        }
    }

    static async #loadHref(){
        for(const a of document.body.querySelectorAll("a")){
            if(a.href){
                a.onclick = (e) => {
                    new tp(a.href.replace(window.location.origin, ""))
                    return false
                }
            }
        }
    }

    static async #unloadHead(mhead){
        for(const he of document.head.children){
            if(mhead.innerHTML.indexOf(he.outerHTML) == -1)he.remove()
        }
    }

    static async #loadScripts(doc, newUrl){
        for(const script of document.body.querySelectorAll("script")){
            let js = document.createElement("script")
            if(!script.src){
                js.innerHTML = script.innerHTML
                script.parentNode.replaceChild(js, script)
                js.remove()
                continue
            }
            else if(!this.#scripts[script.src]){
                this.#scriptsPage[newUrl.split("?")[0]] = []
                this.#scripts[script.src] = {
                    load: ()=>{},
                    unload: ()=>{},
                    returnLoad: {},
                    script: await (await fetch(script.src, { method: "GET", headers: { "jside": true } })).text()
                }
                this.#scriptsPage[newUrl.split("?")[0]].push(script.src)
            }
            js.innerHTML = this.#scripts[script.src].script
            js.dataset.src = script.src
            script.parentNode.replaceChild(js, script)
            js.remove()
            this.#scripts[script.src].returnLoad = await this.#scripts[script.src].load()
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
                            if(!response.headers.get("nosave")){
                                this.#page[response.url.split("?")[0]] = rep
                                window.sessionStorage.setItem('page', JSON.stringify(this.#page))
                            }
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

document.body.innerHTML = ""
new tp(window.location.href.replace(window.location.origin, ""))