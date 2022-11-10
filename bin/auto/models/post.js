import express from "express"

/**
 * @typedef {Object} postshort
 * @property {JSON} json
 * @property {JSON} gson
 * @property {(data: JSON) void} s
 * @property {(data: JSON) void} e
 * @property {(data: url) void} r
 * @property {(info: String) {s:(data: JSON)void, e:(data: JSON)void}} msg
 */

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {postshort} short
 */
export default function(req, res, short){
    
}