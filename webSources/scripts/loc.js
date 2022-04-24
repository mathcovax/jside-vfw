const loc = {
    args: {},
    path: []
}

if(window.location.href.indexOf("?") > -1){
    for(const arg of window.location.href.split("?")[1].split("&")){
        loc.args[arg.split("=")[0]] = arg.split("=")[1]
    }
}

for(const path of window.location.href.replace(window.location.origin + "/", "").split("?")[0].split("/")){
    loc.path.push(path)
}
