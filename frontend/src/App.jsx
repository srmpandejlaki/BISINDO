import { Route, Routes, Navigate } from "react-router-dom";
import DataCollection from "./features/data-collection/pages/DataCollection";
import NavBarAdmin from "./shared/components/base/NavBarAdmin";

function App() {

  return (
    <main className="App">
      <NavBarAdmin />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/data-collection" />} />
        <Route path="/admin/data-collection" element={<DataCollection />} />
      </Routes>
    </main>
  )
}

export default App
