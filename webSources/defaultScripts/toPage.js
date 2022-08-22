class tp{
    constructor(newUrl, oldUrl="?"){
        newUrl = this.constructor.#rectiLink(loc.parse(newUrl).urlPath) + loc.urlArgs
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
        this.#currentUrl = newUrl
        newUrl = newUrl.split("?")[0]
        oldUrl = oldUrl.split("?")[0]
        let newDoc = new DOMParser().parseFromString(rep, "text/html")
        loadDiv.replaceChildren(...newDoc.body.childNodes)
        window.history.pushState(null, null, this.#currentUrl)
        new loc()
        this.#head(newDoc, newUrl, oldUrl)
        await Promise.all([this.#loadScripts(newUrl, oldUrl), this.#loadCss(newUrl)])
        this.#href()
        this.#body()
        this.#unloadScripts(newUrl, oldUrl)
        this.#unloadCss(newUrl)
        tc.launch()
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
            this.#moduleVariable[newUrl.split("?")[0]] = {}
            mv = this.#moduleVariable[newUrl.split("?")[0]]
        }
        for await(const script of loadDiv.querySelectorAll("script")){
            await new Promise(async (resolve) => {
                let s = document.createElement("script")
                s.type = script.type
                if(script.src){
                    if(!this.#scriptsPage[newUrl.split("?")[0]][script.src]){
                        this.#scriptsPage[newUrl.split("?")[0]][script.src] = {
                            load: ()=>{},
                            unload: ()=>{},
                            returnLoad: {}
                        }
                    }
                    await new Promise((resolve) => {
                        s.src = script.src
                        s.onload = resolve
                        s.onerror = resolve
                        script.replaceWith(s)
                    })
                    try{
                        this.#scriptsPage[newUrl.split("?")[0]][script.src].returnLoad = await this.#scriptsPage[newUrl.split("?")[0]][script.src].load()
                    }catch(e){}                    
                }
                else{
                    s.innerHTML = script.innerHTML
                    script.replaceWith(s)
                }
                s.remove()
                resolve()
            })
        }
    }

    static async #href(){
        for(const a of loadDiv.querySelectorAll("a[href]")){
            let onclick = a.onclick? a.onclick.bind({}) : () => {}
            a.onclick = (e) => {
                new tp(a.href.replace(window.location.origin, ""), window.location.href)
                onclick(e)
                return false
            }
        }
    }

    static #body(){
        for(let index = 0; bodyDiv.children[index] || loadDiv.children[0]; index++){
            if(loadDiv.children[0]?.dataset?.name && bodyDiv.children[index]?.dataset?.name && bodyDiv.children[index].dataset.name == loadDiv.children[0].dataset.name)loadDiv.children[0].remove()
            else if(bodyDiv.children[index] && loadDiv.children[0]) bodyDiv.children[index].replaceWith(loadDiv.children[0])
            else if (!bodyDiv.children[index] && loadDiv.children[0])bodyDiv.append(loadDiv.children[0])
            else if (bodyDiv.children[index] && !loadDiv.children[0])bodyDiv.children[index].remove()
        }
    }

    static async #unloadScripts(newUrl, oldUrl){
        if(oldUrl == newUrl) return
        for(const src in this.#scriptsPage[oldUrl.split("?")[0]]){
            this.#scriptsPage[oldUrl.split("?")[0]][src].unload(this.#scriptsPage[oldUrl.split("?")[0]][src].returnLoad)
            this.#scriptsPage[oldUrl.split("?")[0]][src].returnLoad = {}
        }
        for(const v in this.#pageVariable[oldUrl.split("?")[0]]){
            delete this.#pageVariable[oldUrl.split("?")[0]][v]
        }
        if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0]){
            for(const v in this.#moduleVariable[oldUrl.split("?")[0]]){
                delete this.#moduleVariable[oldUrl.split("?")[0]][v]
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
                if(response.status == 200 && link == newUrl){
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
        this.#scriptsPage[this.#currentUrl][document.currentScript.src][event] = fnc
    }
}

const bodyDiv = document.getElementById("bodyDiv")
const loadDiv = document.getElementById("loadDiv")
const cssDiv = document.getElementById("cssDiv")
var pv = {}
var mv = {}

new tp(window.location.href.replace(window.location.origin, ""))