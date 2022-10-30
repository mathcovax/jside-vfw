class tp{
    constructor(newUrl, oldUrl=window.location.href){
        if(this.constructor.#status === true) return
        this.constructor.#status = true

        this.constructor.#timeoutLoading = setTimeout(() => {
            this.constructor.elementLoadingOverlay.dataset.jsideProcess = "tp"
            this.constructor.elementLoadingOverlay.style.display = "block"
        }, this.constructor.timeoutLoadingOverlay);

        newUrl = this.constructor.#rectiLink(loc.parse(newUrl).urlPath) + loc.parse(newUrl).urlArgs
        oldUrl = oldUrl === "?"? oldUrl : this.constructor.#rectiLink(loc.parse(oldUrl).urlPath) + loc.parse(oldUrl).urlArgs
        if(this.constructor.page[newUrl.split("?")[0]]){
            this.constructor.#httpAcces(newUrl).then(() => {
                this.constructor.#upDatePage(this.constructor.page[newUrl.split("?")[0]], newUrl, oldUrl)
            })
        }
        else{
            this.constructor.#getPage(newUrl).then((obj) => {
                this.constructor.#upDatePage(obj.html, obj.repUrl, oldUrl)
            })
        }
    }

    static #rectiLink(newUrl){
        return window.location.origin + (!newUrl || newUrl[0] == "/"? "" : "/") + (newUrl[newUrl.length-1] == "/"? newUrl.substring(0, newUrl.length-1) : newUrl).replace(/#/g, "")
    }

    static async #upDatePage(rep, newUrl, oldUrl){
        if(oldUrl == newUrl){
            await this.#unloadScripts("?", oldUrl)
            while(this.elementBody.children[1]) {
                this.elementBody.children[1].remove()
            }
            oldUrl = "?"
        }
        this.#currentUrl = newUrl
        newUrl = newUrl.split("?")[0]
        oldUrl = oldUrl.split("?")[0]
        this.#newPage = new DOMParser().parseFromString(rep, "text/html")
        window.history.pushState(null, null, this.#currentUrl)
        document.title = this.#newPage.title || document.title
        new loc(newUrl, oldUrl)
        this.#rectiNewPage()
        this.#head(newUrl, oldUrl)
        await this.#loadCss(newUrl)
        this.#body()
        await this.#loadScripts(newUrl, oldUrl)
        this.#unloadScripts(newUrl, oldUrl)
        this.#unloadCss(newUrl)
        clearTimeout(this.#timeoutLoading)
        if(this.elementLoadingOverlay.dataset.jsideProcess == "tp")this.elementLoadingOverlay.style.display = "none"
        this.#status = false
    }

    static #rectiNewPage(){
        for(const tag of this.#newPage.head.querySelectorAll("[data-jside-default], [data-jside]")){
            tag.remove()
        }
        for(const tag of this.#newPage.body.querySelectorAll("[data-jside-default], [data-jside]")){
            tag.remove()
        }
        for(const tag of this.#newPage.querySelectorAll("style[data-jside-page-script]")){
            let script = this.#newPage.createElement("script")
            if(tag.dataset.jsidePageScript != ""){
                script.src = tag.dataset.jsidePageScript
            }
            else{
                script.textContent = tag.textContent
            }
            script.dataset.jsidePage = ""
            tag.replaceWith(script)
        }
    }

    static #head(newUrl, oldUrl){
        if(newUrl == oldUrl) return
        for(const tag of this.#newPage.head.querySelectorAll("[data-jside-page]:not(link[rel='stylesheet'])")){
            tag.dataset.jsidePage = newUrl
            this.elementHead.appendChild(tag)
        }
        for(const tag of this.elementHead.querySelectorAll(":not([data-jside-page='"+ newUrl +"']):not([data-jside-default]):not([data-jside])")){
            tag.remove()
        }
    }

    static async #loadCss(newUrl){
        await forPromise(this.#newPage.querySelectorAll("link[rel='stylesheet']"), (css) => {
            return new Promise((resolve) => {
                css.dataset.jsidePage = newUrl
                this.elementCss.appendChild(css)
                css.onload = resolve
                css.onerror = resolve
            })
        })
        for await(const tag of this.#newPage.querySelectorAll("style")){
            if(this.elementCss.querySelector("style[data-style-id='" + tag.dataset.styleId + "'][data-jside-page='"+ newUrl +"']")){
                tag.remove()
                continue
            }
            tag.dataset.jsidePage = newUrl
            this.elementCss.appendChild(tag)
        }
    }

    static #body(){
        for(let index = 1; this.elementBody.children[index] || this.#newPage.body.children[0]; index++){
            if(this.#newPage.body.children[0]?.dataset?.c && this.elementBody.children[index]?.dataset?.c && this.elementBody.children[index].dataset.c == this.#newPage.body.children[0].dataset.c){
                if(this.elementBody.children[index].dataset.jsideScoped != this.#newPage.body.children[0].dataset.jsideScoped){
                    this.elementBody.children[index].dataset.jsideScoped = this.#newPage.body.children[0].dataset.jsideScoped
                    for(const tag of this.elementBody.children[index].querySelectorAll("[data-jside-scoped]")){
                        tag.dataset.jsideScoped = this.#newPage.body.children[0].dataset.jsideScoped
                    }
                }
                this.#newPage.body.children[0].remove()
            }
            else if(this.elementBody.children[index] && this.#newPage.body.children[0])this.elementBody.children[index].replaceWith(this.#newPage.body.children[0])
            else if (!this.elementBody.children[index] && this.#newPage.body.children[0])this.elementBody.append(this.#newPage.body.children[0])
            else if (this.elementBody.children[index] && !this.#newPage.body.children[0]){
                this.elementBody.children[index].remove()
                index--
            }
        }
        this.elementBody.dataset.jsideScoped = this.#newPage.body.dataset.jsideScoped
    }

    static async #loadScripts(newUrl, oldUrl){
        if(!this.#pageVariable[newUrl.split("?")[0]]) this.#pageVariable[newUrl.split("?")[0]] = {}
        pv = this.#pageVariable[newUrl.split("?")[0]]
        if(!this.#scriptsPage[newUrl.split("?")[0]])this.#scriptsPage[newUrl.split("?")[0]] = {}
        if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0]){
            this.#moduleVariable[loc.parse(newUrl).path[0]] = {}
            mv = this.#moduleVariable[loc.parse(newUrl).path[0]]
        }
        await this.#launchScriptsDefault("load", {newUrl: newUrl, oldUrl: oldUrl})

        for await(const script of document.querySelectorAll("script:not([data-jside]):not([data-jside-default])")){
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
                        s.dataset.scriptId = "local-" + (Math.random() + 1).toString(36)
                        this.#scriptsPage[newUrl.split("?")[0]][s.dataset.scriptId] = {
                            load: ()=>{},
                            changeModule: ()=>{},
                            unload: ()=>{},
                            destroy: () => {},
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

    static async #unloadScripts(newUrl, oldUrl){
        await this.#launchScriptsDefault("unload", {newUrl: newUrl, oldUrl: oldUrl})
        for await(const scriptId of Object.keys(this.#scriptsPage[oldUrl.split("?")[0]] || {})){
            await this.#scriptsPage[oldUrl.split("?")[0]][scriptId].unload(this.#pageVariable[oldUrl.split("?")[0]], this.#scriptsPage[oldUrl.split("?")[0]][scriptId].returnLoad)
            if(loc.parse(oldUrl).path[0] != loc.parse(newUrl).path[0]){
                await this.#launchScriptsDefault("changeModule", {newUrl: newUrl, oldUrl: oldUrl})
                await this.#scriptsPage[oldUrl.split("?")[0]][scriptId].changeModule(this.#moduleVariable[loc.parse(oldUrl).path[0]])
            }
            if(!document.querySelector("script[data-script-id='" + scriptId + "']"))this.#scriptsPage[oldUrl.split("?")[0]][scriptId].destroy()
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
        for(const css of this.elementCss.querySelectorAll("link:not([data-jside-page='"+ newUrl +"'])")){
            css.remove()
        }
        for(const style of this.elementCss.querySelectorAll("style:not([data-jside-page='"+ newUrl +"'])")){
            style.remove()
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
                    delete this.page[newUrl.split("?")[0]]
                    window.sessionStorage.setItem('page', JSON.stringify(this.page))
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
                                this.page[link] = rep
                                window.sessionStorage.setItem('page', JSON.stringify(this.page))
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

    static async #launchScriptsDefault(event, obj){
        for await(const fnc of this.#scriptsDefault[event]){
            await fnc(obj)
        }
    }

    static reload(){
        new tp(this.#currentUrl)
    }

    static error = (e) => {throw e}

    static page = {} //window.sessionStorage.getItem("page")? JSON.parse(window.sessionStorage.getItem("page")) : {}
    
    static #scriptsPage = {}

    static #pageVariable = {}

    static #scriptsDefault = {
        load: [],
        unload: [],
        changeModule: [],
    }

    static #currentUrl = ""

    static #moduleVariable = {}

    static #status = false

    static #timeoutLoading = false

    static timeoutLoadingOverlay = 500
    
    /**
     * @type {Document}
     */
    static #newPage = {}

    /**
     * @type {Element}
     */
     static elementHead = {}

    /**
     * @type {Body}
     */
    static elementBody = {}

    /**
     * @type {Element}
     */
    static elementCss = {}

    /**
     * @type {Element}
     */
    static elementLoadingOverlay = {}

    /**
     * @type {Element}
     */
    static elementJside = {}

    static on(event, fnc){
        if(document.currentScript.dataset.scriptId != undefined){
            this.#scriptsPage[this.#currentUrl.split("?")[0]][document.currentScript.dataset.scriptId][event] = fnc
        }
        else if(document.currentScript.dataset.jsideDefault != undefined){
            this.#scriptsDefault[event].push(fnc)
        }
    }

}

var pv = {}
var mv = {}
var v = {}

document.addEventListener("click", (e) => {
    if(e.target.nodeName === "A" && e.target.href){
        e.preventDefault()
        if(e.target.onclick && e.target.onclick(e.target) === false){
            return false
        }
        if(e.target.href.replace(window.location.href, "")[0] != "#")new tp(e.target.href.replace(window.location.origin, ""))
        else{
            try {   
                document.querySelector(loc.parse(e.target.href).url.substring(1)).scrollIntoView({behavior: "smooth"})
            } catch (error) {
                
            }
            
        }
    }
})

window.addEventListener('popstate', (e) => {
    window.location.reload()
})

window.onload = () => {
    tp.page[window.location.href[window.location.href.length-1] == "/"?window.location.href.slice(0, -1) : window.location.href] = document.documentElement.outerHTML
    for(const tag of document.querySelectorAll("[data-jside-page]")){
        tag.remove()
    }

    tp.elementJside = document.body.children[0]
    tp.elementBody = document.body
    tp.elementCss = tp.elementJside.querySelector("#css")
    tp.elementLoadingOverlay = tp.elementJside.querySelector("#loading-overlay")
    tp.elementHead = document.head

    let div = document.createElement("div")
    div.style.display = "none"
    div.id = "import-body"
    div.innerHTML = tp.elementJside.querySelector("#import-body").contentWindow.document.body.innerHTML
    tp.elementJside.querySelector("#import-body").replaceWith(div)
    for(const ns of tp.elementJside.querySelector("#import-body").querySelectorAll("noscript")){
        let s = document.createElement("script")
        s.textContent = ns.textContent.replace(/&lt;/g,'<').replace(/&gt;/g,'>')
        s.dataset.jsideDefault = ""
        ns.replaceWith(s)
    }

    tp.elementLoadingOverlay.style.backgroundColor = ""

    new tp(window.location.href.replace(window.location.origin, ""), "?")
}
