import { RootDirectories } from "../../directories.js";
import Root from "../../root.js";
import fs from "fs";
import express from "express"

export default async function assets(){
    if(!fs.existsSync(RootDirectories.assets))fs.mkdirSync(RootDirectories.assets);
    Root.app.use("/" + RootDirectories.name_folder_assets, express.static(RootDirectories.assets));
};