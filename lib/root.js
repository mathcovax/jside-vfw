import express from "express"
import url from "url"
import fs from "fs"
import http from "http"
import cookieParser from "cookie-parser"
import Module from "./module.js"
import { Server as Io } from "socket.io"

import { dirname, resolve } from "path"
import { fileURLToPath } from 'url'
const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../")

export default class Root{
    /**
     * 
     * @param {Number} port 
     */
    constructor(port=80){
        if(this.constructor.#listRoot[port]) throw "Root '" + port + "' Already creates."
        this.port = port
        this.app = express()
        this.server = http.createServer(this.app)
        this.constructor.#listRoot[port] = this
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
     * @type {http}
     */
    server

    /**
     * @type {String}
     */
    session = String(Date.now())

    /**
     * @type {HTML}
     */
    index = fs.readFileSync(__dirname + "/webSources/index.html", "utf-8")

    /**
     * @type {urlPath[]}
     */
    headCss = []

    /**
     * @type {urlPath}
     */
    icon = ""

    /**
     * @type {String}
     */
    defaultTitle = ""

    /**
     * @type {HTML}
     */
    preloadBody = ""

    /**
     * @type {Dir}
     */
    publicDir = false
    
    /**
     * 
     * @param {()} fnc 
     */
    notFound(fnc){
        this.#notFound = fnc
    }

    #notFound = (req, res) => {res.status(404).send()}

    /**
     * @type {Boolean|Io}
     */
    io = false

    /**
     * 
     * @param {Module} module 
     */
    addModule(module){
        if(this.#modules[module.name]) throw "Module '" + module.name + "' Already existe in Root'" + this.port + "'."
        this.#modules[module.name] = module
        return module
    }

    /**
     * 
     * @param {String} message 
     */
    start(message=null){

        this.index = this.index.replace("{title}", this.defaultTitle)
        for(const css of this.headCss){
            this.index = this.index.replace("{css}", function(item){
                if(item != "{css}")return false
                return '<link rel="stylesheet" href="' + css + '">\n{css}'
            })
        }
        this.index = this.index.replace("{css}", "")
        this.index = this.index.replace("{icon}", this.icon)
        this.index = this.index.replace("{beforBody}", this.preloadBody)
        while(this.index.indexOf("{session}") >= 0){
            this.index = this.index.replace("{session}", this.session)
        }
        for(const script of fs.readdirSync(__dirname + "/webSources/defaultScripts")){
            this.index = this.index.replace("{script}", function(item){
                if(item != "{script}")return false
                return "\n<script>\n" + fs.readFileSync(__dirname + "/webSources/defaultScripts/" + script, "utf8") + "\n</script>\n{script}"
            })
        }
        this.index = this.index.replace("{script}", "")

        this.app.use(cookieParser())
        this.app.use(express.json())
        if(this.publicDir) this.app.use('/public', express.static(this.publicDir))

        this.app.use("*", async (req, res) => {
            req.baseUrl = req.baseUrl.substring(1).split('/')
            req.argUrl = url.parse(req.url, true).query
            req.url = req.url.substring(1)
            switch(await this.#modules[req.baseUrl[0]]?.httpRequest(req, res)){
                case null:
                    res.send(this.index)
                    return

                case false:
                    res.status(403).send()
                    return

                case undefined:
                    this.#notFound(req, res)
                    return
            }
        })

        if(this.io){
            this.io = new Io(this.server)
            this.io.use(async (socket, next) => {
                let value = await this.#modules[socket.handshake.auth?.module]?.socket.socketRequest(socket, this.io, next)
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

        this.server.listen(this.port, () => {
            console.log(message);
        })
    }

    #modules = {
        jside: {
            httpRequest: function(req, res){
                if(!this[req.method]) return
                this[req.method](req, res)
                return true
            },
            GET: function(req, res){
                switch(req.baseUrl[1]){
                    case "scripts":
                        if(this.script[req.baseUrl[2]]) res.send(this.script[req.baseUrl[2]])
                        break;

                    default:
                        res.status(404).send()
                        break;
                }
            },
            script: (() => {
                let obj = {}
                for(const script of fs.readdirSync(__dirname + "/webSources/scripts")){
                    obj[script] = fs.readFileSync(__dirname + "/webSources/scripts/" + script, "utf-8")
                }
                return obj
            })()
            
        }
    }

    /**
     * 
     * @param {String} module 
     * @returns {Module}
     */
    getModule(module){
        if(!this.#modules[module]) throw "Module '" + module + "' don't existe in Root '" + this.port + "'."
        return this.#modules[module]
    }

    static #listRoot = {}

    /**
     * 
     * @param {Number} port 
     * @returns {Root}
     */
    static getRoot(port){
        if(!this.#listRoot[port]) throw "Root '" + port + "' don't existe."
        return this.#listRoot[port]
    }
}