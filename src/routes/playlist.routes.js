import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {
        createPlaylist,
        getMyPlaylists,
        getUserPlaylists,
        addVideoToPlaylist
    } from "../controllers/playlist.controllers.js"


const router = Router()

// Non Protected routes
router.route("/p/:userId").get(getUserPlaylists)

// Protected routes

router.route("/create-playlist").post(verifyJWT , createPlaylist) //Need name and description

router.route("/my-playlists").get(verifyJWT , getMyPlaylists) // Be logged in

router.route("/p/:playlistId/v/:videoId").patch(verifyJWT , addVideoToPlaylist)

export default router