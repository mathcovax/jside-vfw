import extComponents from "./launch/extComponents.js";
import assets from "./launch/assets.js";
import modules from "./launch/modules.js";
import extPosts from "./launch/extPosts.js";
import sockets from "./launch/sockets.js";
import get from "./add/get.js";
import json from "./add/json.js";
import component from "./add/component.js";
import extComponent from "./add/extComponent.js";
import extPost from "./add/extPost.js";
import httpAcces from "./add/httpAcces.js";
import post from "./add/post.js";
import module from "./add/module.js";
import socket from "./add/socket.js";

import { RootDirectoriesFile, models, RootDirectories } from "./directories.js";
import fs from "fs";
import Root from "../../lib/root.js";

const launch = {
    extComponents,
    assets,
    modules,
    extPosts,
    sockets,
}

const add = {
    get,
    json,
    component,
    extComponent,
    extPost,
    httpAcces,
    post,
    module,
    socket,
}

const remove = {

}

async function init(){
    if(!fs.existsSync(RootDirectories.workdir))fs.mkdirSync(RootDirectories.workdir);
    if(!fs.existsSync(RootDirectoriesFile.mainIndex) || fs.readFileSync(RootDirectoriesFile.mainIndex) == "")fs.writeFileSync(RootDirectoriesFile.mainIndex, fs.readFileSync(models.mainIndex));
    if(!fs.existsSync(RootDirectoriesFile.loadingOverlay) || fs.readFileSync(RootDirectoriesFile.loadingOverlay) == "")fs.writeFileSync(RootDirectoriesFile.loadingOverlay, fs.readFileSync(models.loadingOverlay)); 
    if(!fs.existsSync(RootDirectoriesFile.globalJson) || fs.readFileSync(RootDirectoriesFile.globalJson) == "")fs.writeFileSync(RootDirectoriesFile.globalJson, fs.readFileSync(models.globalJson));

    Root.index = RootDirectoriesFile.mainIndex;
    Root.loadingOverlay = RootDirectoriesFile.loadingOverlay;
    Root.json = JSON.parse(fs.readFileSync(RootDirectoriesFile.globalJson));

    assets();
    extComponents();
    await extPosts();
    await sockets();
    Root.makeIndex();
    await modules();

}

export default class auto{
    static get launch(){
        return launch;
    }
    static get add(){
        return add;
    }
    static get remove(){
        return remove;
    }
    static get init(){
        return init;
    }
}
