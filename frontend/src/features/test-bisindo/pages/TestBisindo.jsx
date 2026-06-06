import React from "react";
import { NavLink } from "react-router-dom";

function TestBisindo() {
  return (
    <div className="content test-bisindo-page">
      <h1>Test Bisindo</h1>
      <p>Uji Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
      <NavLink to="/user/dashboard">
        <button>Kembali</button>
      </NavLink>
    </div>
  )
};

export default TestBisindo;