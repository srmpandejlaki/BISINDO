import React from "react";
import { NavLink } from "react-router-dom";

import AlfabetA from "@/assets/alfabet-img/alfabet-bisindo-a.png";
import AlfabetB from "@/assets/alfabet-img/alfabet-bisindo-b.png";
import AlfabetC from "@/assets/alfabet-img/alfabet-bisindo-c.png";

function LearningBisindo() {
  return (
    <div className="content learning-bisindo-page">
      <div className="head-page">
        <NavLink to="/user/dashboard">
          <button>Kembali</button>
        </NavLink>
        <p>Belajar Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
      </div>

      <div className="alfabet-lists">
        <div className="alfabet-item">
          <div className="alfabet-img">
            <img src={AlfabetA} alt="" />
          </div>
          <div className="alfabet-name">A</div>
        </div>
        <div className="alfabet-item">
          <div className="alfabet-img">
            <img src={AlfabetB} alt="" />
          </div>
          <div className="alfabet-name">B</div>
        </div>
        <div className="alfabet-item">
          <div className="alfabet-img">
            <img src={AlfabetC} alt="" />
          </div>
          <div className="alfabet-name">C</div>
        </div>
        <div className="alfabet-item">
          <div className="alfabet-img"></div>
          <div className="alfabet-name">D</div>
        </div>
        <div className="alfabet-item">
          <div className="alfabet-img"></div>
          <div className="alfabet-name">E</div>
        </div>
      </div>
    </div>
  )
};

export default LearningBisindo;