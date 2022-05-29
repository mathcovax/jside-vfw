import { JSDOM } from "jsdom"
import Component from "./component.js"

export default class Page{
    /**
     * 
     * @param {String} name 
     * @param {HTML} html 
     */
    constructor(name, html){
        if(!name) throw "Page need a name."
        this.html = html
        this.name = name
    }

    /**
     * @private
     */
    render(){
        let window = (new JSDOM(this.html)).window
        while(window.document.querySelector("div[data-sc]")){
            for(const component of window.document.querySelectorAll("div[data-sc]")){
                let div = window.document.createElement("div")
                if(!Component.component[component.dataset.sc]) throw "'" + component.dataset.sc + "' is not component of page '" + this.name + "'"
                div.innerHTML = Component.component[component.dataset.sc].html
                div.children[0].dataset.name = component.dataset.sc
                component.outerHTML = div.innerHTML
            }
        }
        this.html = window.document.documentElement.innerHTML
        window.close()
        this.isRender++
    }

    /**
     * @type {String}
     */
    name = ""

    /**
     * @type {HTML}
     */
    html = ""

    /**
     * @type {Number}
     */
    isRender = 0
    
}