class tc{
    constructor(component){
        if(component.dataset.tmc){
            this.name = component.dataset.tmc
            this.component = component
            delete this.component.dataset.tmc
            this.component.dataset.name = this.name
            this.component.gd = async (json) => {return await this.getData(json)}
        }
        else {
            this.name = component.dataset.c
            this.component = component
            this.component.gd = this.getData
            this.component.rfh = this.refresh
            this.refresh()
        }
        
    }

    async refresh(){
        let div = document.createElement("div")
        div.innerHTML = await this.constructor.#getComponent(this.name)
        div.children[0].dataset.name = this.name
        div = div.children[0]
        this.component.replaceWith(div)
        for(const script of div.querySelectorAll("script")){
            let s = document.createElement("script")
            s.type = script.type
            s.innerHTML = script.innerHTML
            script.replaceWith(s)
            s.remove()
        }
        this.component = div
        this.component.gd = this.getData
        this.component.refresh = this.refresh
    }

    async getData(json={}){
        return await this.constructor.#getData(this.name, json)
    }

    component = {}

    name = ""

    static async #getComponent(name){
        if(this.#sessionComponent[name]) return this.#sessionComponent[name]
        return await new Promise((resolve, reject) => {
            fetch(window.location.origin + "/" + loc.path[0] + "/" + name, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "jside": "component"
                }
            }).then(rep => rep.text()).then((rep) => {
                this.#sessionComponent[name] = rep
                window.sessionStorage.setItem('component', JSON.stringify(this.#sessionComponent))
                resolve(rep)
            }).catch(reject)
        })
    }

    static async #getData(name, body={}){
        return await new Promise((resolve, reject) => {
            fetch(window.location.origin + "/" + loc.path[0] + "/" + name, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "jside": "component",
                },
                body: JSON.stringify(body)
            }).then(rep => rep.json()).then(resolve).catch(reject)
        })
    }

    static launch(){
        for(const component in this.#listComponent){
            this.#listComponent[component].component.remove()
            delete this.#listComponent[component]
        }
        for(const component of bodyDiv.querySelectorAll("div[data-c]")){
            this.#listComponent[component.dataset.c] = new tc(component)
        }
        for(const component of bodyDiv.querySelectorAll("div[data-tmc]")){
            this.#listComponent[component.dataset.mc] = new tc(component)
        }
    }

    static start(id){
        let tempComponent = document.querySelector("div[data-c=" + id + "]")
        this.#listComponent[tempComponent.dataset.name] = new tc(tempComponent)
        
    }

    static #listComponent = {}

    static #sessionComponent = window.sessionStorage.getItem("component")? JSON.parse(window.sessionStorage.getItem("component")) : {}
}