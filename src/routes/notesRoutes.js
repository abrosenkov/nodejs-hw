import { Router } from "express";
import { createNote, getNoteById, getNotes } from "../controllers/notesController.js";

const router = Router();


router.get('/notes', getNotes);
router.get('/notes/:noteId', getNoteById);

router.post('/notes', createNote);

export default router;