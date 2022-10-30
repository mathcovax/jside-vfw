import express from "express"
import url from "url"
import fs from "fs"
import http from "http"
import cookieParser from "cookie-parser"
import Module from "./module.js"
import Upload from "./upload.js"
import { Server as Io } from "socket.io"
import auto from "./auto.js"
import ToWindow from "./toWindow.js"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import Socket from "./socket.js"

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../")

export default class Root{
    /**
     * 
     * @param {Number} port 
     */
    constructor(port=80){
        this.port = port
        this.app = express()
        this.server = http.createServer(this.app)
        this.#modules.jside.root = this
        this.constructor.root = this
        let window = ToWindow(fs.readFileSync(__dirname + "/webSources/index.html", "utf-8")).window
        this.index = window.document.documentElement.outerHTML.replace(/\{session\}/g, this.session)
        window.close()
    }

    /**
     * @type {Numder}
     */
    port

    /**
     * @type {express}
     */
    app

    /**
     * @type {http.Server}
     */
    server

    /**
     * @type {String}
     */
    session = String(Date.now())

    /**
     * @private
     */
    index = ""

    models = {
        page: __dirname + "/models/index.html",
        component: __dirname + "/models/components.html",
        extComponent:  __dirname + "/models/extComponents.html"
    }

    /**
     * @private
     */
    importBody = ""

    /**
     * @private
     */
    json = {}
    
    /**
     * 
     * @param {()} fnc 
     */
    notFound(fnc){
        this.#notFound = fnc
    }

    /**
     * 
     * @param {(req:express.Request, res:express.Response)} fnc
     * @returns {Module}
     */
    #notFound = (req, res) => {res.status(404).send("<body><div>404 not found</div></body>")}

    /**
     * @type {Boolean | Io}
     */
    io = false

    /**
     * 
     * @param {Module} module 
     * @return {Module}
     */
    addModule(module){
        if(this.#modules[module.name]) throw "Root : module '" + module.name + "' Already existe in Root'" + this.port + "'."
        module.root = this
        this.#modules[module.name] = module
        return module
    }

    /**
     * 
     * @param {Socket} socket
     * @return {Socket}
     */
    addSocket(socket){
        if(this.#socket[socket.name]) throw "Root : socket '" + socket.name + "' Already existe in Root'" + this.port + "'."
        socket.root = this
        this.#socket[socket.name] = socket
        return socket
    }

    /**
     * 
     * @param {String} message
     */
    async start(message=null){
        if(this.io || process.env["jside_watcher"]){
            let window = ToWindow(this.index).window
            for(let src of ["/socket.io/socket.io.js", "/jside/js/socket.js", ...(process.env["jside_watcher"]?["/jside/js/jside_watcher.js"]:[])]){
                let script = window.document.createElement("script")
                script.src = src
                window.document.head.prepend(script)
            }
            this.index = window.document.documentElement.outerHTML
            window.close()

            this.io = new Io(this.server, process.env["jside_watcher"]?{pingTimeout: 2000, pingInterval: 1000}:{})
            this.io.use(async (socket, next) => {
                let value = await this.#socket[socket.handshake.auth?.name]?.socketRequest(socket, this.io)
                if(value === true){
                    next()
                }
                else if(typeof value === "string"){
                    next(new Error(value))
                }
                else if(value === false){
                    next(new Error("Connection denied."))
                }
                return
            })
        }
        
        await auto(resolve("./src"), this)

        this.app.use(cookieParser())
        this.app.use(express.json())
       
        this.app.use("*", async (req, res) => {
            req.baseUrl = req.baseUrl.substring(1).split('/')
            req.argUrl = url.parse(req.url, true).query
            req.url = req.url.substring(1)
            switch(await this.#modules[req.baseUrl[0]]?.httpRequest(req, res)){
                case false:
                    res.status(403).send()
                    return

                case undefined:
                    this.#notFound(req, res)
                    return
            }
        })

        this.server.listen(this.port, () => {
            console.log(message);
        })

    }

    #modules = {
        jside: {
            httpRequest: function(req, res){
                if(!this[req.method]) return
                return this[req.method](req, res)
            },
            GET: function(req, res){
                switch(req.baseUrl[1]){
                    case "js":
                        if(this.script[req.baseUrl[2]]) res.send(this.script[req.baseUrl[2]])
                        return true

                    case "import-body":
                        res.send(this.root.importBody)
                        return true

                    default:
                        res.status(404).send()
                        return true
                }
            },
            POST: function(req, res){
                switch (req.baseUrl[1]){
                    case "extPost":
                        if(!this.root.extPost[req.baseUrl[2]]){
                            res.status(404).send()
                            return true
                        }
                        this.root.extPost[req.baseUrl[2]](req, res, {
                            gson: this.json, 
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
                        return true

                    case "upload":
                        return this.root.upload.uploadRequest(req, res)
                
                    default:
                        res.status(404).send()
                        return true
                }
            },
            script: (() => {
                let obj = {}

                for(const script of fs.readdirSync(__dirname + "/webSources/scripts")){
                    obj[script] = fs.readFileSync(__dirname + "/webSources/scripts/" + script, "utf-8")
                }

                obj["defaultScript.js"] = (() => {
                    let result = ""
                    for(const script of fs.readdirSync(__dirname + "/webSources/defaultScripts")){
                        result += fs.readFileSync(__dirname + "/webSources/defaultScripts/" + script, "utf-8") + "\n\n"
                    }
                    return result
                })()

                return obj
            })(),
            root: {}
        }
    }

    #socket = {
        jside: {
            socketRequest(socket){
                return true
            }
        }
    }

    /**
     * @private
     */
    extComponent = {}

    /**
     * @param {Component} component
     * @return {Component}
     */
    addExtComponent(component){
        if(this.extComponent[component.name]) throw "Root : extComponent '" + component.name + "' Already existe in root '" + this.port + "'."
        this.extComponent[component.name] = component
        return component
    }

    /**
     * @param {String} name 
     * @returns {Component}
     */
    getExtComponent(name){
        if(!this.extComponent[name]) throw "Root : extComponent '" + name + "' don't existe in root '" + this.port + "'."
        return this.extComponent[name]
    }

    /**
     * @private
     */
    extPost = {}

    /**
     * @typedef {Object} postshort
     * @property {JSON} gson
     * @property {(data: JSON)} s
     * @property {(data: JSON)} e
     * @property {(data: url)} r
     * @property {(info: String) {s:(data: JSON)void, e:(data: JSON)void}} msg
     */

    /**
     * 
     * @param {String} name 
     * @param {(req:express.Request, res:express.Response, short:postshort)} fnc 
     */
    addExtPost(name, fnc){
        if(this.extPost[name]) throw "Root : extPost '" + name + "' already existe in Root '" + this.port + "'."
        this.extPost[name] = fnc
    }

    upload = new Upload()

    /**
     * 
     * @param {String} name 
     * @param {(req:express.Request, res:express.Response)} fnc 
     */
    addUpload(name, fnc){
        if(this.upload.listUpload[name]) throw "Root : upload '" + name + "' already existe in Root '" + this.port + "'."
        this.upload.listUpload[name] = fnc
    }

    /**
     * 
     * @param {String} module 
     * @returns {Module}
     */
    getModule(module){
        if(!this.#modules[module]) throw "Root : module '" + module + "' don't existe in Root '" + this.port + "'."
        return this.#modules[module]
    }

    /**
     * 
     * @param {String} module 
     * @returns {Module}
     */
    deleteModule(module){
        if(!this.#modules[module]) throw "Root : module '" + module + "' don't existe in Root '" + this.port + "'."
        delete this.#modules[module]
    }

    /**
     * @type {Root}
     */
    static root = {}
}