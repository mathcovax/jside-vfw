import express from "express"

/**
 * @typedef {Object} accesshort
 * @property {JSON} json
 * @property {JSON} gson
 */

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {()Boolean} httpAcces
 * @param {accesshort} short
 * @return {Boolean}
 */
export default function(req, res, httpAcces, short){
    return true
}