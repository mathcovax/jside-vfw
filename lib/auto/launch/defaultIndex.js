
import { RootDirectoriesFile, models, RootDirectories } from "../../directories.js";
import fs from "fs";

export default function defaultIndex(){
    RootDirectories.name_workdir = RootDirectories.name_workdir==RootDirectories.default_name_workdir?"src":RootDirectories.name_workdir
    RootDirectoriesFile.name_mainIndex = RootDirectoriesFile.name_mainIndex==models.mainIndex.replace(".html", "")?"index":RootDirectoriesFile.name_mainIndex
    RootDirectoriesFile.name_loadingOverlay = RootDirectoriesFile.name_loadingOverlay==models.loadingOverlay.replace(".html", "")?"loadingOverlay":RootDirectoriesFile.name_loadingOverlay
    RootDirectoriesFile.name_globalJson = RootDirectoriesFile.name_globalJson==models.globalJson.replace(".json", "")?"global":RootDirectoriesFile.name_globalJson

    if(!fs.existsSync(RootDirectories.workdir))fs.mkdirSync(RootDirectories.workdir)

    if(!fs.existsSync(RootDirectoriesFile.mainIndex) || fs.readFileSync(RootDirectoriesFile.mainIndex) == ""){
        fs.writeFileSync(RootDirectoriesFile.mainIndex, fs.readFileSync(models.mainIndex))
    }
    if(!fs.existsSync(RootDirectoriesFile.loadingOverlay) || fs.readFileSync(RootDirectoriesFile.loadingOverlay) == ""){
        fs.writeFileSync(RootDirectoriesFile.loadingOverlay, fs.readFileSync(models.loadingOverlay))
    }
    if(!fs.existsSync(RootDirectoriesFile.globalJson) || fs.readFileSync(RootDirectoriesFile.globalJson) == ""){
        fs.writeFileSync(RootDirectoriesFile.globalJson, fs.readFileSync(models.globalJson))
    }
}