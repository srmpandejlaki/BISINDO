import { Route, Routes, Navigate } from "react-router-dom";
import NavBarAdmin from "./shared/components/base/NavBarAdmin";
import DashboardAdmin from "./features/dashboard-admin/pages/DashboardAdmin";
import DataCollection from "./features/data-collection/pages/DataCollection";

function App() {

  return (
    <main className="App">
      <NavBarAdmin />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/data-collection" element={<DataCollection />} />
      </Routes>
    </main>
  )
}

export default App
