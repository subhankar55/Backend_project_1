import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middlewares";
import { publishAVideo } from "../controllers/video.controller";


const router = Router();

router.route("/publish-video").post(verifyJWT,upload.single("video"),publishAVideo);








export default router;