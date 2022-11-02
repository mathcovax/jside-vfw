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

s.on("refresh_page_watcher", (arr) => {
    for(const obj of arr){
        delete tp.page[window.location.origin + (obj.url=="/"?"":obj.url)]
        if(obj.url === loc.urlPath){
            tp.reload()
        }
    }
})

s.on("refresh_module_watcher", (module) => {
    for(const page in tp.page){
        if(page.startsWith(window.location.origin + (module==""?"":"/"+module))) delete tp.page[page]
    }
    if(module === loc.path[0])tp.reload()
})