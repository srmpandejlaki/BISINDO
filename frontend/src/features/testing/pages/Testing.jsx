import React from "react";
import TestingPreparation from "../components/TestingPrepearation";
import TestingResult from "../components/TestingResult";

function TestingPage() {
  return (
    <div className="content testing-page">
      <h2>Testing Page</h2>
      <p>This is a placeholder for the Testing page.</p>
      <TestingPreparation />
      <TestingResult />
    </div>
  );
}

export default TestingPage;