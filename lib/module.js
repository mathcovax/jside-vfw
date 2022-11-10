import express from "express"
import Root from "./root.js"
import Component from "./component.js"
import Page from "./page.js"

export default class Module{
    /**
     * @param {String} name 
     */
    constructor(name=""){
        this.name = name;
    };

    /**
     * @private 
     */
    async httpRequest(req, res){
        switch (req.method){
            
            case "GET":

                switch (await (async () => {
                    try{
                        return await this.#modulesGET[req.baseUrl.join("/")].httpAcces(req, res, {json: this.json, gson: Root.json})
                    }catch(e){
                        if(e.toString() !== "TypeError: Cannot read properties of undefined (reading 'httpAcces')")console.error(e);
                        return null
                    }
                })()) {

                    case true:
                        if(req.headers.vieujs === "acces") res.status(200).send() 
                        else this.#modulesGET[req.baseUrl.join("/")].fnc(req, res, {json: this.json, sp: (name, code=200)=>{res.status(code).send(this.#page[name].result)}})
                        return true
                    
                    case false:
                        return false
                    
                    case null:
                        if(this.#notFound(req, res, {json: this.json, sp: (name, code=200)=>{res.status(code).send(this.#page[name].result)}}) === null) return
                        return true

                    case undefined:
                        return true
                }

            case "POST":
                switch (await this.#httpAcces(req, res)) {

                    case true:
                        this.#POST(req, res)
                        return true
                        
                    case false:
                        return false
                }
        
            default:
                return undefined
        }

    }

    /**
     * @typedef {Object} getshort
     * @property {JSON} json
     * @property {(name: String, code: Number)} sp
     */

    /**
     * @typedef {Object} accesshort
     * @property {JSON} json
     * @property {JSON} gson
     */

    /**
     * @param {urlPath} path 
     * @param {(req:express.Request, res:express.Response, short:getshort)} fnc 
     * @param {(req:express.Request, res:express.Response, httpAcces:()Boolean, short:accesshort)} httpAcces 
     * @returns {Module}
     */
    get(path, fnc, httpAcces){
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(this.#modulesGET[this.name + path]) throw "Module : '" + this.name + "' already contains the path '" + path + "' for the method 'GET'."
        this.#modulesGET[this.name + path] = {
            fnc: fnc,
            httpAcces: httpAcces? 
                (async (req, res, short) => {return await httpAcces(req, res, short, async () => {return await this.#httpAcces(req , res, short)})}) : 
                (async (req, res, short) => {return await this.#httpAcces(req, res, short)})
        }
        return this
    }

    /**
     * @param {urlPath} path
     */
    removeGet(path){
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(!this.#modulesGET[this.name + path]) throw "Module : '" + this.name + "' don't contains the path '" + path + "' for the method 'GET'."
        delete this.#modulesGET[this.name + path]
    }

    /**
     * @param {urlPath} path
     * @param {(req:express.Request, res:express.Response, httpAcces:()Boolean, short:accesshort)} httpAcces 
     * @returns {Module}
     */
    getHttpAcces(path, httpAcces){
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(!this.#modulesGET[this.name + path]) throw "Module : '" + this.name + "' don't contains the path '" + path + "' for the method 'GET'."
        this.#modulesGET[this.name + path].httpAcces = (async (req, res, short) => {return await httpAcces(req, res, short, async () => {return await this.#httpAcces(req , res, short)})})
        return this
    }

    /**
     * @param {urlPath} path
     */
    removeHttpAcces(path){
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(!this.#modulesGET[this.name + path]) throw "Module : '" + this.name + "' don't contains the path '" + path + "' for the method 'GET'."
        this.#modulesGET[this.name + path].httpAcces = (async (req, res, short) => {return await this.#httpAcces(req, res, short)})

    }

    /**
     * @param {(req:express.Request, res:express.Response, short: getshort)} fnc 
     * @returns {Module}
     */
    notFound(fnc){
        this.#notFound = fnc
        return this
    }

    #notFound = (req, res) => {return null}

    /**
     * @typedef {Object} postshort
     * @property {JSON} json
     * @property {JSON} gson
     * @property {(data: JSON) void} s
     * @property {(data: JSON) void} e
     * @property {(data: url) void} r
     * @property {(info: String) {s:(data: JSON)void, e:(data: JSON)void}} msg
     */

    /**
     * @param {String} name
     * @param {(req:express.Request, res:express.Response, short: postshort)} fnc 
     * @returns {Module}
     */
    post(name, fnc){
        if(this.#modulesPOST[name]) throw "Module : post '" + name + "' Already existe in module '" + this.name + "'."
        this.#modulesPOST[name] = fnc
        return this
    }

    /**
     * @param {String} name
     */
    removePost(name){
        if(!this.#modulesPOST[name]) throw "Module : post '" + name + "' don't existe in module '" + this.name + "'."
        delete this.#modulesPOST[name]
    }

    #POST(req, res){
        if(this.#modulesPOST[req.baseUrl[1]]){
            this.#modulesPOST[req.baseUrl[1]](req, res, {
                json: this.json, 
                gson: Root.json, 
                s: (s)=>{res.send({status:"s", data:s})}, 
                e: (e)=>{res.send({status:"e", data:e})}, 
                r: (r)=>{res.send({status:"r", url:r})},
                msg: (msg) => {
                    return {
                        s: (s)=>{res.send({status:"s", info: msg, data:s})},
                        e: (e)=>{res.send({status:"e", info: msg, data:e})},
                    }
                }
            })
        }
        else{
            res.status(404).send()
        }
    }

    /**
     * @param {(req:express.Request, res:express.Response)} fnc
     * @returns {Module}
     */
    httpAcces(fnc){
        this.#httpAcces = fnc
        return this
    }

    #httpAcces = async function(req, res){
        return true
    }   

    /**
     * @param {Component} component 
     * @returns {Component}
     */
    addComponent(component){
        if(this.#component[component.name]) throw "Module : component '" + component.name + "' Already existe in module '" + this.name + "'."
        this.#component[component.name] = component
        return component
    }

    /**
     * @param {String} name 
     * @returns {Component}
     */
    getComponent(name){
        if(!this.#component[name]) throw "Module : component '" + name + "' don't existe in module '" + this.name + "'."
        return this.#component[name]
    }

    /**
     * @param {String} name
     */
    remvoveComponent(name){
        if(!this.#component[name]) throw "Module : component '" + name + "' don't existe in module '" + this.name + "'."
        delete this.#component[name]
    }

    /**
     * @param {Page} page 
     * @param {JSON} json
     * @returns {Page}
     */
    addPage(page, json){
        if(this.#page[page.name]) throw "Module : page '" + page.name + "' Already existe in module '" + this.name + "'."
        page.module = this
        page.render()
        this.#page[page.name] = page
        return page
    }

    /**
     * @param {String} name 
     * @returns {Page}
     */
    getPage(name){
        if(!this.#page[name]) throw "Module : page '" + name + "' don't existe in module '" + this.name + "'."
        return this.#page[name]
    }

    /**
     * @param {String} name
     */
    removePage(name){
        if(!this.#page[name]) throw "Module : page '" + name + "' don't existe in module '" + this.name + "'."
        delete this.#page[name]
    }

    /**
     * @type {String}
     */
    name = ""

    #modulesGET = {}

    #modulesPOST = {}

    /**
     * @private
     */
    #component = {}

    get component(){
        return this.#component
    }

    #page = {}

    get page(){
        return this.#page
    }

    #upload = false
    
    json = {}

    destroy(){
        for(const page in this.#page){
            this.#page[page].destroy()
            delete this.#page[page]
        }
        for(const component in this.#component){
            this.#component[component].destroy()
            delete this.#component[component]
        }
    }
}