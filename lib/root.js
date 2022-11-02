import express from "express";
import url from "url";
import fs from "fs";
import http from "http";
import cookieParser from "cookie-parser";
import { models, RootDirectoriesFile } from "./directories.js";
import Module from "./module.js";
import Upload from "./upload.js";
import { Server as Io } from "socket.io";
import ToWindow from "./toWindow.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import Socket from "./socket.js";
import { launch, wakeUp } from "./auto/index.js"
import Page from "./page.js";

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");

export default class Root{

    /**
     * @param {Number} port
     * @param {()void} callback
     */
    static async init(port=this.port, callback=()=>{}){
        this.port = port;
        this.app = express();
        this.server = http.createServer(this.app);
        
        let jsideIndex = ToWindow(fs.readFileSync(__dirname + "/webSources/index.html", "utf-8")).window;

        if(this.io || process.env["jside_watcher"]){
            for(let src of ["/socket.io/socket.io.js", "/jside/js/socket.js", ...(process.env["jside_watcher"]?["/jside/js/jside_watcher.js"]:[])]){
                let script = jsideIndex.document.createElement("script");
                script.src = src;
                jsideIndex.document.head.prepend(script);
            }

            this.io = new Io(this.server, process.env["jside_watcher"]?{pingTimeout: 2000, pingInterval: 1000}:{});
            this.io.use(async (socket, next) => {
                let value = await this.#socket[socket.handshake.auth?.name]?.socketRequest(socket, this.io);
                if(value === true){
                    next();
                }
                else if(typeof value === "string"){
                    next(new Error(value));
                }
                else if(value === false){
                    next(new Error("Connection denied."));
                }
                return;
            })
        }
        if(this.auto || process.env["jside_watcher"])launch.defaultIndex()

        this.json = JSON.parse(fs.readFileSync(RootDirectoriesFile.globalJson));

        let importBody = ToWindow((new Page("", RootDirectoriesFile.mainIndex)).render()).window;
        for(const script of importBody.document.querySelectorAll("script")){
            let div = importBody.document.createElement("noscript");
            div.textContent = script.textContent;
            script.replaceWith(div);
        }
        this.#importBody = "<!DOCTYPE html>\n" + importBody.document.body.outerHTML;

        let mainIndex = ToWindow(fs.readFileSync(RootDirectoriesFile.mainIndex)).window;
        mainIndex.document.body.innerHTML = "";

        for(const tag of mainIndex.document.head.children){
            tag.dataset.jsideDefault = "";
        }
    
        for(const tag of jsideIndex.document.head.children){
            tag.dataset.jside = "";
            mainIndex.document.head.prepend(tag.cloneNode(true));
        }

        jsideIndex.document.body.children[0].dataset.jside = "";
        mainIndex.document.body.append(jsideIndex.document.body.children[0].cloneNode(true));

        mainIndex.document.body.children[0].querySelector("#loading-overlay").innerHTML = fs.readFileSync(RootDirectoriesFile.loadingOverlay);
        for(const s of mainIndex.document.body.children[0].querySelector("#loading-overlay").querySelectorAll("script")){
            s.dataset.jsideDefault = "";
        }

        this.#index = (new Page("", mainIndex.document.documentElement.outerHTML.replace(/\{session\}/g, this.session))).render();

        jsideIndex.close();
        mainIndex.close();
        importBody.close();
        
        if(this.auto || process.env["jside_watcher"])await wakeUp();

        this.app.use(cookieParser());
        this.app.use(express.json());
       
        this.app.use("*", async (req, res) => {
            req.baseUrl = req.baseUrl.substring(1).split('/');
            req.argUrl = url.parse(req.url, true).query;
            req.url = req.url.substring(1);
            switch(await this.#modules[req.baseUrl[0]]?.httpRequest(req, res)){
                case false:
                    res.status(403).send();
                    return;

                case undefined:
                    this.#notFound(req, res);
                    return;
            }
        });

        this.server.listen(this.port, callback);
    }

    /**
     * @type {Numder}
     */
    static port = 80;

    /**
     * @type {express}
     */
    static app;

    /**
     * @type {http.Server}
     */
    static server;

    /**
     * @type {String}
     */
    static session = String(Date.now());

    static #index = ""

    /**
     * @type {HTML}
     */
    static get index(){
        return this.#index
    }

    static #importBody = "";

    /**
     * @type {HTML}
     */
    static get importBody(){
        return this.#importBody
    }

    /**
     * @type {boolean}
     */
    static auto = false;

    /**
     * @type {JSON}
     */
    static json = {};
    
    /**
     * @param {()} fnc 
     */
    static notFound(fnc){
        this.#notFound = fnc;
    };

    /**
     * @param {(req:express.Request, res:express.Response)} fnc
     * @returns {Module}
     */
    static #notFound = (req, res) => {res.status(404).send("<body><div>404 not found</div></body>");};

    /**
     * @type {Boolean | Io}
     */
    static io = false;

    /**
     * @param {Module} module 
     * @return {Module}
     */
    static addModule(module){
        if(this.#modules[module.name]) throw "Root : module '" + module.name + "' Already existe in Root'" + this.port + "'.";
        module.root = this;
        this.#modules[module.name] = module;
        return module;
    };

    /**
     * @param {Socket} socket
     * @return {Socket}
     */
    static addSocket(socket){
        if(this.#socket[socket.name]) throw "Root : socket '" + socket.name + "' Already existe in Root'" + this.port + "'.";
        this.#socket[socket.name] = socket;
        return socket;
    };

    static #modules = {
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
                        res.send(Root.importBody)
                        return true

                    default:
                        res.status(404).send()
                        return true
                }
            },
            POST: function(req, res){
                switch (req.baseUrl[1]){
                    case "extPost":
                        if(!Root.extPost[req.baseUrl[2]]){
                            res.status(404).send()
                            return true
                        }
                        Root.extPost[req.baseUrl[2]](req, res, {
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
                        return Root.upload.uploadRequest(req, res)
                
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
        }
    }

    static #socket = {
        jside: {
            socketRequest(socket){
                return true
            }
        }
    }

    /**
     * @private
     */
    static extComponent = {}

    /**
     * @param {Component} component
     * @return {Component}
     */
    static addExtComponent(component){
        if(this.extComponent[component.name]) throw "Root : extComponent '" + component.name + "' Already existe in root '" + this.port + "'."
        this.extComponent[component.name] = component
        return component
    }

    /**
     * @param {String} name 
     * @returns {Component}
     */
    static getExtComponent(name){
        if(!this.extComponent[name]) throw "Root : extComponent '" + name + "' don't existe in root '" + this.port + "'."
        return this.extComponent[name]
    }

    /**
     * @param {String} name
     */
    static removeExtComponent(name){
        if(!this.extComponent[name]) throw "Root : extComponent '" + name + "' don't existe in root '" + this.port + "'."
        delete this.extComponent[name]
    }

    /**
     * @private
     */
    static extPost = {}

    /**
     * @typedef {Object} postshort
     * @property {JSON} gson
     * @property {(data: JSON)} s
     * @property {(data: JSON)} e
     * @property {(data: url)} r
     * @property {(info: String) {s:(data: JSON)void, e:(data: JSON)void}} msg
     */

    /**
     * @param {String} name 
     * @param {(req:express.Request, res:express.Response, short:postshort)} fnc 
     */
    static addExtPost(name, fnc){
        if(this.extPost[name]) throw "Root : extPost '" + name + "' already existe in Root '" + this.port + "'."
        this.extPost[name] = fnc
    }

    /**
     * @param {String} name
     */
    static removeExtPost(name){
        if(!this.extPost[name]) throw "Root : extPost '" + name + "' don't existe in Root '" + this.port + "'."
        delete this.extPost[name]
    }

    static upload = new Upload()

    /**
     * @param {String} name 
     * @param {(req:express.Request, res:express.Response)} fnc 
     */
    static addUpload(name, fnc){
        if(this.upload.listUpload[name]) throw "Root : upload '" + name + "' already existe in Root '" + this.port + "'."
        this.upload.listUpload[name] = fnc
    }

    /**
     * @param {String} module 
     * @returns {Module}
     */
    static getModule(module){
        if(!this.#modules[module]) throw "Root : module '" + module + "' don't existe in Root '" + this.port + "'."
        return this.#modules[module]
    }

    /**
     * @param {String} module 
     * @returns {Module}
     */
    static removeModule(module){
        if(!this.#modules[module]) throw "Root : module '" + module + "' don't existe in Root '" + this.port + "'."
        delete this.#modules[module]
    }
}