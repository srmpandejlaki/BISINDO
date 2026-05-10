import React from "react";
import EvaluationTesting from "../components/EvaluationTesting";
import EvaluationTraining from "../components/EvaluationTraining";
import AnalisisPerbandingan from "../components/AnalisisPerbandingan";

function EvaluationPage() {
  return (
    <div className="content evaluation-page">
      <div className="title">
        <h2>Evaluation Page</h2>
        <p>This is a placeholder for the Evaluation page.</p>
      </div>
      <EvaluationTesting />
      <EvaluationTraining />
      <AnalisisPerbandingan />
    </div>
  );
}

export default EvaluationPage;