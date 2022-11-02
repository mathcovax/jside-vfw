import { dirname, resolve, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");

const models = {
    page: __dirname + "/models/page.html",
    component: __dirname + "/models/component.html",
    extComponent:  __dirname + "/models/extComponent.html",
    extPost: __dirname + "/models/extPost.js",
    httpAcces: __dirname + "/models/httpAcces.js",
    mainIndex: __dirname + "/models/mainIndex.html",
    index: __dirname + "/models/index.js",
    json: __dirname + "/models/json.json",
    post: __dirname + "/models/post.js",
    socket: __dirname + "/models/socket.js",
    "sub-httpAcces": __dirname + "/models/sub-httpAcces.js",
    loadingOverlay: __dirname + "/models/loadingOverlay.html",
    globalJson: __dirname + "/models/global.json",
};

class RootDirectories{
    static main = "./";

    static name_workdir = "./";
    /**
     * @private
     */
    static get default_name_workdir(){
        return "./"
    } 

    static get workdir(){
        return resolve(resolve("./"), this.main, this.name_workdir);
    }

    static name_folder_assets = "assets"

    static get assets(){
        return resolve(this.workdir, this.name_folder_assets);
    }

    static name_folder_root = "root";

    static get root(){
        return resolve(this.workdir, this.name_folder_root);
    }

    static name_folder_extPost = "extPost";

    static get extPost(){
        return resolve(this.workdir, this.name_folder_extPost);
    }

    static name_folder_extComponent = "extComponent";

    static get extComponent(){
        return resolve(this.workdir, this.name_folder_extComponent);
    }

    static name_folder_socket = "socket";

    static get socket(){
        return resolve(this.workdir, this.name_folder_socket);
    }
};

class RootDirectoriesFile extends RootDirectories{


    static script_extention = ".mjs";

    static page_extention = ".html";
    static name_mainIndex = models.mainIndex.replace(".html", "");
    static get mainIndex(){
        return resolve(this.workdir, this.name_mainIndex + this.page_extention);
    };

    static json_extention = ".json";
    static name_globalJson = models.globalJson.replace(".json", "");
    static get globalJson(){
        return resolve(this.workdir, this.name_globalJson + this.json_extention);
    };

    static name_loadingOverlay = models.loadingOverlay.replace(".html", "");
    static get loadingOverlay(){
        return resolve(this.workdir, this.name_loadingOverlay + this.page_extention);
    };
}

class ModuleDirectories extends RootDirectories{
    constructor(name){
        super();
        this.name = name;
    };

    get workdir(){
        return resolve(this.constructor.root, this.constructor.deplace, this.name);
    };

    get get(){
        return resolve(this.workdir, this.constructor.name_folder_module_get);
    };

    get post(){
        return resolve(this.workdir, this.constructor.name_folder_module_post);
    };

    get component(){
        return resolve(this.workdir, this.constructor.name_folder_module_component);
    };

    get httpAcces(){
        return resolve(this.workdir, this.constructor.name_folder_module_httpAcces);
    };

    name = "";

    get file (){
        return new ModuleDirectoriesFile(this.name);
    };

    static deplace = "./";

    static name_folder_module_post = "post";

    static name_folder_module_get = "get";

    static name_folder_module_component = "component"

    static name_folder_module_httpAcces = "httpAcces";

    static name_folder_main_module = "$";
};

class ModuleDirectoriesFile extends RootDirectories{
    constructor(name){
        super();
        this.name = name;
    };

    get workdir(){
        return resolve(this.constructor.root, ModuleDirectories.deplace, this.name);
    };

    get mainPage(){
        return resolve(this.workdir, this.name.split("/").pop() + RootDirectoriesFile.page_extention);
    };

    get json(){
        return resolve(this.workdir, this.name.split("/").pop() + RootDirectoriesFile.json_extention);
    };

    get script(){
        return resolve(this.workdir, this.name.split("/").pop() + RootDirectoriesFile.script_extention);
    };

    get httpAcces(){
        return resolve(this.workdir, ModuleDirectories.name_folder_module_httpAcces + RootDirectoriesFile.script_extention);
    };
    
};

export {
    RootDirectories,
    RootDirectoriesFile,
    ModuleDirectories,
    ModuleDirectoriesFile,
    models,
};