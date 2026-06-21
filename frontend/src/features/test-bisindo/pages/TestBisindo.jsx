import React, {  useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import words from "../utils/words";

function TestBisindo() {
  const location = useLocation();
  const level = location.state?.level || 1;

  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();

      tracks.forEach((track) => track.stop());

      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();

        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  
  const generateWord = (lvl) => {
    const levelKey = `level${lvl}`;

    const randomWord =
      words[levelKey][
        Math.floor(Math.random() * words[levelKey].length)
      ];

    return randomWord.toUpperCase();
  };

  const [targetWord, setTargetWord] = useState(() =>
    generateWord(level)
  );
  const handleNewQuestion = () => {
    setTargetWord(generateWord(level));
    setCurrentIndex(0);
    setScore(0);
  };

  return (
    <div className="content test-bisindo-page">
      <div className="head-page">
        <NavLink to="/user/dashboard">
          <button>Kembali</button>
        </NavLink>

        <p>Uji Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
      </div>

      <div className="main-test-section">
        {/* LEFT */}
        <div className="test-section">
          <div className="camera-section">
            <h3>Tampilan Kamera</h3>

            <div className="camera-container">
              {!cameraActive && (
                <div className="camera-placeholder">
                  Kamera Belum Aktif
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  display: cameraActive
                    ? "block"
                    : "none",
                }}
              />
            </div>
          </div>

          <div className="result-section">
            {targetWord.split("").map((letter, index) => (
              <div
                key={index}
                className={`
                  result-letter
                  ${index < currentIndex ? "correct" : ""}
                  ${index === currentIndex ? "active" : ""}
                `}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="evaluation-section">
          <h3>Evaluasi Penilaian</h3>

          <div className="evaluation-item">
            <span>Level</span>
            <span>{level}</span>
          </div>

          <div className="evaluation-item">
            <span>Kata</span>
            <span>{targetWord}</span>
          </div>

          <div className="evaluation-item">
            <span>Skor</span>
            <span>{score}</span>
          </div>

          <div className="evaluation-item">
            <span>Progress</span>
            <span>
              {currentIndex}/{targetWord.length}
            </span>
          </div>

          <div className="evaluation-buttons">
            <button onClick={handleNewQuestion}>
              Soal Baru
            </button>

            <button onClick={toggleCamera}>
              {cameraActive
                ? "Matikan Kamera"
                : "Aktifkan Kamera"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestBisindo;