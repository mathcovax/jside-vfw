import express from "express"
import fs from "fs"
import { JSDOM } from "jsdom"

export default class Component{
    /**
     * 
     * @param {String} name
     * @param  {HTML | Dir} html
     * @param  {Boolean} ext
     */
    constructor(name, html="", ext=false){
        if(!name) throw "Component :Component need a name."
        this.name = name
        if(ext)this.constructor.extComponent[name] = this
        let window = (new JSDOM(fs.existsSync(html)? fs.readFileSync(html, "utf-8") : html)).window
        for(const style of window.document.querySelectorAll("style")){
            style.dataset.styleId = name + "-" + (Math.random() + 1).toString(36)
        }
        this.html = window.document.documentElement.innerHTML
    }

    render(obj=false){
        if(obj === false)return this.html
        try{
            obj = typeof obj === "string"? eval("(" + obj + ")") : obj
        }
        catch(e){
            throw "Component : Render error. " + obj
        }

        let result = this.html
        const findVar = (obj, path) => {
            for(let index in obj){
                if(typeof obj[index] === "object"){
                    findVar(obj[index], path + index + ".")
                }
                else{
                    while(result.indexOf("{" + path + index + "}") !== -1){
                        result = result.replace("{" + path + index + "}", function(item){
                            if(item != "{" + path + index + "}") return false
                            return obj[index].toString()
                        })
                    }
                }
            }
        }
        findVar(obj, "")
        return result
    }

    /**
     * @type {HTML}
     */
    html = ""

    /**
     * @type {String}
     */
    name = ""

    /**
     * @private
     */
    static extComponent = {}

}