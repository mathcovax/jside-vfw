import extComponents from "./launch/extComponents.js";
import defaultIndex from "./launch/defaultIndex.js";
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

const launch = {
    extComponents,
    defaultIndex,
    assets,
    modules,
    extPosts,
    sockets,
};

const add = {
    get,
    json,
    component,
    extComponent,
    extPost,
    httpAcces,
    post,
    module,
};

const remove = {

};

async function wakeUp(){
    assets();
    extComponents();
    await extPosts();
    await sockets();
    await modules();
};

export {
    launch,
    add,
    remove,
    wakeUp
};
