import { Route, Routes, Navigate } from "react-router-dom";
import NavBarAdmin from "./shared/components/base/NavBarAdmin";
import LoginPage from "./features/autentication/pages/LoginPage";
import DashboardAdmin from "./features/dashboard-admin/pages/DashboardAdmin";
import DataCollection from "./features/data-collection/pages/DataCollection";
import DetailDataset from "./features/data-collection/pages/DetailDataset";
import PreprocessingAdmin from "./features/preprocessing/pages/PreprocessingAdmin";

function App() {

  return (
    <main className="App">
      <NavBarAdmin />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/data-collection" element={<DataCollection />} />
        <Route path="/admin/data-collection/:id" element={<DetailDataset />} />
        <Route path="/admin/preprocessing" element={<PreprocessingAdmin />} />
      </Routes>
    </main>
  )
}

export default App
