import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { publishAVideo,
         getAllVideos
 } from "../controllers/video.controller.js";


const router = Router();

router.route("/publish-video").post(verifyJWT,upload.single("video"),publishAVideo);

router.route("/get-all-videos").get(getAllVideos);







export default router;