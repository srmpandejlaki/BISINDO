import React from "react";
import SectionInfo from "../components/SectionInfo";
import SectionGrafik from "../components/SectionGrafik";
import SectionModel from "../components/SectionModel";

function DashboardAdmin() {
  return (
    <div className="content dashboard-admin">
      <div className="pengantar">
        <h2>Dashboard Admin</h2>
        <p>Selamat datang di Dashboard Admin! Di sini Anda dapat mengelola seluruh proses mulai dari pengumpulan data, preprocessing, hingga evaluasi performa model. Gunakan menu di sebelah kiri untuk menavigasi ke berbagai fitur yang tersedia.</p>
      </div>
      <SectionInfo />
      <SectionGrafik />
      <SectionModel />
    </div>
  )
}

export default DashboardAdmin;