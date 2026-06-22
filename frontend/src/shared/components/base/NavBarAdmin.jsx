import React from "react";
import { Link } from "react-router-dom";

function NavBarAdmin() {
  return (
    <nav>
      <h3>Panel Admin Sistem Pembelajaran Alfabet Bahasa Isyarat Indonesia (BISINDO)</h3>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li>
          <p>Pengumpulan Data</p>
          <ul className="submenu">
            <li><Link to="/admin/data-collection">Pengaturan Parameter Hand Skeleton</Link></li>
            <li><Link to="/admin/data-collection">Daftar Dataset</Link></li>
          </ul>
        </li>
        <li>
          <p>Preprocessing</p>
          <ul className="submenu">
            <li><Link to="/admin/preprocessing">Preprocess Data</Link></li>
          </ul>
        </li>
        <li>
          <p>Processing</p>
          <ul className="submenu">
            <li><Link to="/admin/processing/ratio">Pengaturan Rasio Data Split</Link></li>
            <li><Link to="/admin/processing">Training</Link></li>
          </ul>
        </li>
        <li><Link to="/admin/testing">Testing</Link></li>
        <li><Link to="/admin/evaluation">Evaluasi Performa Model</Link></li>
      </ul>
      <ul>
        <li><Link to="/user/dashboard">Kunjungi Website BISINDO</Link></li>
        <li><Link to="/admin/login">Logout</Link></li>
      </ul>
    </nav>
  )
}

export default NavBarAdmin;