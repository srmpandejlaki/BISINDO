import React from "react";
import { NavLink, useLocation } from "react-router-dom";

function NavBarAdmin() {
  const location = useLocation();

  const processingActive =
    location.pathname.startsWith("/admin/processing");
  
  return (
    <nav>
      <h3>Sistem Pembelajaran Alfabet Bahasa Isyarat Indonesia (BISINDO)</h3>
      <ul>
        <li><NavLink to="/admin/dashboard">Beranda</NavLink></li>
        <li><NavLink to="/admin/data-collection">Pengumpulan Dataset</NavLink></li>
        <li><NavLink to="/admin/preprocessing">Prapemrosesan Data</NavLink></li>
        <li>
          <p className={processingActive ? "active" : ""}>Pemrosesan Data</p>
          <ul className="submenu">
            <li><NavLink to="/admin/data-collection">Pengaturan Parameter Hand Skeleton</NavLink></li>
            <li><NavLink to="/admin/processing/ratio">Pengaturan Rasio Pembagian Data</NavLink></li>
            <li><NavLink to="/admin/processing/training">Pelatihan Model</NavLink></li>
          </ul>
        </li>
        <li><NavLink to="/admin/testing">Pengujian Model</NavLink></li>
        <li><NavLink to="/admin/evaluation">Evaluasi Performa Model</NavLink></li>
      </ul>
      <ul>
        <li><NavLink to="/user/dashboard">Kunjungi Website BISINDO</NavLink></li>
        <li><NavLink to="/admin/login">Keluar</NavLink></li>
      </ul>
    </nav>
  )
}

export default NavBarAdmin;