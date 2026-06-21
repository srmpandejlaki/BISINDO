import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div className="user-layout">
      <Outlet />
    </div>
  );
}

export default UserLayout;