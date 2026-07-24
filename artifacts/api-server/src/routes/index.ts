import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import platformsRouter from "./platforms";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(platformsRouter);
router.use(analyticsRouter);

export default router;
