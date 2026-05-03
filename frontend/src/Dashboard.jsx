import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  const loadProjects = async () => {
    try {
      const res = await api.get("/projects", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setProjects(res.data);
    } catch (err) {
      alert("Projects load nahi hue");
    }
  };

  const createProject = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/projects",
        {
          title: title,
          description: description,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setTitle("");
      setDescription("");
      loadProjects();
    } catch (err) {
      alert("Project create nahi hua");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "#/";
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="container">
      <div className="top-bar">
        <h2>My Projects</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h3>Create Project</h3>

        <form onSubmit={createProject}>
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <button type="submit">Create Project</button>
        </form>
      </div>

      <h3>Projects</h3>

      <div className="project-list">
        {projects.map((project) => {
          return (
            <div className="card" key={project._id}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p className="small-text">Members: {project.members.length}</p>
              <Link to={"/project/" + project._id}>Open Project</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;