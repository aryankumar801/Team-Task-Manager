import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "./api";

function ProjectPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  const token = localStorage.getItem("token");
  const loginUser = JSON.parse(localStorage.getItem("user"));

  const headers = {
    Authorization: "Bearer " + token,
  };

  const loadProject = async () => {
    try {
      const res = await api.get("/projects/" + id, { headers: headers });
      setProject(res.data);

      if (res.data.members.length > 0) {
        setAssignedTo(res.data.members[0].user._id);
      }
    } catch (err) {
      alert("Project load nahi hua");
    }
  };

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks/project/" + id, { headers: headers });
      setTasks(res.data);
    } catch (err) {
      alert("Tasks load nahi hue");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/projects/" + id + "/member",
        { email: memberEmail },
        { headers: headers }
      );

      setMemberEmail("");
      loadProject();
    } catch (err) {
      alert("Member add nahi hua");
    }
  };

  const removeMember = async (userId) => {
  try {
    await api.delete("/projects/" + id + "/member/" + userId, {
      headers: headers,
    });

    loadProject();
  } catch (err) {
    alert("Member remove nahi hua");
  }
};

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/tasks",
        {
          title: title,
          description: description,
          dueDate: dueDate,
          priority: priority,
          project: id,
          assignedTo: assignedTo,
        },
        { headers: headers }
      );

      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      loadTasks();
    } catch (err) {
      alert("Task create nahi hua");
    }
  };

  const changeStatus = async (taskId, newStatus) => {
    try {
      await api.put(
        "/tasks/" + taskId + "/status",
        { status: newStatus },
        { headers: headers }
      );

      loadTasks();
    } catch (err) {
      alert("Status update nahi hua");
    }
  };

  useEffect(() => {
    loadProject();
    loadTasks();
  }, []);

  if (!project) {
    return <p>Loading...</p>;
  }
const myMember = project.members.find((m) => {
  return m.user._id === loginUser.id;
});

  const isAdmin = myMember && myMember.role === "Admin";
  const todo = tasks.filter((task) => task.status === "To Do").length;
  const progress = tasks.filter((task) => task.status === "In Progress").length;
  const done = tasks.filter((task) => task.status === "Done").length;

  const today = new Date();

const overdue = tasks.filter((task) => {
  return new Date(task.dueDate) < today && task.status !== "Done";
}).length;

const userTaskCount = {};

tasks.forEach((task) => {
  const userName = task.assignedTo?.name || "No user";

  if (userTaskCount[userName]) {
    userTaskCount[userName] = userTaskCount[userName] + 1;
  } else {
    userTaskCount[userName] = 1;
  }
});

  return (
    <div className="container">
      <Link to="/dashboard">Back</Link>

      <div className="top-bar">
        <div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
        </div>
      </div>

      <div className="card">
  <h3>Dashboard</h3>
  <p>Total Tasks: {tasks.length}</p>
  <p>To Do: {todo}</p>
  <p>In Progress: {progress}</p>
  <p>Done: {done}</p>
  <p>Overdue Tasks: {overdue}</p>

  <h4>Tasks Per User</h4>
  {Object.keys(userTaskCount).map((name) => {
    return (
      <p key={name}>
        {name}: {userTaskCount[name]}
      </p>
    );
  })}
</div>
{isAdmin && (
      <div className="card">
        <h3>Members</h3>

        {project.members.map((m) => {
  return (
    <div className="member-row" key={m.user._id}>
      <span>
        {m.user.name} - {m.user.email} ({m.role})
      </span>

      {m.role !== "Admin" && (
        <button onClick={() => removeMember(m.user._id)}>Remove</button>
      )}
    </div>
  );
})}

        <form onSubmit={addMember}>
          <input
            type="email"
            placeholder="Member email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button>Add Member</button>
        </form>
      </div>
)}
{isAdmin &&(
      <div className="card">
        <h3>Create Task</h3>

        <form onSubmit={createTask}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            {project.members.map((m) => {
              return (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name}
                </option>
              );
            })}
          </select>

          <button>Create Task</button>
        </form>
      </div>
)}

      <div className="card">
        <h3>Tasks</h3>

        {tasks.map((task) => {
          return (
            <div className="task" key={task._id}>
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <p>Due Date: {task.dueDate ? task.dueDate.slice(0, 10) : "No date"}</p>
              <p>Assigned To: {task.assignedTo?.name}</p>

              <select
                value={task.status}
                onChange={(e) => changeStatus(task._id, e.target.value)}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectPage;