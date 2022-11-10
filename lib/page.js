import ToWindow from "./toWindow.js";
import fs from "fs";
import sass from "sass";
import Root from "./root.js";
import prettier from "prettier";

export default class Page{
    /**
     * 
     * @param {String} name 
     * @param {HTML | Dir} html
     */
    constructor(name, html){
        if(name === undefined) throw "Page : Page need a name."
        this.html = fs.existsSync(html)? fs.readFileSync(html, "utf-8") : html
        this.name = name
    }

    /**
     * @private
     */
    render(){
        let module = this.module? this.module.name + "/" : false
        let page = ToWindow(this.constructor.customRender(this.html)).window
        while((page.document.querySelector("div[data-mc]") && module) || page.document.querySelector("div[data-ec]")){

            if(module){
                for(const component of page.document.querySelectorAll("div[data-mc]")){
                    if(component.dataset.mc.endsWith(".*")){
                        let innerHTML = component.innerHTML
                        component.innerHTML = ""
                        for(const key in this.module.component){
                            if(key.startsWith(component.dataset.mc.replace(".*", ""))){
                                let div = page.document.createElement("div")
                                div.dataset.mc = key
                                div.innerHTML = innerHTML
                                component.prepend(div)
                            }
                        }
                        component.outerHTML = component.innerHTML
                    }
                    else{
                        let div = page.document.createElement("div")
                        if(this.module.component[component.dataset.mc]){
                            div.innerHTML = this.module.component[component.dataset.mc].render(component.innerHTML === ""? false : component.innerHTML)
                            this.module.component[component.dataset.mc].page.push({
                                type: "root",
                                module: this.module.name,
                                page: this.name,
                                url: "/" + this.module.name + (this.name != this.module.name && this.name != "$"? this.name : "")
                            })
                        }
                        else throw "Page : '" + component.dataset.mc + "' is not component."
                        div.children[0].dataset.c = module + component.dataset.mc
                        for(let index = 0; index < component.attributes.length; index++){
                            if(component.attributes.item(index).name == "data-mc") continue
                            div.children[0].attributes.setNamedItem(component.attributes.removeNamedItem(component.attributes.item(index).name))
                        }
                        component.outerHTML = div.innerHTML
                    }
                }
            }
            for(const component of page.document.querySelectorAll("div[data-ec]")){
                if(component.dataset.ec.endsWith(".*")){
                    let innerHTML = component.innerHTML
                    component.innerHTML = ""
                    for(const key in Root.extComponent){
                        if(key.startsWith(component.dataset.ec.replace(".*", ""))){
                            let div = page.document.createElement("div")
                            div.dataset.ec = key
                            div.innerHTML = innerHTML
                            component.prepend(div)
                        }
                    }
                    component.outerHTML = component.innerHTML
                }
                else{
                    let div = page.document.createElement("div")
                    if(Root.getExtComponent(component.dataset.ec)){
                        div.innerHTML = Root.getExtComponent(component.dataset.ec).render(component.innerHTML === ""? false : component.innerHTML)
                        if(this.module){
                            Root.getExtComponent(component.dataset.ec).page.push({
                                type: "root",
                                module: this.module.name,
                                page: this.name,
                                url: "/" + this.module.name + (this.name != this.module.name && this.name != "$"? this.name : "")
                            })
                        }
                        else{
                            Root.getExtComponent(component.dataset.ec).page.push({
                                type: "restart",
                            })
                        }
                        
                    }
                    else throw "Page : '" + component.dataset.ec + "' is not component."
                    div.children[0].dataset.c = "ext//" + component.dataset.ec
                    for(let index = 0; index < component.attributes.length; index++){
                        if(component.attributes.item(index).name == "data-ec") continue
                        div.children[0].attributes.setNamedItem(component.attributes.removeNamedItem(component.attributes.item(index).name))
                    }
                    component.outerHTML = div.innerHTML
                }
            }
        }
        
        if(module){
            for(const tag of page.document.body.querySelectorAll("*")){
                tag.dataset.vieujsScoped = this.module.name + "/" + this.name
            }
    
            for(const style of page.document.querySelectorAll("style[scoped]")){
                style.textContent = style.textContent.replace(/\{/g, (value) => {
                    if(value == "{"){
                        return "[data-vieujs-scoped='" + this.module.name + "/" + this.name + "']{"
                    }
                })
            }
        }

        for(const script of page.document.querySelectorAll("script:not([data-vieujs-default]):not([data-vieujs])")){
            let div = page.document.createElement("style")
            div.type = "script"
            if(script.src != ""){
                div.dataset.vieujsPageScript = script.src
            }
            else{
                div.dataset.vieujsPageScript = ""
                div.textContent = "/* prettier-ignore */\n" + script.textContent
            }
            script.replaceWith(div)
        }

        try{
            for(const style of page.document.querySelectorAll("style[type='text/scss']")){
                style.textContent = sass.compileString(style.innerHTML, {style: "expanded"}).css.toString()
                style.type = "text/css"
            }
        }
        catch(e){
            console.log(e);
            throw "Page : sass build error."
        }

        let html

        if(module){
            let rootIndex = ToWindow(Root.index).window
            rootIndex.document.body.dataset.vieujsScoped = this.module.name + "/" + this.name
            
            for(const tag of page.document.head.children){
                if(tag.nodeName === "TITLE"){
                    rootIndex.document.title = tag.innerHTML
                    continue
                }
                tag.dataset.vieujsPage = ""
                rootIndex.document.head.appendChild(tag.cloneNode(true))
            }
            for(const tag of page.document.body.children){
                tag.dataset.vieujsPage = ""
                rootIndex.document.body.appendChild(tag.cloneNode(true))
            }
            rootIndex.document.body.appendChild(rootIndex.document.body.children[rootIndex.document.body.children.length-1])

            html = rootIndex.serialize()
            rootIndex.close()

            html.match(/\{\%.*?\}/g)?.map((x) => {
                html = html.replace(x, ((obj) => {
                    try{
                        for(const item of x.replace(/[{%} ]/g, "").split(".")){
                            obj = obj[item]
                        }
                        if(typeof obj !== "string") throw ""
                    }
                    catch{
                        throw "Page : Value '" + x + "' not found in '" + this.module.name + "' json."
                    }
                    return obj
                })(this.module.json))
            })

            html.match(/\{\$.*?\}/g)?.map((x) => {
                html = html.replace(x, ((obj) => {
                    try{
                        for(const item of x.replace(/[{$} ]/g, "").split(".")){
                            obj = obj[item]
                        }
                        if(typeof obj !== "string") throw ""
                    }
                    catch{
                        throw "Page : Value '" + x + "' not found in pageRender '" + this.name + "' from '" + this.module.name + "' json."
                    }
                    return obj
                })(this.module.json.pageRender[this.name]))
            })
        }
        else{
            html = page.serialize()
        }

        html.match(/\{\#.*?\}/g)?.map((x) => {
            html = html.replace(x, ((obj) => {
                try{
                    for(const item of x.replace(/[{#} ]/g, "").split(".")){
                        obj = obj[item]
                    }
                    if(typeof obj !== "string") throw ""
                }
                catch{
                    throw "Page : Value: '" + x + "' not found in global json."
                }
                return obj
            })(Root.json))
        })
        
        page.close();
        html = prettier.format(html, {parser: "html"}).replace(/ \/\* prettier-ignore \*\//g, "");
        this.result = html;
        return html;
    }

    /**
     * 
     * @param {HTML} html 
     * @returns {HTML}
     */
    static customRender = (html) => {return html}

    /**
     * @private
     */
    json = {}

    /**
     * @private
     */
    module = false

    /**
     * @type {String}
     */
    name = ""

    /**
     * @type {HTML}
     */
    html = ""
    
    /**
     * @type {HTML}
     */
    result = ""

    destroy(){
        delete this.html
        delete this.result
        delete this.module
    }
    
}