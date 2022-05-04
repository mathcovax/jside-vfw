function s(id){
    fastH.add(id)
    let object
    try{
        object = !id? s.caller.arguments[0].target : typeof id === 'object'? id.target? id.target : !id.nodeName? s.caller.arguments[0].target.parentElement : id : Array.isArray(id)? Number.isInteger(id[0])? s.caller.arguments[0].target.parentElement.children[id[0]] : typeof id[0] === 'object'? id[0].target.parentElement.children[id[1]] : document.getElementById(id[0]).children[id[1]] : document.getElementById(id)
    }catch{
        throw fastH.h
    }
    if(object.matechcide) return object
    
    object.matechcide = true
    object.val = (value) => {
        object.value = value != undefined? value : object.value
        return !value? object.value : object
    }
    object.txt = (value) => {
        object.innerText = value? value : object.innerText
        return !value? object.innerText : object
    }
    object.clicking = () => {
        object.onclick(object)
        return object
    }
    object.click = (value) => {
        object.onclick = value
        return object
    }

    object.c = (value) => {
        object.className = value? value : object.className
        return !value? object.className : object
    }
    object.dad = (value) => {
        value = value? value : 1
        let dad = object
        for (let index = 1; index <= value; index++) {
            dad = dad.parentElement
        }
        s(dad)
        return dad
    }
    object.kid = (value) => {
        if(!value) return object.children
        if(Array.isArray(value)){
            let kid = object
            for(let tkid of value){
                tkid -= 1
                kid = kid.children[tkid]
            }
            s(kid)
            return kid
        }
        value -= 1
        s(object.children[value])
        return object.children[value]
    }
    object.ce = (value, ss, ff) => {
        let kid = document.createElement(value)
        kid.dataset.ss = ss? ss : ""
        kid.dataset.ff = ff? ff : ""
        s(kid)
        object.appendChild(kid)
        return kid
    }
    object.cl = () => {return object.classList}
    object.clt = (value) => {
        for(const c of value.split(" ")){
            object.classList.toggle(c)
        }
        return object
    }
    object.cla = (value) => {
        for(const c of value.split(" ")){
            object.classList.add(c)
        }
        return object
    }
    object.clr = (value) => {
        for(const c of value.split(" ")){
            object.classList.remove(c)
        }
        return object
    }

    object.ss = []
    if(object.dataset.ss){
        for(const s of object.dataset.ss.split(";")){
            object.ss.push(eval("(value) => {object.style." + s + "}"))
        }
    }
    object.$ = () => {return object.style}
    
    object.ff = []
    if(object.dataset.ff){
        for(const f of object.dataset.ff.split("/")){
            object.ff.push(eval(f))
        }
    }

    object.fastProperties = object.fastProperties? object.fastProperties : object.dataset.dp? eval("(() => {return " + object.dataset.dp + "})")() : {}
    object.fp = (value) => {
        object.fastProperties = value? value : object.fastProperties
        return object.fastProperties

    }
    object.mfp = (value) => {
        let temp = {...object.fastProperties}
        value(object.fastProperties)
        let obj = {}
        for(const t in object.fastProperties){
            if(object.fastProperties[t] != temp[t]) obj[t] = object.fastProperties[t]
        }
        return object
    }
    object.fpc = (value1, value2, value3) => {
        for(const obj in value1){
            if(value1[obj] != object.fastProperties[obj]){
                if(value3){
                    for(const obj3 in value3){
                        object.fastProperties[obj3] = value3[obj3]
                    }
                }
                object.dofec(object)
                object.dofec = () => {}
                throw false
            }
        }
        if(value2){
            for(const obj2 in value2){
                object.fastProperties[obj2] = value2[obj2]
            }
        }
        return object
    }
    object.do = (value) => {
        value(object)
        return object
    }
    object.fec = (value) => {
        object.dofec = value
        return object
    }
    object.dofec = () => {}

    return object
}

var fastH = {
    h: [],
    add: function(value){
        this.h.push(value)
        if(this.h.length > 10){
            this.h.splice(0, 1)
        }
    }
}

tp.on("unload", document.currentScript.dataset.src, function(e){
    s = undefined
    fastH = undefined
})