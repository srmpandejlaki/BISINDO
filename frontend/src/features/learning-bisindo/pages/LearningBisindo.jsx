import React from "react";
import { NavLink } from "react-router-dom";

function LearningBisindo() {
  return (
    <div className="content">
      <h1>Learning Bisindo</h1>
      <p>Belajar Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
      <NavLink to="/user/dashboard">
        <button>Kembali</button>
      </NavLink>
    </div>
  )
};

export default LearningBisindo;