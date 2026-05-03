const express = require("express");
const Task = require("../models/task");
const Project = require("../models/project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.body.project);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember || myMember.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can create task" });
    }

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      priority: req.body.priority,
      project: req.body.project,
      assignedTo: req.body.assignedTo,
      createdBy: req.user._id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Task create error" });
  }
});

router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let tasks;

    if (myMember.role === "Admin") {
      tasks = await Task.find({ project: req.params.projectId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    } else {
      tasks = await Task.find({
        project: req.params.projectId,
        assignedTo: req.user._id,
      })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Task fetch error" });
  }
});

router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (
      myMember.role !== "Admin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You can update only your task" });
    }

    task.status = req.body.status;
    await task.save();

    res.json({ message: "Status updated", task: task });
  } catch (err) {
    res.status(500).json({ message: "Status update error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    const project = await Project.findById(task.project);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember || myMember.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can delete task" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error" });
  }
});

module.exports = router;