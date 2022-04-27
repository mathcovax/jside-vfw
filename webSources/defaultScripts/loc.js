const loc = {
    args: (function(){
        if(window.location.href.indexOf("?") > -1){
            let temp = {}
            for(const arg of window.location.href.split("?")[1].split("&")){
                temp[arg.split("=")[0]] = arg.split("=")[1]
            }
            return temp
        }
    })(),
    path: window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/"),
    parse: (url) => {
        let obj = {
            args: (function(){
                if(url.indexOf("?") > -1){
                    let temp = {}
                    for(const arg of window.location.href.split("?")[1].split("&")){
                        temp[arg.split("=")[0]] = arg.split("=")[1]
                    }
                    return temp
                }
            })(),
            path: url.replace(window.location.origin + "/", "").split("?")[0].split("/")
        }
        return obj
    }
}



