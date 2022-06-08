import { Root, Module } from "jside-vfw";

export default{
    /**
     * 
     * @param {Root} root 
     * @param {Module} module 
     */
    before(root, module){
        /*
        module.json({})

        module.httpAcces((req, res) => {
            return true
        })

        module.get("", (req, res, short) => {
            res.redirect("" + req.url)
        })

        module.post("getdata", (req, res, short) => {
            short.s({info: "ok!"})
        })
        */
    },

    /**
     * 
     * @param {Root} root 
     * @param {Module} module 
     */
    after(root, module){
        /*
        module.getPage("exemple").render({blabla: "ok !"})

        module.get("/test", (req, res, short) => {
            short.sp("testPage")
        })
        */
    }
}