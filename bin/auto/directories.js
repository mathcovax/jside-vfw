import { resolve } from "path";
import { VieujsDirectoriesFile } from "../../lib/directories.js";
import { VieujsDirectoriesBin } from "../directories.js";

export class models{
    static get main(){
        return VieujsDirectoriesBin.auto + "/models";
    }

    static page = this.main + "/page.html";

    static component = this.main + "/component.html";

    static extComponent =  this.main + "/extComponent.html";

    static extPost = this.main + "/extPost.js";

    static httpAcces = this.main + "/httpAcces.js";

    static json = this.main + "/json.json";

    static post = this.main + "/post.js";

    static socket = this.main + "/socket.js";

    static subHttpAcces = this.main + "/subHttpAcces.js";

    static js = this.main + "/index.js";

    static get globalJson(){
        return this.main + "/global.json";
    }

    static get customConfig(){
        return this.main + "/vieujs.config.js";
    }

    static get mainIndex(){
        return VieujsDirectoriesFile.mainIndex;
    }

    static get loadingOverlay(){
        return VieujsDirectoriesFile.loadingOverlay;
    }
}

export class RootDirectories{
    static main = "./";

    static name_workdir = "src";

    static get workdir(){
        return resolve(this.main, this.name_workdir);
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

export class RootDirectoriesFile extends RootDirectories{
    static page_extention = ".html";
    static name_mainIndex = "index";
    static get mainIndex(){
        return resolve(this.workdir, this.name_mainIndex + this.page_extention);
    };

    static json_extention = ".json";
    static name_globalJson = "global";
    static get globalJson(){
        return resolve(this.workdir, this.name_globalJson + this.json_extention);
    };

    static name_loadingOverlay = "loadingOverlay";
    static get loadingOverlay(){
        return resolve(this.workdir, this.name_loadingOverlay + this.page_extention);
    };

    static script_extention = ".mjs";
    static get customConfig(){
        return resolve(this.main, "./vieujs.config" + this.script_extention);
    };

    static char_file_ignore_get = "!";
}

export class ModuleDirectories extends RootDirectories{
    constructor(name){
        super();
        if(name === "") this.name = this.constructor.name_folder_main_module;
        else this.name = name;
        this.constructor.#listModule[name] = this;
    };

    get workdir(){
        return resolve(this.constructor.root, this.constructor.deplace, this.name);
    };

    get get(){
        return resolve(this.workdir, this.constructor.name_folder_module_get.replace(/\{NAME\}/g, this.name));
    };

    get post(){
        return resolve(this.workdir, this.constructor.name_folder_module_post.replace(/\{NAME\}/g, this.name));
    };

    get component(){
        return resolve(this.workdir, this.constructor.name_folder_module_component.replace(/\{NAME\}/g, this.name));
    };

    get httpAcces(){
        return resolve(this.workdir, this.constructor.name_folder_module_httpAcces.replace(/\{NAME\}/g, this.name));
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

    static #listModule = {};

    static get listModule(){
        return this.#listModule;
    }

    static getModule(arg){
        return this.#listModule[arg];
    }
};

export class ModuleDirectoriesFile extends RootDirectories{
    constructor(name){
        super();
        this.name = name;
    };

    get workdir(){
        return resolve(this.constructor.root, ModuleDirectories.deplace, this.name);
    };

    get mainPage(){
        return resolve(this.workdir, this.name.split("/").pop().replace(/\{NAME\}/g, this.name) + RootDirectoriesFile.page_extention);
    };

    get json(){
        return resolve(this.workdir, this.name.split("/").pop().replace(/\{NAME\}/g, this.name) + RootDirectoriesFile.json_extention);
    };

    get script(){
        return resolve(this.workdir, this.name.split("/").pop().replace(/\{NAME\}/g, this.name) + RootDirectoriesFile.script_extention);
    };

    get httpAcces(){
        return resolve(this.workdir, ModuleDirectories.name_folder_module_httpAcces.replace(/\{NAME\}/g, this.name) + RootDirectoriesFile.script_extention);
    };
    
};

export default class autoDir{
    static get models(){
        return models;
    }

    static get RootDirectories(){
        return RootDirectories;
    }

    static get RootDirectoriesFile(){
        return RootDirectoriesFile;
    }

    static get ModuleDirectories(){
        return ModuleDirectories;
    }

    static get ModuleDirectoriesFile(){
        return ModuleDirectoriesFile;
    }

}