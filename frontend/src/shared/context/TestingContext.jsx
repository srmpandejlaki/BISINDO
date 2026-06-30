import React, { createContext, useContext, useState } from "react";
import { testModelOnDataset, testModelOnUpload } from "../../features/testing/utils/testing_api";

const TestingContext = createContext();

export const TestingProvider = ({ children }) => {
  const [selectedModelId, setSelectedModelId] = useState("");
  const [testingMode, setTestingMode] = useState("dataset");
  const [uploadFile, setUploadFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState(null);

  const startTesting = async (idTrainTest) => {
    if (!idTrainTest) {
      setError("Silakan pilih model terlebih dahulu.");
      return;
    }
    setError("");
    setTestResults(null);
    setIsLoading(true);

    try {
      if (testingMode === "dataset") {
        const result = await testModelOnDataset(idTrainTest);
        setTestResults({ mode: "dataset", ...result });
      } else {
        if (!uploadFile) {
          throw new Error("Silakan unggah file (.npy atau video) terlebih dahulu.");
        }
        const result = await testModelOnUpload(idTrainTest, uploadFile);
        setTestResults({ mode: "upload", ...result, filename: uploadFile.name });
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat melakukan testing.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetTestingState = () => {
    setUploadFile(null);
    setError("");
    setTestResults(null);
    setIsLoading(false);
  };

  return (
    <TestingContext.Provider
      value={{
        selectedModelId,
        setSelectedModelId,
        testingMode,
        setTestingMode,
        uploadFile,
        setUploadFile,
        isLoading,
        setIsLoading,
        error,
        setError,
        testResults,
        setTestResults,
        startTesting,
        resetTestingState
      }}
    >
      {children}
    </TestingContext.Provider>
  );
};

export const useTesting = () => {
  const context = useContext(TestingContext);
  if (!context) {
    throw new Error("useTesting must be used within a TestingProvider");
  }
  return context;
};
