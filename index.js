const express = require('express')
const app = express()
const server = require('http').createServer(app)
const url = require('url')
const cookieParser = require('cookie-parser');
const fs = require('fs');
const upload = require(__dirname + "/localSources/upload.js")

class jside{
    /**
     * @constructor jside class
     * 
     * @description Launch web server.
     * 
     * @example
     * new jside(80, "Server is ready.")
     * // Here the web server is launch on port 80 
     * // and send "Server is ready." when he is ready.
     * 
     * @param {number} port - This is the port used by web server.
     * @param {string} message - It's the message sends when server is ready.
     */
    constructor(port=80, message=null){

        for(const script of fs.readdirSync(__dirname + "/webSources/defaultScripts")){
            this.constructor.index = this.constructor.index.replace("{script}", function(item){
                if(item != "{script}"){
                    return false
                }
                return "\n<script>\n" + fs.readFileSync(__dirname + "/webSources/defaultScripts/" + script, "utf8") + "\n</script>\n{script}"
            })
        }
        this.constructor.index = this.constructor.index.replace("{script}", "")
        while(this.constructor.index.indexOf("{session}") >= 0){
            this.constructor.index = this.constructor.index.replace("{session}", this.#session)
        }

        this.constructor.#app.use(cookieParser())
        this.constructor.#app.set('view engine', 'ejs')
        this.constructor.#app.use(express.json())
        this.constructor.#app.set('views', this.constructor.viewDir)
        this.constructor.#app.use('/public', express.static(this.constructor.publicDir))
        this.constructor.parametersApp(this.constructor.#app)

        this.constructor.#app.use("*", (req, res) => {
            req.baseUrl = req.baseUrl.substring(1).split('/')
            req.argUrl = url.parse(req.url, true).query
            if(req.headers.jside && this.constructor.#modules[req.baseUrl[0]] && this.constructor.#modules[req.baseUrl[0]].httpAcces(req, res)){
                this.constructor.#modules[req.baseUrl[0]][req.method](req, res)
            }
            else if(!req.headers.jside){
                res.send(this.constructor.index)
            }
            else{
                res.status(404).send(" ")
            }
        })

        if(this.constructor.io){
            const io = require("socket.io")(server)
            io.use((socket, next) => {
                if(socket.handshake.auth.module && this.constructor.#modules[socket.handshake.auth.module] && this.constructor.#modules[socket.handshake.auth.module].socketAcces(socket.handshake.auth, socket.handshake.headers, next)){
                    this.constructor.#modules[socket.handshake.auth.module].socket(socket, io, next)
                    next()
                }
                else{
                    next(new Error("Connection refuse."))
                }
            })
        }

        server.listen(port, () => {
            console.log(message);
        })

    }
    /**
     * @static
     * 
     * @type {function(app)}
     * 
     * @description This parameter should be assigned to a function because he called as this in constructor. It allows you to apply additional parameters to the express module.
     * 
     * @example 
     * jside.parametersApp = function(app){
     *     app.set("trust proxy", true)
     * }
     * // Here the express option "trust proxy" is activate when the class is construct.
     * 
     * @param {object} app - The arg "app" is the object of express module. He is always give when this function is call by constructor.
     * 
     * @default (app) => {}
     */
    static parametersApp = (app) => {}
    
    /**
     * @static
     * 
     * @description This function create a module. The module's is a first value of url path.
     * 
     * @example
     * jside.createModule("callipyge")
     * // If url use for request is `http://www.fesse.fr/callipyge/charnu`
     * // so the called module is `callipyge`.
     * 
     * @param {string} name - Module's name.
     */
    static createModule(name){
        name = name[0] == "/"? name.substring(1) : name
        name = name[name.length-1] == "/"? name.substring(0, name.length-1) : name
        if(this.#modules[name]) throw "module '" + name + "' Already creates"
        this.#modules[name] = {
            GET: function(req, res){
                if(this.modulesGET[req.baseUrl.join("/")]){
                    this.modulesGET[req.baseUrl.join("/")](req, res, this.json, (v, r)=>{res.render(v, r? r : {})})
                }
                else{
                    this.modulesGET[req.baseUrl[0]](req, res, this.json, (v, r)=>{res.render(v, r? r : {})})
                }
            },
            POST: function(req, res){
                if(this.modulesPOST[req.headers.action]){
                    this.modulesPOST[req.headers.action](req, res, this.json, (v)=>{res.send(v)})
                }
                else{
                    res.status(404).send(" ")
                }
            },
            httpAcces: function(req, res){
                return true
            },
            socket: function(socket, io, next){
                
            },
            socketAcces: function(auth, headers, next){
                return true
            },
            modulesGET: {},
            modulesPOST: {},
            component: {},
            upload: false,
            json: {}
        }
    }

    /**
     * @static
     * 
     * @description `httpAccess` is used to give an authorization when a request is send to module.
     * 
     * @example
     * jside.httpAcces("callipyge", function(req, res){
     *     if(req.cookies.token == "superToken") return true
     *     else return false
     * })
     * // Here if the token don't macth, the request is refuse.
     * 
     * @param {string} name - Module's name.
     * @param {function(req, res)} cnd - The function in arg `cnd` it's called when server receive HTTP request, if she return `true`, the request access to module.
     */
    static httpAcces(name, cnd){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].httpAcces = cnd
    }

    /**
     * @static
     * 
     * @description `socketAcces` is used to give an authorization when a socket try connect to module.
     * 
     * @example
     * jside.socketAcces("callipyge", function(auth, headers, next){
     *     if(auth.version != "0.0.9"){
     *         next(new Error("bad version."))
     *         return false 
     *     } 
     *     else if(auth.token == "superToken") return true
     *     else return false
     * })
     * // Here if the token don't macth, the connection is refuse.
     * 
     * @param {string} name - Module's name.
     * @param {function(auth, headers, next)} cnd - The function in arg `cnd` it's called when a socket try connect to server, if she return `true`, the socket access to module.
     */
    static socketAcces(name, cnd){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].socketAcces = cnd
    }

    /**
     * @static
     * 
     * @description `json` is used to create a dictionary for module. 
     * 
     * @example
     * jside.json("callipyge", {fesse: "nice ass"})
     * 
     * @param {string} name - Module's name.
     * @param {object} json - It JSON object. it is always given when a request is receive.
     */
    static json(name, json){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].json = json
    }

    /**
     * @static
     * 
     * @description `addGet` is used to add an event of get request in a module.
     * 
     * @example
     * jside.addGet("callipyge", "/charnu", function(req, res, json, send){
     *     send("charnu", {name: json.fesse})
     * })
     * // Here the function `send(...)` is equal to `res.render(...)` of EJS module.
     * 
     * @param {string} name - Module's name.
     * @param {string} path - Url path after module's name.
     * @param {function(req, res, json, send)} fnc - The function is called when server receive get request.  
     */
    static addGet(name, path, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(this.#modules[name].modulesGET[name + path]) throw "module '" + name + "' already contains the path '" + path + "' for the method 'GET'"
        this.#modules[name].modulesGET[name + path] = fnc
    }

    /**
     * @static
     * 
     * @description `addPost` is used to add an event of post request in a module.
     * 
     * @example
     * // Client side:
     * let rep = await tm("ohdamn", {boul: "round"})
     * 
     * // Server side:
     * jside.addPost("callipyge", "ohdamn", function(req, res, json, send){
     *     if(req.body.boul == "round") send({status: "s", info: "niiiiice"})
     *     else send({status: "e", info: "badeeee"})
     * })
     * // Here the function `send(...)` is equal to `res.send(...)`.
     * 
     * @param {string} name - Module's name.
     * @param {string} action - Post request name.
     * @param {function(req, res, json, send)} fnc - The function is called when server receive post request.  
     */
    static addPost(name, action, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        if(this.#modules[name].modulesPOST[action]) throw "module '" + name + "' already contains the action '" + action + "' for the method 'POST'"
        this.#modules[name].modulesPOST[action] = fnc
    }

    /**
     * @static
     * 
     * @description `socket` is used to declare socket event. 
     * 
     * @example
     * jside.socket("callipyge", function(socket, io, next){
     *     socket.emit("exe", (() => {
     *         let temp = document.createElement("button")
     *         temp.innerText = "click him"
     *         document.body.appendChild(temp)
     *     }).toString())
     * })
     * // The `exe` transmitter is used to send and execute code to the client.
     * 
     * @param {string} name - Module's name.
     * @param {function(socket, io, next)} fnc - The function is called after connection is allowed.
     */
    static socket(name, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].socket = fnc
    }

    /**
     * @static
     * 
     * @description `addComponent` is used to add dynamique component. 
     * 
     * @example
     * jside.addComponent("callipyge", "pétard", `
     * <div>
     *     <button onclick="console.log('tropfort'); component.list["pétard"].refresh()"><%= ok %></button>
     * </div>
     * `, 
     * function(req, res, json, send){
     *     send({ok: "yasss"})
     * })
     * // `component.list["pétard"].refresh()` is used to refresh the component when button is clicked.
     * // Here the function `send(...)` is equal to `res.send(...)`.
     * 
     * @param {string} name - Module's name.
     * @param {string} nameComponent - Component's name.
     * @param {string} html - String should contain html and EJS code.
     * @param {function(req, res, json, send)} fnc - This function used to send information to client for make the component.
     */
    static addComponent(name, nameComponent, html, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        if(this.#modules[name].component[nameComponent]) throw "module '" + name + "' already contains the conponent '" + nameComponent + "'"
        this.#modules[name].component[nameComponent] = {
            html: html,
            send: fnc
        }
    }

    /**
     * @static
     * 
     * @description `addUpload` is used to add an upload tunnel.
     * 
     * @example
     * // Client side:
     * new upload("idOfFileInput", "idOflabelInfo")
     * 
     * // Server side:
     * jside.addUpload("callipyge", function(req, path){
     *     if(req.cookies.token == "WoW") path("./in/your/ass/in/the/back/right")
     *     else path("./here")
     * })
     * // Here `path(...)` is a function for give file destination.
     * 
     * @param {string} name - Module's name.
     * @param {function(req, path)} fnc - The function is called when begin uploaded and is used for give destination path.
     */
    static addUpload(name, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].upload = fnc
    }

    static #app = app

    static #io = false

    #session = String(Date.now())

    /**
     * @static 
     * 
     * @description `index` contains the default html.
     */
    static index = fs.readFileSync(__dirname + "/webSources/index.html", "utf-8")

    /**
     * @static 
     * 
     * @description `viewDir` contains the default dir of views.
     * 
     * @default "./views"
     */
    static viewDir = "./views"

    /**
     * @static 
     * 
     * @description `publicDir` contains the default dir of views.
     * 
     * @default "./public"
     */
    static publicDir = "./public"

    static #modules = {
        jside: {
            GET: function(req, res){
                switch(req.baseUrl[1]){
                    case "scripts":
                        if(this.script[req.baseUrl[2]]) res.send(this.script[req.baseUrl[2]])
                        break;
                    
                    case "component":
                        if(jside.#modules[req.baseUrl[2]] && jside.#modules[req.baseUrl[2]].component[req.baseUrl[3]] && jside.#modules[req.baseUrl[2]].httpAcces(req, res)){
                            res.send(jside.#modules[req.baseUrl[2]].component[req.baseUrl[3]].html)
                        }
                        else{
                            res.status(404).send(`"${req.baseUrl[3]}" n'est pas un composant du module ${req.baseUrl[2]}.`);
                        }
                        break;
                    
                    case "upload":
                        if(jside.#modules[req.baseUrl[2]] && jside.#modules[req.baseUrl[2]].upload && jside.#modules[req.baseUrl[2]].httpAcces(req, res)){
                            res.send(upload.parameters)
                            break;
                        }
                    
                    default:
                        res.status(404).send()
                        break;
                }
            },
            POST: function(req, res){
                switch(req.baseUrl[1]){
                    case "component":
                        if(jside.#modules[req.baseUrl[2]] && jside.#modules[req.baseUrl[2]].component[req.baseUrl[3]] && jside.#modules[req.baseUrl[2]].httpAcces(req, res)){
                            jside.#modules[req.baseUrl[2]].component[req.baseUrl[3]].send(req, res, jside.#modules[req.baseUrl[2]].json, (o)=>{res.send(o)})
                        }
                        else{
                            res.status(404).send(`"${req.baseUrl[3]}" n'est pas un composant du module ${req.baseUrl[2]}.`);
                        }
                        break;
                    
                    case "startUpload":
                        if(jside.#modules[req.baseUrl[2]] && jside.#modules[req.baseUrl[2]].upload && jside.#modules[req.baseUrl[2]].httpAcces(req, res)){
                            jside.#modules[req.baseUrl[2]].upload(req, (path)=>{res.send(upload.startUpLoad(req.body, path))})
                            break;
                        }

                    case "upload":
                        if(jside.#modules[req.baseUrl[2]] && jside.#modules[req.baseUrl[2]].upload && jside.#modules[req.baseUrl[2]].httpAcces(req, res) && upload.files[req.body.id]){
                            res.send(upload[req.body.action](req.body))
                            break;
                        }
    

                    default:
                        res.status(404).send()
                        break;
                }
            },
            httpAcces: function(){return true},
            script: (() => {
                let obj = {}
                for(const script of fs.readdirSync(__dirname + "/webSources/defaultScripts")){
                    obj[script] = fs.readFileSync(__dirname + "/webSources/defaultScripts/" + script, "utf-8")
                }
                for(const script of fs.readdirSync(__dirname + "/webSources/scripts")){
                    obj[script] = fs.readFileSync(__dirname + "/webSources/scripts/" + script, "utf-8")
                }
                return obj
            })()
            
        }
    }
}

module.exports = jside