import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import bisindoMaterials from "../utils/bisindo-materials";

function LearningBisindo() {
  const [openDetail, setOpenDetail] = useState(null);

  return (
    <div className="content learning-bisindo-page">
      <div className="learning-content" >
        <div className="head-page">
          <NavLink to="/user/dashboard">
            <button>Kembali</button>
          </NavLink>
          <p>Belajar Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
        </div>

        <div className="alfabet-items">
          {bisindoMaterials.map((item) => (
            <div className="alfabet-item" key={item.id} onClick={() => setOpenDetail(item)} >
              <div className="alfabet-img">
                <img src={item.img} alt={item.alfabet} />
              </div>
              <div className="alfabet-name">{item.alfabet}</div>
            </div>
          ))}
        </div>
      </div>

      {openDetail && (
        <div className="detail-alfabet">
          <button
            className="close-btn"
            onClick={() => setOpenDetail(null)}
          >
            ✕
          </button>

          <div className="video-alfabet">
            {openDetail.video && (
              <video controls>
                <source
                  src={openDetail.video}
                  type="video/mp4"
                />
              </video>
            )}
          </div>

          <div className="deskripsi-alfabet">
            <p>Deskripsi Alfabet {openDetail.alfabet}</p>
            <p>{openDetail.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningBisindo;