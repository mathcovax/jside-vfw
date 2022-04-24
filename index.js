const express = require('express')
const app = express()
const server = require('http').createServer(app)
const url = require('url')
const cookieParser = require('cookie-parser');
const fs = require('fs');
const upload = require(__dirname + "/localSources/upload.js")

class jside{
    constructor(port=80, message=null){

        for(const script of fs.readdirSync(__dirname + "/webSources/defaultScripts")){
            this.constructor.index = this.constructor.index.replace("%script%", '<script src="/jside/scripts/' + script + '"></script> %script%')
        }
        this.constructor.index = this.constructor.index.replace("%script%", "")
        while(this.constructor.index.indexOf("%session%") >= 0){
            this.constructor.index = this.constructor.index.replace("%session%", this.constructor.session)
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
            else if(req.headers.jside && !req.baseUrl[0]){
                res.redirect("/" + this.constructor.defaultRedirect + req.url.substring(1))
            }
            else if(req.baseUrl[0] == "jside" && req.method == "GET"){
                this.constructor.#modules["jside"].GET(req, res)
            }
            else if((!req.headers.jside && this.constructor.#modules[req.baseUrl[0]]) || !req.baseUrl[0]){
                res.send(this.constructor.index)
            }
            else{
                res.status(404).send()
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
                    next(new Error("Connection refusé."));
                }
            })
        }

        server.listen(port, () => {
            console.log(message);
        })

    }

    static parametersApp = () => {}
    
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
                    res.status(404).send()
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

    static httpAcces(name, cnd){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].httpAcces = cnd
    }

    static socketAcces(name, cnd){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].socketAcces = cnd
    }

    static json(name, json){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].json = json
    }

    static addGet(name, path, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        path = !path[0] || path[0] == "/"? path : "/" + path
        path = path[path.length-1] == "/"? path.substring(0, path.length-1) : path
        if(this.#modules[name].modulesGET[name + path]) throw "module '" + name + "' already contains the path '" + path + "' for the method 'GET'"
        this.#modules[name].modulesGET[name + path] = fnc
    }

    static addPost(name, action, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        if(this.#modules[name].modulesPOST[action]) throw "module '" + name + "' already contains the action '" + action + "' for the method 'POST'"
        this.#modules[name].modulesPOST[action] = fnc
    }

    static socket(name, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].socket = fnc
    }

    static addComponent(name, nameComponent, html, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        if(this.#modules[name].component[nameComponent]) throw "module '" + name + "' already contains the conponent '" + nameComponent + "'"
        this.#modules[name].component[nameComponent] = {
            html: html,
            send: fnc
        }
    }

    static addUpload(name, fnc){
        if(!this.#modules[name]) throw "module '" + name + "' don't exist"
        this.#modules[name].upload = fnc
    }

    static #app = app

    static #io = false

    static session = String(Date.now())

    static index = fs.readFileSync(__dirname + "/webSources/index.html", "utf-8")

    static defaultRedirect = ""

    static viewDir = "./views"

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