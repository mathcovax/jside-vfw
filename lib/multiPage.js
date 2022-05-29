import { JSDOM } from "jsdom"
import Page from "./page.js"
import Component from "./component.js"

export default class MultiPage{
    /**
     * 
     * @param {HTML} html 
     */
    constructor(html){
        if(!html) throw "MultiPage need a HTML."
        this.html = html
    }

    /**
     * 
     * @param {String} name
     * @param {{}} obj
     * @returns {Page}
     */
    render(name, obj){
        let window = (new JSDOM(this.html)).window
        while(window.document.querySelector("div[data-sc]")){
            for(const component of window.document.querySelectorAll("div[data-sc]")){
                let div = window.document.createElement("div")
                if(!Component.component[component.dataset.sc] && !obj[component.dataset.sc]) throw "Error with component in multiPage's render"
                if(obj[component.dataset.sc]) div.innerHTML = obj[component.dataset.sc].html
                else{ 
                    div.innerHTML = Component.component[component.dataset.sc].html
                    div.children[0].dataset.name = component.dataset.sc
                }
                component.outerHTML = div.innerHTML
            }
        }
        let html = window.document.documentElement.innerHTML
        window.close()
        return new Page(name, html)
    }

    html = ""
}