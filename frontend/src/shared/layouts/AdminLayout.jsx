import { Outlet } from "react-router-dom";
import NavBarAdmin from "../components/base/NavBarAdmin";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <NavBarAdmin />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;