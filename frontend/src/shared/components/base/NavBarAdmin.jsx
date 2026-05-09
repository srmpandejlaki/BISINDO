import React from "react";

function NavBarAdmin() {
  return (
    <nav>
      <ul>
        <li><a href="/admin/dashboard">Dashboard</a></li>
        <li>
          <a href="/admin/data-collection">Data Collection</a>
          <ul className="submenu">
            <li><a href="/admin/data-collection">Pengaturan Parameter Hand Skeleton</a></li>
          </ul>
        </li>
        <li><a href="/admin/preprocessing">Preprocessing</a></li>
        <li>
          <a href="/admin/processing">Processing</a>
          <ul className="submenu">
            <li><a href="/admin/processing/ratio">Pengaturan Rasio Data Split</a></li>
            <li><a href="/admin/processing/model">Parameter Model LSTM</a></li>
          </ul>
        </li>
        <li><a href="/admin/testing">Testing</a></li>
        <li><a href="/admin/evaluation">Evaluasi Performa Model</a></li>
      </ul>
      <ul>
        <li><a href="/website-bisindo">Kunjungi Website BISINDO</a></li>
        <li><a href="/admin/login">Logout</a></li>
      </ul>
    </nav>
  )
}

export default NavBarAdmin;