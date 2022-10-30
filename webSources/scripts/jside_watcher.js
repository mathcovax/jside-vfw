const s = io({
    rejectUnauthorized: false,
    auth: {
        name: "jside"
    }
})

s.on("disconnect", () => {
    tp.elementLoadingOverlay.style.display = "block"
})

s.io.on("reconnect", () => {
    window.location.reload()
})

s.on("refresh_watcher", (arr) => {
    for(const obj of arr){
        delete tp.page[window.location.origin + (obj.url=="/"?"":obj.url)]
        if(obj.url === loc.urlPath){
            tp.reload()
        }
        if(obj.reload){
            tp.reload()
        }
    }
})