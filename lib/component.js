import express from "express"
import fs from "fs"

export default class Component{
    /**
     * 
     * @param {String} name
     * @param  {HTML | Dir} html
     */
    constructor(name, html=""){
        if(!name) throw "Component need a name."
        if(!html && this.constructor.componentDir !== false && fs.existsSync(this.constructor.componentDir + "/" + name + ".html")){
            if(this.constructor.component[name]) throw "Component named '" + name + "' already existe."
            this.html = fs.readFileSync(this.constructor.componentDir + "/" + name + ".html")
            this.constructor.component[name] = this
        }
        else{
            this.html = fs.existsSync(html)? fs.readFileSync(html) : html
        }
        this.name = name
       
    }

    /**
     * 
     * @private 
     */
    componentRequest(req, res){
        switch (req.method) {
            case "GET":
                res.send(this.html)
                break;
        
            case "POST":
                this.#POST(req, res)
                break;
        }
    }

    /**
     * @type {HTML}
     */
    html = ""

    /**
     * 
     * @param {(req:express.Request, res:express.Response)} fnc 
     * @returns {Component}
     */
    getData(fnc){
        this.#POST = fnc
        return this
    }

    #POST = (req, res) => {res.send({})} 

    /**
     * @type {String}
     */
    name = ""

    /**
     * @private
     */
    static component = {}

    /**
     * @type {Dir}
     */
    static componentDir = false
}