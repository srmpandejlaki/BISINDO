import { Route, Routes, Navigate } from "react-router-dom";

import ProtectedRoute from "./shared/components/ProtectedRoute";

import AdminLayout from "./shared/layouts/AdminLayout";
import UserLayout from "./shared/layouts/UserLayout";

// admin pages
import LoginPage from "./features/autentication/pages/LoginPage";
import DashboardAdmin from "./features/dashboard-admin/pages/DashboardAdmin";
import DataCollection from "./features/data-collection/pages/DataCollection";
import DetailDataset from "./features/data-collection/pages/DetailDataset";
import Preprocessing from "./features/preprocessing/pages/Preprocessing";
import HandSkeleton from "./features/hand-skeleton/pages/HandSkeleton";
import SplitRatio from "./features/split-ratio/pages/SplitRatio";
import Processing from "./features/processing/pages/Processing";
import DetailModel from "./features/processing/pages/DetailModel";
import TestingPage from "./features/testing/pages/Testing";
import EvaluationPage from "./features/evaluation/pages/Evaluation";

// user pages
import DashboardUser from "./features/dashboard-user/pages/DashboardUser";
import LearningBisindo from "./features/learning-bisindo/pages/LearningBisindo";
import TestBisindo from "./features/test-bisindo/pages/TestBisindo";
import { SplitRatioProvider } from "./shared/context/SplitRatioContext";
import { TrainingProvider } from "./shared/context/TrainingContext";
import { TestingProvider } from "./shared/context/TestingContext";

function App() {
  return (
    <SplitRatioProvider>
      <TrainingProvider>
        <TestingProvider>
          <Routes>
      <Route path="/" element={<Navigate to="/user/dashboard" replace />} />

      {/* Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* User Layout */}
      <Route element={<UserLayout />}>
        <Route path="/user/dashboard" element={<DashboardUser />} />
        <Route path="/user/learning-bisindo" element={<LearningBisindo />} />
        <Route path="/user/test-bisindo" element={<TestBisindo />} />
      </Route>

      {/* Admin Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/data-collection" element={<DataCollection />} />
          <Route
            path="/admin/data-collection/:idDataset/detail_dataset"
            element={<DetailDataset />}
          />
          <Route path="/admin/preprocessing" element={<Preprocessing />} />
          <Route path="/admin/preprocessing/:idTraining/detail_model" element={<DetailModel />} />
          <Route path="/admin/processing/hand-skeleton" element={<HandSkeleton />} />
          <Route path="/admin/processing/ratio" element={<SplitRatio />} />
          <Route path="/admin/processing/training" element={<Processing />} />
          <Route path="/admin/testing" element={<TestingPage />} />
          <Route path="/admin/evaluation" element={<EvaluationPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/user/dashboard" replace />}
      />
    </Routes>
        </TestingProvider>
      </TrainingProvider>
    </SplitRatioProvider>
  );
}

export default App;