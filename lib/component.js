import express from "express"
import fs from "fs"

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
        this.html = fs.existsSync(html)? fs.readFileSync(html) : html
        if(ext)this.constructor.extComponent[name] = this
       
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