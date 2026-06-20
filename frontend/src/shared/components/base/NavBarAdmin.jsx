import React from "react";

function NavBarAdmin() {
  return (
    <nav>
      <h3>Panel Admin Sistem Pembelajaran Alfabet Bahasa Isyarat Indonesia (BISINDO)</h3>
      <ul>
        <li><a href="/admin/dashboard">Dashboard</a></li>
        <li>
          <p>Pengumpulan Data</p>
          <ul className="submenu">
            <li><a href="/admin/data-collection">Pengaturan Parameter Hand Skeleton</a></li>
            <li><a href="/admin/data-collection">Daftar Dataset</a></li>
          </ul>
        </li>
        <li>
          <p>Preprocessing</p>
          <ul className="submenu">
            <li><a href="/admin/preprocessing">Preprocess Data</a></li>
          </ul>
        </li>
        <li>
          <p>Processing</p>
          <ul className="submenu">
            <li><a href="/admin/processing/ratio">Pengaturan Rasio Data Split</a></li>
            <li><a href="/admin/processing">Training</a></li>
          </ul>
        </li>
        <li><a href="/admin/testing">Testing</a></li>
        <li><a href="/admin/evaluation">Evaluasi Performa Model</a></li>
      </ul>
      <ul>
        <li><a href="/user/dashboard">Kunjungi Website BISINDO</a></li>
        <li><a href="/admin/login">Logout</a></li>
      </ul>
    </nav>
  )
}

export default NavBarAdmin;