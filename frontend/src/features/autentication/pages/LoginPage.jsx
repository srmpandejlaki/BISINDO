import React from "react";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-title">
        <h2>Sistem Pembelajaran Alfabet Bahasa Isyarat Indonesia (BISINDO)</h2>
        <p>Masuk sebagai Admin</p>
      </div>
      {/* Form login akan ditempatkan di sini */}
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Masuk</button>
      </form>
    </div>
  )
}

export default LoginPage;