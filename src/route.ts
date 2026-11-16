import { Router } from "express";
import { authRouter } from "./app/auth/route";
import { userRouter } from "./app/user/route";
import { commentRouter } from "./app/comment/route";
import { postRouter } from "./app/post/route";

export const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/comment", commentRouter);
router.use("/post", postRouter);

export default router;
