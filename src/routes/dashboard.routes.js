import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getChannelStats,
         getChannelVideos
 } from "../controllers/dashboard.controller";




const router = Router();



router.route("/stats").get(verifyJWT,getChannelStats);
router.route("/videos").get(verifyJWT,getChannelVideos);



export default router;