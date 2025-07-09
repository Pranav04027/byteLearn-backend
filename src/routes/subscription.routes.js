import {Router} from "express";
import {toggleSubscription,
        getUserChannelSubscribers,
        getSubscribedChannels
    } from "../controllers/subscription.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router()

//Unprotected Routes
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)

router.route("/subscribed-channels/:subscriberId").get(getSubscribedChannels)

// ProtectedRoutes
router.route("/togglesubscription/:channelId").post(verifyJWT, toggleSubscription)

export default router