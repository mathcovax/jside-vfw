import { JSDOM } from "jsdom"

export default function ToWindow(html){
    let jsdom = new JSDOM(html, {  contentType: "text/html;charset=UTF-8"})
    return jsdom
}