import React from "react";
import { NavLink, useNavigate  } from "react-router-dom";

function DashboardUser() {
const navigate = useNavigate();

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
      <div className="test-bisindo">
        <div className="test-bisindo-card">
          <h3>Test Bisindo</h3>
          <p>Uji Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
        </div>
        <div className="button-levels">
          <button
            onClick={() =>
              navigate("/user/test-bisindo", {
                state: {
                  level: 1
                }
              })
            }
          >
            Level 1
          </button>

          <button
            onClick={() =>
              navigate("/user/test-bisindo", {
                state: {
                  level: 2
                }
              })
            }
          >
            Level 2
          </button>

          <button
            onClick={() =>
              navigate("/user/test-bisindo", {
                state: {
                  level: 3
                }
              })
            }
          >
            Level 3
          </button>
        </div>
      </div>
    </div>
  );
} 

export default DashboardUser;