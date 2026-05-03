const express = require("express");
const Project = require("../models/project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Admin",
        },
      ],
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Project create error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
    }).populate("members.user", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Project fetch error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Project detail error" });
  }
});

router.post("/:id/member", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember || myMember.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can add member" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyAdded = project.members.find((m) => {
      return m.user.toString() === user._id.toString();
    });

    if (alreadyAdded) {
      return res.status(400).json({ message: "Member already added" });
    }

    project.members.push({
      user: user._id,
      role: "Member",
    });

    await project.save();

    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ message: "Add member error" });
  }
});

router.delete("/:id/member/:userId", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const myMember = project.members.find((m) => {
      return m.user.toString() === req.user._id.toString();
    });

    if (!myMember || myMember.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can remove member" });
    }

    project.members = project.members.filter((m) => {
      return m.user.toString() !== req.params.userId;
    });

    await project.save();

    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Remove member error" });
  }
});

module.exports = router;