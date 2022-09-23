class loc{
    constructor(){
        this.constructor.urlArgs = window.location.href.split("?")[1]? "?" + window.location.href.split("?")[1] : ""

        this.constructor.args = (function(){
            if(window.location.href.indexOf("?") > -1){
                let temp = {}
                for(const arg of window.location.href.split("?")[1].split("&")){
                    temp[arg.split("=")[0]] = arg.split("=")[1]
                }
                return temp
            }
        })()

        this.constructor.urlPath = window.location.href.replace(window.location.origin, "").split("?")[0]

        this.constructor.path = window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/")
    }

    static urlArgs
    
    static args

    static urlPath
    
    static path
    
    static parse(url){
        return {
            urlArgs: url.split("?")[1]? "?" + url.split("?")[1] : "",
            args: (function(){
                if(url.indexOf("?") > -1){
                    let temp = {}
                    for(const arg of url.split("?")[1].split("&")){
                        temp[arg.split("=")[0]] = arg.split("=")[1]
                    }
                    return temp
                }
            })(),
            urlPath: url.replace(window.location.origin, "").split("?")[0],
            path: url.replace(window.location.origin + "/", "").split("?")[0].split("/")
        }
    }
}

new loc()

async function forPromise(array, fnc){
    let listPromise = []
    for(let value of array){
        listPromise.push(fnc(value))
    }
    return await Promise.all(listPromise)
}

