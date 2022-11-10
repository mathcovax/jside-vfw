import express from "express";
import url from "url";
import fs from "fs";
import http from "http";
import cookieParser from "cookie-parser";
import Module from "./module.js";
import Upload from "./upload.js";
import { Server as Io } from "socket.io";
import ToWindow from "./toWindow.js";
import Socket from "./socket.js";
import Page from "./page.js";
import { VieujsDirectories, VieujsDirectoriesFile } from "./directories.js";

export default class Root{

    /**
     * @param {Number} port
     * @param {()void} callback
     * @private
     */
    static init(port=this.port, callback=()=>{}){
        this.#app.use(cookieParser());
        this.#app.use(express.json());
        this.#server = http.createServer(this.#app);
       
        this.#app.use("*", async (req, res) => {
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

        if(this.io){
            this.io = new Io(this.#server);
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

        this.makeIndex();
        
        this.#server.listen(port, () => {
            callback();
            this.#callback();
        });
    }

    static makeIndex(){
        if(this.#indexIsMake) return;
        const vieujsIndex = ToWindow(VieujsDirectoriesFile.vieujsIndex).window;
        const importBody = ToWindow((new Page("", this.index)).render()).window;
        const mainIndex = ToWindow(this.index).window;

        this.importBody = "<!DOCTYPE html>\n" + importBody.document.body.outerHTML;

        if(this.io){
            this.#addScriptSrcToVieujsIndex.splice(0, 0, "/vieujs/js/socket.js");
            this.#addScriptSrcToVieujsIndex.splice(0, 0, "/socket.io/socket.io.js");
        }

        for(let src of this.#addScriptSrcToVieujsIndex){
            let script = vieujsIndex.document.createElement("script");
            script.src = src;
            vieujsIndex.document.head.append(script);
        }

        mainIndex.document.body.innerHTML = "";

        for(const tag of mainIndex.document.head.children){
            tag.dataset.vieujsDefault = "";
        }
        
        for (let index = vieujsIndex.document.head.children.length-1; index >= 0; index--) {
            vieujsIndex.document.head.children[index].dataset.vieujs = "";
            mainIndex.document.head.prepend(vieujsIndex.document.head.children[index].cloneNode(true));
        }

        vieujsIndex.document.body.children[0].dataset.vieujs = "";
        mainIndex.document.body.append(vieujsIndex.document.body.children[0].cloneNode(true));

        mainIndex.document.body.children[0].querySelector("#loading-overlay").innerHTML = fs.existsSync(this.loadingOverlay)?fs.readFileSync(this.loadingOverlay):this.loadingOverlay;
        for(const s of mainIndex.document.body.children[0].querySelector("#loading-overlay").querySelectorAll("script")){
            s.dataset.vieujsDefault = "";
        }

        this.index = (new Page("", mainIndex.serialize().replace(/\{session\}/g, this.#session))).render();

        vieujsIndex.close();
        mainIndex.close();
        importBody.close();

        this.#indexIsMake = true;
    }

    /**
     * @type {Numder}
     */
    static port = 80;

    static #callback = () => {console.log("ready");};

    /**
     * @type {()}
     */
    static callback(fnc){
        if(typeof fnc == "function")this.#callback = fnc;
    }

    static #app = express();

    /**
     * @type {express.Express}
     */
    static get app(){
        return this.#app;
    }
    
    static #server;

    /**
     * @type {http.Server}
     */
    static get server(){
        return this.#server;
    }

    /**
     * @type {String}
     */
    static #session = String(Date.now());

    static get session(){
        return this.#session;
    }

    /**
     * @type {HTML | path}
     */
    static index = VieujsDirectoriesFile.mainIndex;

    /**
     * @type {HTML | path}
     */
    static loadingOverlay = VieujsDirectoriesFile.loadingOverlay;

    /**
     * @type {HTML}
     */
    static importBody = "";

    static #indexIsMake = false;

    static get indexIsMake(){
        return this.#indexIsMake;
    }

    static #addScriptSrcToVieujsIndex = [];

    /**
     * @type {Array}
     */
    static get addScriptSrcToVieujsIndex(){
        return this.#addScriptSrcToVieujsIndex;
    }

    static #json = {};

    /**
     * @type {JSON}
     */
    static get json(){
        return this.#json;
    }

    /**
     * @type {JSON}
     */
    static set json(arg){
        try{
            this.#json = JSON.parse(JSON.stringify(arg));
        }
        catch{
            throw "Root: is not a json.";
        }
    }
    
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
        vieujs: {
            httpRequest: (req, res) => {
                if(!this.#modules.vieujs[req.method]) return
                return this.#modules.vieujs[req.method](req, res)
            },
            GET: (req, res) => {
                switch(req.baseUrl[1]){
                    case "js":
                        if(this.#modules.vieujs.script[req.baseUrl[2]]) res.send(this.#modules.vieujs.script[req.baseUrl[2]])
                        return true

                    case "import-body":
                        res.send(this.importBody)
                        return true

                    default:
                        res.status(404).send()
                        return true
                }
            },
            POST:(req, res) => {
                switch (req.baseUrl[1]){
                    case "extPost":
                        if(!this.#extPost[req.baseUrl[2]]){
                            res.status(404).send()
                            return true
                        }
                        this.#extPost[req.baseUrl[2]](req, res, {
                            gson: this.#json, 
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

                    // case "upload":
                    //     return Root.upload.uploadRequest(req, res)
                
                    default:
                        res.status(404).send()
                        return true
                }
            },
            script: (() => {
                let obj = {}

                for(const script of fs.readdirSync(VieujsDirectories.webSources + "/scripts")){
                    obj[script] = fs.readFileSync(VieujsDirectories.webSources + "/scripts/" + script, "utf-8")
                }

                obj["defaultScript.js"] = (() => {
                    let result = ""
                    for(const script of fs.readdirSync(VieujsDirectories.webSources + "/defaultScripts")){
                        result += fs.readFileSync(VieujsDirectories.webSources + "/defaultScripts/" + script, "utf-8") + "\n\n"
                    }
                    return result
                })()

                return obj
            })(),
            destroy(){}
        }
    }

    static get modules(){
        return this.#modules
    }

    static #socket = {
        
    }

    static get socket(){
        return this.#socket
    }

    /**
     * @private
     */
    static #extComponent = {}

    static get extComponent(){
        return this.#extComponent
    }

    /**
     * @param {Component} component
     * @return {Component}
     */
    static addExtComponent(component){
        if(this.#extComponent[component.name]) throw "Root : extComponent '" + component.name + "' Already existe in root '" + this.port + "'."
        this.#extComponent[component.name] = component
        return component
    }

    /**
     * @param {String} name 
     * @returns {Component}
     */
    static getExtComponent(name){
        if(!this.#extComponent[name]) throw "Root : extComponent '" + name + "' don't existe in root '" + this.port + "'."
        return this.#extComponent[name]
    }

    /**
     * @param {String} name
     */
    static removeExtComponent(name){
        if(!this.#extComponent[name]) throw "Root : extComponent '" + name + "' don't existe in root '" + this.port + "'."
        delete this.#extComponent[name]
    }


    static #extPost = {}

    static get extPost(){
        return this.#extPost
    }

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
        if(this.#extPost[name]) throw "Root : extPost '" + name + "' already existe in Root '" + this.port + "'."
        this.#extPost[name] = fnc
    }

    /**
     * @param {String} name
     */
    static removeExtPost(name){
        if(!this.#extPost[name]) throw "Root : extPost '" + name + "' don't existe in Root '" + this.port + "'."
        delete this.#extPost[name]
    }

    static upload = new Upload()

    // /**
    //  * @param {String} name 
    //  * @param {(req:express.Request, res:express.Response)} fnc 
    //  */
    // static addUpload(name, fnc){
    //     if(this.upload.listUpload[name]) throw "Root : upload '" + name + "' already existe in Root '" + this.port + "'."
    //     this.upload.listUpload[name] = fnc
    // }

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

    static destroy(){
        if(this.#server)this.#server.close()
        for(const module in this.#modules){
            this.#modules[module].destroy()
            delete this.#modules[module]
        }
        for(const component in this.#extComponent){
            this.#extComponent[component].destroy()
            delete this.#extComponent[component]
        }
        for(const socket in this.#socket){
            delete this.#socket[socket]
        }
    }
}