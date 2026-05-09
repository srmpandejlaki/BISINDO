import React from "react";

function SectionPreparation() {
  return (
    <div className="section-preparation">
      <h2>Section Preparation</h2>
      <div className="data-preparation">
        <div className="split-data">
          <h4>Split Data</h4>
          <p>training menggunakan rasio terbaik</p>
          <p className="split-rasio">80:20</p>
        </div>
        <div className="pilih-model">
          <h4>Pemilihan Model</h4>
          <select name="" id="">
            <option value="">Model Baru</option>
            <option value="">Model yang sudah ada</option>
          </select>
        </div>
        <div className="opsi-model">
          <h4>Opsi Model</h4>
          <select name="" id="">
            <option value="">Pilih Model</option>
            <option value="">ModelLSTM001</option>
            <option value="">ModelLSTM002</option>
          </select>
        </div>
      </div>
      <div className="parameter-model">
        <h4>Parameter Model</h4>
        <p>atur parameter untuk model</p>
      </div>
      <div className="parameter-training">
        <h4>Parameter Training</h4>
        <p>atur parameter untuk training model</p>
      </div>
      <button>Mulai Training</button>
    </div>
  );
}

export default SectionPreparation;