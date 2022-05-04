const loc = {
    urlArgs: window.location.href.split("?")[1]? "?" + window.location.href.split("?")[1] : "",
    args: (function(){
        if(window.location.href.indexOf("?") > -1){
            let temp = {}
            for(const arg of window.location.href.split("?")[1].split("&")){
                temp[arg.split("=")[0]] = arg.split("=")[1]
            }
            return temp
        }
    })(),
    urlPath: window.location.href.replace(window.location.origin, "").split("?")[0],
    path: window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/"),
    parse: (url) => {
        return {
            urlArgs: url.split("?")[1]? "?" + url.split("?")[1] : "",
            args: (function(){
                if(url.indexOf("?") > -1){
                    let temp = {}
                    for(const arg of window.location.href.split("?")[1].split("&")){
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



