import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { get } from "mongoose";
import { getUserChannelSubscribers } from "../controllers/subscription.controller";


const router = Router();

// toggle the subscription status
router.route("/toggle-subscription/:channelId").patch(verifyJWT,toggleSubscription);
// get the total numbers of subscribers by channelId
router.route("subscribers/:channelId").get(verifyJWT,getUserChannelSubscribers);
// get the total numbers of channel a subscriber subscribed to by subscribers id
router.route("/channels/:subscriberId").get(verifyJWT,getSubscribedChannels);



export default router;