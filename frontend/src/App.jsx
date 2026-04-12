import { Route, Routes, Navigate } from "react-router-dom";
import DataCollection from "./features/data-collection/pages/DataCollection";

function App() {

  return (
    <main>
      <Routes>
        <Route path="/" element={<Navigate to="/data-collection" />} />
        <Route path="/data-collection" element={<DataCollection />} />
      </Routes>
    </main>
  )
}

export default App
