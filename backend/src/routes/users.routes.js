import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controllers.js";
import authVerifier from "../middleware/authVerifier.js";
import { add_to_activity, get_all_activity } from "../controllers/meeting.controller.js"

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/add_to_activity",authVerifier , add_to_activity);

router.get("/get_all_activity",authVerifier , get_all_activity);







export default router;