import express from "express"

/**
 * @typedef {Object} postshort
 * @property {JSON} gson
 * @property {(data: JSON)} s 
 * @property {(data: JSON)} e
 * @property {(data: url)} r
 * @property {(info: String) {s:(data: JSON)void, e:(data: JSON)void}} msg
 */

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {postshort} short
 */
export default function(req, res, short){

}