import React from "react";
import SectionPengaturan from "../components/SectionPengaturan";
import SectionScore from "../components/SectionScore";
import SectionCamera from "../components/SectionCamera";

function DashboardAdmin() {
  return (
    <div className="content dashboard-admin">
      <div className="pengantar">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di Dashboard Admin! Di sini Anda dapat mengelola seluruh proses mulai dari pengumpulan data, preprocessing, hingga evaluasi performa model. Gunakan menu di sebelah kiri untuk menavigasi ke berbagai fitur yang tersedia.</p>
      </div>
      <SectionPengaturan />
      <SectionScore />
      <SectionCamera />
    </div>
  )
}

export default DashboardAdmin;