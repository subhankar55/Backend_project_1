import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { toggleVideoLike,
        toggleCommentLike,
        toggleTweetLike,
        getLikedVideos 

        } from "../controllers/like.controller";



const router = Router();


router.route("/video").get(verifyJWT,toggleVideoLike);
router.route("/comment").get(verifyJWT,toggleCommentLike);
router.route("/tweet").get(verifyJWT,toggleTweetLike);
router.route("/liked-videos").get(verifyJWT,getLikedVideos);



export default router;