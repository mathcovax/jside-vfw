class tp{
    constructor(newUrl, oldUrl=window.location.href){
        newUrl = this.constructor.#rectiLink(loc.parse(newUrl).urlPath) + loc.parse(newUrl).urlArgs
        oldUrl = oldUrl === "?"? oldUrl : this.constructor.#rectiLink(loc.parse(oldUrl).urlPath) + loc.parse(oldUrl).urlArgs
        if(this.constructor.#page[newUrl.split("?")[0]]){
            this.constructor.#httpAcces(newUrl).then(() => {
                this.constructor.#upDatePage(this.constructor.#page[newUrl.split("?")[0]], newUrl, oldUrl)
            })
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
        if(oldUrl == newUrl)return
        this.#currentUrl = newUrl
        newUrl = newUrl.split("?")[0]
        oldUrl = oldUrl.split("?")[0]
        let newDoc = new DOMParser().parseFromString(rep, "text/html")
        loadDiv.replaceChildren(...newDoc.body.childNodes)
        window.history.pushState(null, null, this.#currentUrl)
        new loc()
        this.#head(newDoc, newUrl, oldUrl)
        await this.#loadCss(newUrl)
        this.#body()
        await this.#loadScripts(newUrl, oldUrl)
        this.#href()
        this.#unloadScripts(newUrl, oldUrl)
        this.#unloadCss(newUrl)
    }

    static async #head(newDoc, newUrl, oldUrl){
        if(newUrl == oldUrl) return
        document.title = newDoc.title? newDoc.title : document.title
        for(const meta of document.head.querySelectorAll(":not([data-page='"+ newUrl +"'])[data-page]")){
            meta.remove()
        }
        for(const kid of newDoc.head.querySelectorAll(":not(title)")){
            kid.dataset.page = newUrl
            document.head.append(kid)
        }
    }

    static async #loadCss(newUrl){
        await forPromise(loadDiv.querySelectorAll("link[rel='stylesheet']"), (css) => {
            return new Promise((resolve) => {
                css.dataset.page = newUrl
                cssDiv.appendChild(css)
                css.onload = resolve
                css.onerror = resolve
            })
        })
    }

    static async #loadScripts(newUrl, oldUrl){
        if(!this.#pageVariable[newUrl.split("?")[0]]) this.#pageVariable[newUrl.split("?")[0]] = {}
        pv = this.#pageVariable[newUrl.split("?")[0]]
        if(!this.#scriptsPage[newUrl.split("?")[0]])this.#scriptsPage[newUrl.split("?")[0]] = {}
        if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0]){
            this.#moduleVariable[loc.parse(newUrl).path[0]] = {}
            mv = this.#moduleVariable[loc.parse(newUrl).path[0]]
        }
        for await(const script of bodyDiv.querySelectorAll("script")){
            await new Promise(async (resolve) => {
                let s = document.createElement("script")
                s.type = script.type
                if(script.src){
                    if(!this.#scriptsPage[newUrl.split("?")[0]][script.src]){
                        this.#scriptsPage[newUrl.split("?")[0]][script.src] = {
                            load: ()=>{},
                            changeModule: ()=>{},
                            unload: ()=>{},
                            returnLoad: {}
                        }
                        await new Promise((resolve) => {
                            s.dataset.scriptId = script.src
                            s.src = script.src
                            s.onload = resolve
                            s.onerror = resolve
                            script.replaceWith(s)
                        })
                    }
                    else{
                        script.dataset.scriptId = script.src
                        script.src = script.src
                        s.src = script.src
                        s.dataset.scriptId = script.src
                    }
                                       
                }
                else{
                    if(!script.dataset.scriptId?.startsWith("local-")){
                        s.dataset.scriptId = "local-" + (Math.random() + 1).toString(36).substring(7);
                        this.#scriptsPage[newUrl.split("?")[0]][s.dataset.scriptId] = {
                            load: ()=>{},
                            changeModule: ()=>{},
                            unload: ()=>{},
                            returnLoad: {}
                        }
                        s.innerHTML = script.innerHTML
                        script.replaceWith(s)
                    }
                    else if(!this.#scriptsPage[newUrl.split("?")[0]][script.dataset.scriptId]){
                        this.#scriptsPage[newUrl.split("?")[0]][script.dataset.scriptId] = this.#scriptsPage[oldUrl.split("?")[0]][script.dataset.scriptId]
                        s.dataset.scriptId = script.dataset.scriptId
                    }
                    else{
                        s.dataset.scriptId = script.dataset.scriptId
                    }
                }
                try{
                    this.#scriptsPage[newUrl.split("?")[0]][s.dataset.scriptId].returnLoad = await this.#scriptsPage[newUrl.split("?")[0]][s.dataset.scriptId].load()
                }catch(e){console.log(e);}

                resolve()
            })
        }
    }

    static #href(){
        for(const a of bodyDiv.querySelectorAll("a[href]")){
            let onclick = a.onclick? a.onclick.bind({}) : () => {}
            if(a.dataset.already) continue
            a.dataset.already = "true"
            a.onclick = (e) => {
                new tp(a.href.replace(window.location.origin, ""))
                onclick(e)
                return false
            }
        }
    }

    static #body(){
        for(let index = 0; bodyDiv.children[index] || loadDiv.children[0]; index++){
            if(loadDiv.children[0]?.dataset?.c && bodyDiv.children[index]?.dataset?.c && bodyDiv.children[index].dataset.c == loadDiv.children[0].dataset.c)loadDiv.children[0].remove()
            else if(bodyDiv.children[index] && loadDiv.children[0])bodyDiv.children[index].replaceWith(loadDiv.children[0])
            else if (!bodyDiv.children[index] && loadDiv.children[0])bodyDiv.append(loadDiv.children[0])
            else if (bodyDiv.children[index] && !loadDiv.children[0]){
                bodyDiv.children[index].remove()
                index--
            }
        }
    }

    static async #unloadScripts(newUrl, oldUrl){
        for(const scriptId in this.#scriptsPage[oldUrl.split("?")[0]]){
            await this.#scriptsPage[oldUrl.split("?")[0]][scriptId].unload(this.#pageVariable[oldUrl.split("?")[0]], this.#scriptsPage[oldUrl.split("?")[0]][scriptId].returnLoad)
            if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0])await this.#scriptsPage[oldUrl.split("?")[0]][scriptId].changeModule(this.#moduleVariable[loc.parse(oldUrl).path[0]])
            this.#scriptsPage[oldUrl.split("?")[0]][scriptId].returnLoad = {}
            if(scriptId.startsWith("local-")) delete this.#scriptsPage[oldUrl.split("?")[0]][scriptId]
        }
        for(const v in this.#pageVariable[oldUrl.split("?")[0]]){
            delete this.#pageVariable[oldUrl.split("?")[0]][v]
        }
        if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0]){
            for(const v in this.#moduleVariable[loc.parse(oldUrl).path[0]]){
                delete this.#moduleVariable[loc.parse(oldUrl).path[0]][v]
            }
        }
    }

    static async #unloadCss(newUrl){
        for(const css of cssDiv.querySelectorAll("link:not([data-page='"+ newUrl +"'])")){
            css.remove()
        }
    }

    static async #httpAcces(newUrl){
        return await new Promise((resolve, reject) => {
            fetch(newUrl, { method: "GET", headers: { "jside": "acces" } }).then(response=>{
                let link = response.url.split("?")[0]
                link = link[link.length-1] == "/"? link.substring(0, link.length-1) : link
                if(response.status == 200 && link == newUrl.split("?")[0]){
                    resolve()
                }
                else{
                    delete this.#page[newUrl.split("?")[0]]
                    window.sessionStorage.setItem('page', JSON.stringify(this.#page))
                    window.location.reload()
                }
            }).catch(this.error)
        })
    }

    static async #getPage(newUrl){
        return await new Promise((resolve, reject) => {
            fetch(newUrl, { method: "GET", headers: { "jside": true } }).then(response=>{
                if(!response.headers.get('content-disposition')){
                    response.text().then((rep) => {
                        if(rep == "reload"){
                            window.location.reload()
                        }
                        else{
                            if(!response.headers.get("nosave")){
                                let link = response.url.split("?")[0]
                                link = link[link.length-1] == "/"? link.substring(0, link.length-1) : link
                                this.#page[link] = rep
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

    static #pageVariable = {}

    static #currentUrl = ""

    static #moduleVariable = {}

    static on(event, fnc){
        this.#scriptsPage[this.#currentUrl][document.currentScript.dataset.scriptId][event] = fnc
    }
}

const bodyDiv = document.getElementById("bodyDiv")
const loadDiv = document.getElementById("loadDiv")
const cssDiv = document.getElementById("cssDiv")
var pv = {}
var mv = {}

new tp(window.location.href.replace(window.location.origin, ""), "?")
