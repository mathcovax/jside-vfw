import express from "express"
import Component from "./component.js"
import Page from "./page.js"
import Socket from "./socket.js"

export default class Module{
    /**
     * 
     * @param {String} name 
     */
    constructor(name=""){
        this.name = name
    }

    /**
     * 
     * @private 
     */
    async httpRequest(req, res){
        if(!req.headers.jside) return null
        switch(await this.#httpAcces(req, res)){
            case true:
                switch(req.headers.jside){
                    case "true":
                        switch (req.method) {
                            case "GET":
                                this.#GET(req, res)
                                break;
        
                            case "POST":
                                this.#POST(req, res)
                                break;

                            default:
                                res.status(403).send()
                                return
                        }
                        break;
        
                    case "acces":
                        res.status(200).send()
                        break;

                    case "component":
                        if(!this.#component[req.baseUrl[1]]) res.status(404).send("'" + req.baseUrl[1] + "' is not component of module '" + this.name + "'");
                        else this.#component[req.baseUrl[1]].componentRequest(req, res)
                        break;
                }
                return true

            case false:
                return false
        
            case undefined:
                return true

            case null:
                return
        }
    }

    /**
     * @typedef {Object} getshort
     * @property {JSON} json
     * @property {(name: String, code: Number)} sp
     */

    /**
     * 
     * @param {urlPath} path 
     * @param {(req:express.Request, res:express.Response, short: getshort)} fnc 
     * @returns {Module}
     */
    get(path, fnc){
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(this.#modulesGET[this.name + path]) throw "Module '" + this.name + "' already contains the path '" + path + "' for the method 'GET'."
        this.#modulesGET[this.name + path] = fnc
        return this
    }

    #GET(req, res){
        if(this.#modulesGET[req.baseUrl.join("/")]){
            this.#modulesGET[req.baseUrl.join("/")](req, res, {json: this.#json, sp: (name, code=200)=>{res.status(code).send(this.#page[name].html)}})
        }
        else{
            this.#notFound(req, res, {json: this.#json, sp: (name, code=200)=>{res.status(code).send(this.#page[name].html)}})
        }
    }

    /**
     * 
     * @param {(req:express.Request, res:express.Response, short: getshort)} fnc 
     * @returns {Module}
     */
    notFound(fnc){
        this.#notFound = fnc
        return this
    }

    #notFound = (req, res) => {res.status(404).send()}

    /**
     * @typedef {Object} postshort
     * @property {JSON} json
     * @property {(data: JSON)} s
     * @property {(data: JSON)} e
     * @property {(data: url)} r
     */

    /**
     * 
     * @param {urlPath} path 
     * @param {(req:express.Request, res:express.Response, short: postshort)} fnc 
     * @returns {Module}
     */
    post(name, fnc){
        if(this.#modulesPOST[name]) throw "Module '" + this.name + "' already contains the path '" + name + "' for the method 'POST'."
        this.#modulesPOST[name] = fnc
        return this
    }

    #POST(req, res){
        if(this.#modulesPOST[req.baseUrl[1]]){
            this.#modulesPOST[req.baseUrl[1]](req, res, {json: this.#json, s: (s)=>{res.send({status:"s", data:s})}, e: (e)=>{res.send({status:"e", data:e})}, r: (r)=>{res.send({status:"r", url:r})}})
        }
        else{
            res.status(404).send()
        }
    }

    /**
     * 
     * @param {(req:express.Request, res:express.Response)} fnc
     * @returns {Module}
     */
    httpAcces(fnc){
        this.#httpAcces = fnc
        return this
    }

    #httpAcces = function(req, res){
        return true
    }   

    /**
     * @type {Socket}
     */
    socket = new Socket()

    /**
     * 
     * @param {JSON} json 
     * @returns {Module}
     */
    json(json){
        this.#json = json
        return this
    }

    /**
     * 
     * @param {Component} component 
     * @returns {Component}
     */
    addComponent(component){
        if(this.#component[component.name]) throw "Component '" + component.name + "' Already existe in module '" + this.name + "'."
        this.#component[component.name] = component
        return component
    }

    /**
     * 
     * @param {Page} page 
     * @returns {Page}
     */
    addPage(page){
        if(this.#page[page.name]) throw "Page '" + page.name + "' Already existe in module '" + this.name + "'."
        if(page.isRender == 0)page.render()
        this.#page[page.name] = page
        return page
    }

    /**
     * @type {String}
     */
    name = ""

    #modulesGET = {}

    #modulesPOST = {}

    #component = {}

    #page = {}

    #upload = false
    
    #json = {}
}