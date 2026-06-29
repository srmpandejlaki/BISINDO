import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import bisindoMaterials from "../utils/bisindo-materials";
import { VIDEO_URL } from "../../../shared/utils/index-api";

function LearningBisindo() {
  const [openDetail, setOpenDetail] = useState(null);

  return (
    <div className="content learning-bisindo-page">
      <div className="learning-content">
        <div className="head-page">
          <NavLink to="/user/dashboard">
            <button className="button">Kembali</button>
          </NavLink>

          <p>Belajar Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
        </div>

        <div className="pengantar">
          <h4 className="">Klik salah satu huruf untuk melihat video dan informasi detail.</h4>
        </div>

        <div className="alfabet-items">
          {bisindoMaterials.map((item) => (
            <div
              className="alfabet-item"
              key={item.id}
              onClick={() => setOpenDetail(item)}
            >
              <div className="alfabet-img">
                <img src={item.img} alt={item.alfabet} />
              </div>

              <div className="alfabet-name">
                {item.alfabet}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openDetail && (
        <div className="detail-alfabet">
          <button
            className="button"
            onClick={() => setOpenDetail(null)}
          >
            ✕
          </button>

          <div className="video-alfabet">
            <video key={openDetail.alfabet} controls autoPlay
              onError={() => console.warn(`Video untuk huruf ${openDetail.alfabet} tidak tersedia.`)}
            >
              <source
                src={`${VIDEO_URL}/${openDetail.alfabet}/${openDetail.alfabet}_001.mp4`}
                type="video/mp4"
              />
              Browser Anda tidak mendukung video.
            </video>
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