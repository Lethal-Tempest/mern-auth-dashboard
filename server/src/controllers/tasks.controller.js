import mongoose from "mongoose";
import Task from "../models/Task.js";
import { createTaskSchema, updateTaskSchema } from "../validators/tasks.validators.js";

export async function createTask(req, res, next) {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const task = await Task.create({
      owner: req.user.id,
      title: parsed.data.title,
      description: parsed.data.description || "",
      status: parsed.data.status || "todo"
    });

    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function listTasks(req, res, next) {
  try {
    const { search = "", status } = req.query;

    const filter = { owner: req.user.id };

    if (status && ["todo", "in_progress", "done"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: "i" } },
        { description: { $regex: String(search), $options: "i" } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOne({ _id: id, owner: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid task id" });

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { $set: parsed.data },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
