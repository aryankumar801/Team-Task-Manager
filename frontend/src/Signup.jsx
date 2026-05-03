import { useState } from "react";
import { Link } from "react-router-dom";
import api from "./api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", {
        name: name,
        email: email,
        password: password,
      });

      alert("Account created");
      window.location.href = "#/";
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="page">
      <form className="form-box" onSubmit={handleSignup}>
        <h2>Team Task Manager</h2>
        <h3>Signup</h3>

        <input
          type="text"
          placeholder="Enter name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Signup</button>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;