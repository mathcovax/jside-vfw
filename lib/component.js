import fs from "fs"
import ToWindow from "./toWindow.js"

export default class Component{
    /**
     * 
     * @param {String} name
     * @param  {HTML | Dir} html
     */
    constructor(name, html=""){
        if(!name) throw "Component : Component need a name."
        this.name = name
        this.html = fs.existsSync(html)? fs.readFileSync(html, "utf-8") : this.html
        this.preRender()
    }

    /**
     * @private 
     */
    preRender(){
        let window = ToWindow(this.html).window
        for(const style of window.document.querySelectorAll("style")){
            style.dataset.styleId = this.name + "-" + (Math.random() + 1).toString(36)
        }
        this.html = window.document.documentElement.innerHTML.replace(/\{\*\*NAME\}/g, this.name)
        window.close()
    }

    /**
     * @private 
     */
    render(obj=false){
        obj = obj || "{}"
        try{
            obj = typeof obj === "string"? eval("(" + obj + ")") : obj
        }
        catch(e){
            throw "Component : input object is wrong." + obj
        }

        let html = this.html
        html.match(/\{\*.*?\}/g)?.map((x) => {
            html = html.replace(x, ((o) => {
                x = x.replace(/[{*}]/g, "").split(":")
                
                try{
                    for(const item of x[0].split(".")){
                        o = o[item]
                    }
                    if(typeof o !== "string") throw ""
                }
                catch{
                    if(x[1] !== undefined){
                        x.shift()
                        return x.join(":")
                    }
                    else{
                        throw "Component : Value: '" + x.join(":") + "' not found in input object." + obj
                    }
                }
                return o
            })(obj))
        })

        return html
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
    page = []

}