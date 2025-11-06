import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getNotes = async (req, res) => {
    const notes = await Note.find();
    res.status(200).json(notes);
};

export const getNoteById = async (req, res, next) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
        throw createHttpError(404, "Student not found");
    }
    res.status(200).json(note);
};

export const createNote = async (req, res) => {
    const note = await Note.create(req.body);
    res.status(201).json(note);
};