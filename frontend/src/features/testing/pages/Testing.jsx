import React from "react";
import TestingPreparation from "../components/TestingPrepearation";
import TestingResult from "../components/TestingResult";

function TestingPage() {
  return (
    <div className="content testing-page">
      <div className="title">
        <h2>Testing Page</h2>
        <p>This is a placeholder for the Testing page.</p>
      </div>
      <TestingPreparation />
      <TestingResult />
      <button className="detail-evaluation"><a href="/admin/evaluation">Lihat Detail Evaluasi</a></button>
    </div>
  );
}

export default TestingPage;