async function tm(action, body={}, option={}){
    option.tempText = option.tempText || ""
    option.id = option.id || "labelInfo"
    option.scrollTo = option.scrollTo || true
    option.module = option.module || false
    option.loadingOverlay = option.loadingOverlay === true? tp.timeoutLoadingOverlay : typeof option.loadingOverlay === "number"? option.loadingOverlay : false
    return await new Promise((resolve, reject) => {
        if(option.loadingOverlay !== false){
            option.loadingOverlay = setTimeout(() => {
                tp.elementLoadingOverlay.dataset.vieujsProcess = "tm"
                tp.elementLoadingOverlay.style.display = "block"
            }, option.loadingOverlay);
        }

        if(document.getElementById(option.id)){
            document.getElementById(option.id).style.color = ""
            document.getElementById(option.id).innerText = option.tempText
        }
        fetch(window.location.origin + "/" + (option.module || loc.path[0]) + "/" + action + loc.urlArgs, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then( response => response.json() )
        .then( response => {
            if(option.loadingOverlay !== false){
                clearTimeout(option.loadingOverlay)
                if(response.status != "r" && tp.elementLoadingOverlay.dataset.vieujsProcess == "tm")tp.elementLoadingOverlay.style.display = "none"
                else if(response.status == "r")tp.elementLoadingOverlay.dataset.vieujsProcess = "tp"
            }

            switch(response.status){
                case "e":
                    if(document.getElementById(option.id) && response.info){
                        document.getElementById(option.id).style.color = "red"
                        document.getElementById(option.id).innerText = response.info
                        if(option.scrollTo === true)document.getElementById(option.id).scrollIntoView({behavior: "smooth"})
                    }
                    else if(document.getElementById(option.id)){
                        document.getElementById(option.id).innerText = ""
                    }
                    reject(response.data)
                    break;

                case "s":
                    if(document.getElementById(option.id) && response.info){
                        document.getElementById(option.id).style.color = "green"
                        document.getElementById(option.id).innerText = response.info
                        if(option.scrollTo === true)document.getElementById(option.id).scrollIntoView({behavior: "smooth"})
                    }
                    else if(document.getElementById(option.id)){
                        document.getElementById(option.id).innerText = ""
                    }
                    resolve(response.data)
                    break;

                case "r":
                    new tp(response.url)
                    reject("redirect to " + response.url)
                    break; 
                
                default:
                    resolve(response)
                    break;
                    
            }
        })
        .catch((error) => {
            reject(error)
        })
    })
}