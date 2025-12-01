import {Router} from "express";
import {register, login} from "../../controllers/common/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
