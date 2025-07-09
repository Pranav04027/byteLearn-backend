import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {
        publishVideo,
        getVideoById,
        deleteVideo,
        updateVideo,
        togglePublishStatus,
        getAllVideos
} from "../controllers/video.controllers.js"

const router = Router()

//Unprotectd Routes
router.route("/v/:videoId").get(getVideoById)

router.route("/getallvideos").get(getAllVideos)

//Protected Routes
router.route("/uploadvideo").post(verifyJWT , 
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
)

router.route("/delete-video/:videoId").delete(verifyJWT , deleteVideo)

router.route("/update-video/:videoId").patch(verifyJWT , upload.single("thumbnail"), updateVideo)

router.route("/toggleispublished/:videoId").patch(verifyJWT , togglePublishStatus)

export default router