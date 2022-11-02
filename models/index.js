import { Module } from "jside-vfw";

export default{
    /**
     * @param {Module} module 
     */
    before(module){
        /*
        module.json = {}

        module.httpAcces((req, res) => {
            res.redirect("" + req.url)
            return //request stop here
        })

        module.get("", (req, res, short) => {
            res.send()
        }, (res, req, httpAcces) => {
            return true //request continue to get
        })

        module.getHttpAcces((res, req, httpAcces) => {
            return false //request refuse acces and send 403 error
        })

        module.post("getdata", (req, res, short) => {
            short.s({info: "ok!"})
        })

        Page render:
         - {#} > global json (root.json)
         - {%} > module json (module.json)
         - {$} > pageRender object (module.json)
         - {*} > component object (whent he call in page)
        */
    },

    /**
     * @param {Module} module 
     */
    after(module){
        
    }
}