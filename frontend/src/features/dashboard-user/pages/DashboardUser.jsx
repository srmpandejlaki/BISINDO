import React from "react";
import { NavLink } from "react-router-dom";

function DashboardUser() {
  return (
    <div className="content dashboard-user">
      <div className="pengantar">
        <h2>Dashboard User</h2>
        <p>Selamat datang di Dashboard User! Di sini Anda dapat memilih untuk belajar atau menguji pengetahuan Alfabet BISINDO (Bahasa Isyarat Indonesia) Anda.</p>
      </div>
      <NavLink to="/user/learning-bisindo">
        <div className="learning-bisindo-card">
          <h3>Learning Bisindo</h3>
          <p>Belajar Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
        </div>
      </NavLink>
      <NavLink to="/user/test-bisindo">
        <div className="test-bisindo-card">
          <h3>Test Bisindo</h3>
          <p>Uji Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
        </div>
      </NavLink>
    </div>
  );
} 

export default DashboardUser;