import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export class VieujsDirectories{
    static #main = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");
    static get main(){
        return this.#main;
    }

    static get lib(){
        return this.#main + "/lib";
    }

    static get bin(){
        return this.#main + "/bin";
    }

    static get webSources(){
        return this.#main + "/webSources";
    }

    static get html(){
        return this.webSources + "/html";
    }

}

export class VieujsDirectoriesFile{
    static get vieujsIndex(){
        return VieujsDirectories.html + "/vieujsIndex.html";
    }

    static get loadingOverlay(){
        return VieujsDirectories.html + "/loadingOverlay.html";
    }

    static get mainIndex(){
        return VieujsDirectories.html + "/mainIndex.html";
    }
}
