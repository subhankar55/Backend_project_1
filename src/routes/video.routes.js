import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { publishAVideo,
         getAllVideos,
         updateVideo,
         getVideoById,
         deleteVideo,
         togglePublishStatus
 } from "../controllers/video.controller.js";


const router = Router();

router.route("/publish-video").post(verifyJWT,upload.single("video"),publishAVideo);

router.route("/get-all-videos").get(getAllVideos);

router.route("/get-video/:videoId").get(getVideoById);

router.route("/update-video/:videoId").patch(upload.single("thumbnail"),updateVideo);

router.route("/delete/:videoId").delete(verifyJWT,deleteVideo);

router.route("/toggle-publish/:videoId").patch(verifyJWT,togglePublishStatus);







export default router;