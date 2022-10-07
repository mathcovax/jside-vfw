import { JSDOM } from "jsdom"
import Component from "./component.js"
import Module from "./module.js"
import ToWindow from "./toWindow.js"
import fs from "fs"

export default class Page{
    /**
     * 
     * @param {String} name 
     * @param {HTML | Dir} html
     */
    constructor(name, html){
        if(!name) throw "Page need a name."
        this.html = fs.existsSync(html)? fs.readFileSync(html, "utf-8") : html
        this.name = name
    }

    /**
     * @private
     */
    async render(obj={}, components){
        let module = this.module !== ""? this.module + "/" : ""
        obj = {...obj, ...this.json}
        this.html = this.customRender(this.html)
        let page = ToWindow(this.html).window
        while(page.document.querySelector("div[data-mc]") || page.document.querySelector("div[data-ec]")){
            for(const component of page.document.querySelectorAll("div[data-mc]")){
                let div = page.document.createElement("div")
                if(components[component.dataset.mc])div.innerHTML = components[component.dataset.mc].render(component.innerHTML === ""? false : component.innerHTML)
                else throw "Page :'" + component.dataset.mc + "' is not component."
                div.children[0].dataset.c = module + component.dataset.mc
                component.outerHTML = div.innerHTML
            }
            for(const component of page.document.querySelectorAll("div[data-ec]")){
                let div = page.document.createElement("div")
                if(Component.extComponent[component.dataset.ec])div.innerHTML = Component.extComponent[component.dataset.ec].render(component.innerHTML === ""? false : component.innerHTML)
                else throw "Page :'" + component.dataset.ec + "' is not component."
                div.children[0].dataset.c = "ext//" + component.dataset.ec
                component.outerHTML = div.innerHTML
            }
        }

        for(const script of page.document.querySelectorAll("script")){
            let div = page.document.createElement("noscript")
            if(script.src != ""){
                div.dataset.jsidePageScript = script.src
            }
            else{
                div.dataset.jsidePageScript = ""
                div.textContent = script.textContent
            }
            script.replaceWith(div)
        }

        let rootIndex = ToWindow(this.rootIndex).window
        for(const tag of page.document.head.children){
            if(tag.nodeName === "TITLE"){
                rootIndex.document.title = tag.innerHTML
                continue
            }
            tag.dataset.jsidePage = ""
            rootIndex.document.head.appendChild(tag.cloneNode(true))
        }
        for(const tag of page.document.body.children){
            tag.dataset.jsidePage = ""
            rootIndex.document.body.appendChild(tag.cloneNode(true))
        }
        rootIndex.document.body.appendChild(rootIndex.document.body.children[rootIndex.document.body.children.length-1])

        let html = "<!DOCTYPE html>\n" + rootIndex.document.documentElement.outerHTML

        const findVar = (obj, path) => {
            for(let index in obj){
                if(typeof obj[index] === "object"){
                    findVar(obj[index], path + index + ".")
                }
                else{
                    while(html.indexOf("{" + path + index + "}") >= 0){
                        html = html.replace("{" + path + index + "}", function(item){
                            if(item != "{" + path + index + "}") return false
                            return obj[index].toString()
                        })
                    }
                }
            }
        }
        findVar(obj, "")
        page.close()
        rootIndex.close()
        this.isRender++
        this.result = html
    }

    /**
     * 
     * @param {HTML} html 
     * @returns {HTML}
     */
    customRender = (html) => {return html}

    /**
     * @private
     */
    json = {}

    /**
     * @private
     */
    module = ""

    /**
     * @private
     */
    rootIndex = ""

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

    /**
     * @type {Number}
     */
    isRender = 0
    
}