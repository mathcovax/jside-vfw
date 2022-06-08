pv.divInfo = false

pv.seeInfo = function(info){
    if(pv.divInfo){
        pv.divInfo.innerHTML = info
    }
    else{
        pv.divInfo = document.createElement("div")
        pv.divInfo.className = "divInfo"
        pv.divInfo.style.position = "absolute"
        pv.divInfo.style.top = "0px"
        pv.divInfo.style.left = "0px"
        pv.divInfo.style.width = "100%"
        pv.divInfo.style.height = "100vh"
        pv.divInfo.style.display = "flex"
        pv.divInfo.style.alignItems = "center"
        pv.divInfo.style.justifyContent = "center"
        pv.divInfo.style.backgroundColor = "rgba(0, 0, 0, 0.50)"
        pv.divInfo.style.color = "white"
        pv.divInfo.style.fontSize = "40px"
        pv.divInfo.style.zIndex = "100"
        pv.divInfo.style.userSelect = "none"
        pv.divInfo.innerHTML = info
        document.body.prepend(pv.divInfo)
    }
    
}

pv.deleteInfo = function(){
    if(pv.divInfo){
        pv.divInfo.remove()
        pv.divInfo = false
    }
}