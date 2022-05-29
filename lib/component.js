import express from "express"

export default class Component{
    /**
     * 
     * @param {String} name 
     */
    constructor(name){
        if(!name) throw "Component need a name."
        if(this.constructor.component[name]) throw "Component named '" + name + "' already existe."
        this.name = name
        this.constructor.component[name] = this
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
}