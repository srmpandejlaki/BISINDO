import React, { useState } from "react";
import { login } from "../utils/login_api";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-title">
        <h2>Sistem Pembelajaran Alfabet Bahasa Isyarat Indonesia (BISINDO)</h2>
        <p>Masuk sebagai Admin</p>
      </div>
      {/* Form login akan ditempatkan di sini */}
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" >Masuk</button>
      </form>
    </div>
  )
}

export default LoginPage;