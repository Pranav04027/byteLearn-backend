import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
} from "../controllers/bookmark.controllers.js";

const router = Router();

router.post("/addBookmark/:videoId", verifyJWT, addBookmark);
router.delete("/removeBookmark/:videoId", verifyJWT, removeBookmark);
router.get("/mybookmarks", verifyJWT, getMyBookmarks);

export default router;
