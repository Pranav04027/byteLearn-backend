import {Router} from "express"; //class
import {healthcheck} from "../controllers/healthcheck.controllers.js"

const healthrouter = Router() //Create  a router

// Attach conntroller to a specific path /
healthrouter.route("/").get(healthcheck)

export default healthrouter