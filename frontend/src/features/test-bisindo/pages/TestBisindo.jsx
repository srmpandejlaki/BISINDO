import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import words from "../utils/words";

// ==========================================
// CONFIG
// ==========================================
const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000/bisindo/api";
const FRAME_INTERVAL_MS = 100;        // ~10 FPS
const CONFIDENCE_THRESHOLD = 0.50;     // 50%
const COUNTDOWN_SECONDS = 3;
const MATCH_HOLD_MS = 300;             // dikurangi agar lebih responsif dalam batas 2 detik
const ACTIVE_LIMIT_SECONDS = 2;        // waktu maksimal tebak per huruf
const SCORE_PER_LETTER = 10;

// 🔥 NEW: smoothing config
const BUFFER_SIZE = 5;
const REQUIRED_MATCH_COUNT = 3;

// Audio feedback - dinonaktifkan secara default
const ENABLE_SOUND = false;

function playBeep() {
  if (!ENABLE_SOUND) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio not supported
  }
}

function playSuccessSound() {
  if (!ENABLE_SOUND) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.3);
      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    // Audio not supported
  }
}

function TestBisindo() {
  const location = useLocation();
  const level = location.state?.level || 1;

  // =========================
  // REFS
  // =========================
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const frameIntervalRef = useRef(null);


  const predictionBufferRef = useRef([]);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const predictionRef = useRef({ label: "...", confidence: 0, hands: 0 });

  // =========================
  // STATE
  // =========================
  const [cameraActive, setCameraActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [prediction, setPrediction] = useState({
    label: "...",
    confidence: 0,
    hands: 0,
  });

  // sync refs
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { predictionRef.current = prediction; }, [prediction]);

  // Word Generation
  const generateWord = useCallback((lvl) => {
    const levelKey = `level${lvl}`;
    const randomWord =
      words[levelKey][Math.floor(Math.random() * words[levelKey].length)];
    return randomWord.toUpperCase();
  }, []);
  
  const [targetWord, setTargetWord] = useState(() => generateWord(level));

  const [countdown, setCountdown] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const countdownTimerRef = useRef(null);

  // ==========================================
  // COUNTDOWN LOGIC
  // ==========================================
  const startCountdown = useCallback((onComplete) => {
    setCountdownActive(true);
    let count = COUNTDOWN_SECONDS;
    setCountdown(count);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdown(null);
        setCountdownActive(false);
        if (onComplete) onComplete();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, []);

  // ==========================================
  // STABLE PREDICTION
  // ==========================================
  function getStablePrediction(buffer) {
    const freq = {};
    let bestLabel = null;
    let bestScore = 0;

    for (const p of buffer) {
      if (!p?.label) continue;

      const label = p.label;
      const score = p.confidence || 0;

      freq[label] = (freq[label] || 0) + score;

      if (freq[label] > bestScore) {
        bestScore = freq[label];
        bestLabel = label;
      }
    }

    return bestLabel;
  }

  const [connectionStatus, setConnectionStatus] = useState("idle");
  const connectWebSocketRef = useRef(null);

  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // ==========================================
  // WEBSOCKET
  // ==========================================
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/testing/realtime/0`);

    wsRef.current = ws;
    setConnectionStatus("connecting");

    ws.onopen = () => {
      setConnectionStatus("active");
      reconnectAttemptsRef.current = 0;
    };
    ws.onerror = () => setConnectionStatus("error");

    ws.onclose = () => {
      setConnectionStatus("idle");

      const maxRetry = 5;

      if (
        reconnectAttemptsRef.current < maxRetry &&
        cameraActive
      ) {
        reconnectAttemptsRef.current++;

        setTimeout(() => {
          connectWebSocketRef.current?.();
        }, 2000);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.success || data.accumulating) return;

      const newPred = {
        label: data.predicted_label?.toUpperCase(),
        confidence: data.confidence,
        hands: data.hands_detected,
      };

      if (newPred.hands <= 0) return;

      predictionBufferRef.current.push(newPred);
      if (predictionBufferRef.current.length > BUFFER_SIZE) {
        predictionBufferRef.current.shift();
      }

      const stableLabel = getStablePrediction(predictionBufferRef.current);

      setPrediction({
        ...newPred,
        label: stableLabel || newPred.label,
      });
    };
  }, [cameraActive]);

  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket;
  }, [connectWebSocket]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;

      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }

      wsRef.current = null;
    }
  }, []);

  // ==========================================
  // CAMERA & FRAME CAPTURE
  // ==========================================
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });

    videoRef.current.srcObject = stream;
    setCameraActive(true);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
  };

  const startFrameCapture = useCallback(() => {
    frameIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !wsRef.current) return;
      if (wsRef.current.readyState !== 1) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) wsRef.current.send(blob);
      }, "image/jpeg", 0.6);
    }, FRAME_INTERVAL_MS);
  }, []);

  const stopFrameCapture = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
  };

  const [letterTimer, setLetterTimer] = useState(ACTIVE_LIMIT_SECONDS);
  const [letterTimerActive, setLetterTimerActive] = useState(false);

  const letterTimerIntervalRef = useRef(null);

  const [wrongAttempts, setWrongAttempts] = useState(0);
  const wrongAttemptsRef = useRef(0);

  // Hasil per huruf: null = belum, "correct" = benar, "wrong" = salah
  const [letterResults, setLetterResults] = useState([]);

  const [repeatMessage, setRepeatMessage] = useState(null);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  
  const startTimeRef = useRef(null);
  // ==========================================
  // TRANSITION & TIMER LOGIC
  // ==========================================
  const moveToNextLetter = useCallback((newScore, newWrongAttempts, isCorrect) => {
    // Hentikan frame capture dan timer aktif saat transisi
    stopFrameCapture();
    if (letterTimerIntervalRef.current) {
      clearInterval(letterTimerIntervalRef.current);
      letterTimerIntervalRef.current = null;
    }
    setLetterTimerActive(false);
    setRepeatMessage(null); // Reset pesan ulangi

    // Simpan hasil huruf saat ini (benar/salah) sebelum lanjut
    const currentLetterIndex = currentIndexRef.current;
    setLetterResults(prev => {
      const updated = [...prev];
      updated[currentLetterIndex] = isCorrect ? "correct" : "wrong";
      return updated;
    });

    if (isCorrect) {
      playBeep();
    }

    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= targetWord.length) {
      // Selesai mengeja kata
      playSuccessSound();
      const endTime = Date.now();
      const durationMs = endTime - (startTimeRef.current || endTime);
      const totalLetters = targetWord.length;

      // Akurasi = huruf benar / total huruf
      const correctLetters = totalLetters - newWrongAttempts;
      const accuracy = totalLetters > 0
        ? (Math.max(0, correctLetters) / totalLetters) * 100
        : 0;

      setEvaluationData({
        word: targetWord,
        level: level,
        score: newScore,
        totalLetters,
        correctLetters: Math.max(0, correctLetters),
        wrongAttempts: newWrongAttempts,
        accuracy: accuracy.toFixed(1),
        duration: Math.round(durationMs / 1000),
      });
      setShowEvaluation(true);
    } else {
      // Pindah ke huruf berikutnya
      predictionBufferRef.current = [];

      setPrediction({
        label: "...",
        confidence: 0,
        hands: 0,
      });

      setCurrentIndex(nextIndex);
      startCountdown();
    }
  }, [targetWord, level, startCountdown]);

  const handleRepeatLetter = useCallback(() => {
    stopFrameCapture();

    predictionBufferRef.current = [];

    setPrediction({
      label: "...",
      confidence: 0,
      hands: 0,
    });

    if (letterTimerIntervalRef.current) {
      clearInterval(letterTimerIntervalRef.current);
      letterTimerIntervalRef.current = null;
    }
    setLetterTimerActive(false);
    setLetterTimer(ACTIVE_LIMIT_SECONDS);
    startCountdown();
  }, [startCountdown]);

  const startActiveLetter = useCallback(() => {
    if (letterTimerIntervalRef.current) {
      clearInterval(letterTimerIntervalRef.current);
      letterTimerIntervalRef.current = null;
    }

    setLetterTimer(ACTIVE_LIMIT_SECONDS);
    setLetterTimerActive(true);

    let time = ACTIVE_LIMIT_SECONDS;
    letterTimerIntervalRef.current = setInterval(() => {
      time = Math.max(0, parseFloat((time - 0.1).toFixed(1)));
      setLetterTimer(time);
      if (time <= 0) {
        clearInterval(letterTimerIntervalRef.current);
        letterTimerIntervalRef.current = null;
        setLetterTimerActive(false);

        // Waktu habis. Cek apakah model sempat memprediksi
        const lastPrediction = predictionRef.current;
        const hasPredicted = lastPrediction.label !== "..." && lastPrediction.hands > 0;

        if (hasPredicted) {
          const targetLetter =
            targetWord[currentIndexRef.current];

          const stableLabel = getStablePrediction(
            predictionBufferRef.current
          );

          const isCorrect =
            stableLabel === targetLetter &&
            lastPrediction.confidence >= CONFIDENCE_THRESHOLD;

          if (isCorrect) {
            const newScore =
              scoreRef.current + SCORE_PER_LETTER;

            setScore(newScore);

            moveToNextLetter(
              newScore,
              wrongAttemptsRef.current,
              true
            );
          } else {
            const nextWrong =
              wrongAttemptsRef.current + 1;

            setWrongAttempts(nextWrong);

            moveToNextLetter(
              scoreRef.current,
              nextWrong,
              false
            );
          }
        } else {
          // Model belum memprediksi apa pun (tangan tidak terdeteksi) -> ulangi huruf
          setRepeatMessage("Tangan tidak terdeteksi! Silakan posisikan tangan Anda.");
          handleRepeatLetter();
        }
      }
    }, 100);
  }, [moveToNextLetter, handleRepeatLetter, targetWord]);

  // ==========================================
  // START TEST FLOW
  // ==========================================
  const handleToggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
      disconnectWebSocket();
    } else {
      await startCamera();
    }
  };

  // Saat kamera aktif: buka WS dan mulai countdown awal
  useEffect(() => {
    if (cameraActive && !testStarted) {
      connectWebSocket();
      startCountdown(() => {
        setTestStarted(true);
        startTimeRef.current = Date.now();
      });
    }
    // eslint-disable-next-line
  }, [cameraActive]);

  // Side-effect: Jalankan active letter timer & frame capture saat countdown selesai
  useEffect(() => {
    if (testStarted && !countdownActive && cameraActive) {
      startActiveLetter();
      stopFrameCapture();
      startFrameCapture();
    } else {
      if (letterTimerIntervalRef.current) {
        clearInterval(letterTimerIntervalRef.current);
        letterTimerIntervalRef.current = null;
      }
      setLetterTimerActive(false);
    }

    return () => {
      if (letterTimerIntervalRef.current) {
        clearInterval(letterTimerIntervalRef.current);
        letterTimerIntervalRef.current = null;
      }
    };
  }, [currentIndex, countdownActive, testStarted, cameraActive, startActiveLetter, startFrameCapture]);

  useEffect(() => {
    wrongAttemptsRef.current = wrongAttempts;
  }, [wrongAttempts]);

  // ==========================================
  // NEW WORD / RESTART
  // ==========================================
  const handleNewQuestion = () => {
    setShowEvaluation(false);
    setEvaluationData(null);
    setTargetWord(generateWord(level));
    setCurrentIndex(0);
    setScore(0);
    setWrongAttempts(0);
    setRepeatMessage(null);

    // Reset refs secara langsung agar tidak menunggu useEffect sync
    currentIndexRef.current = 0;
    scoreRef.current = 0;
    wrongAttemptsRef.current = 0;

    setLetterResults([]);
    predictionBufferRef.current = [];

    setPrediction({
      label: "...",
      confidence: 0,
      hands: 0,
    });

    if (cameraActive) {
      stopFrameCapture();
      if (letterTimerIntervalRef.current) {
        clearInterval(letterTimerIntervalRef.current);
        letterTimerIntervalRef.current = null;
      }
      setLetterTimerActive(false);
      setLetterTimer(ACTIVE_LIMIT_SECONDS);

      startCountdown(() => {
        startTimeRef.current = Date.now();
      });
    }
  };

  // ==========================================
  // CLEANUP ALL
  // ==========================================
  useEffect(() => {
    return () => {
      stopFrameCapture();
      disconnectWebSocket();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (letterTimerIntervalRef.current) clearInterval(letterTimerIntervalRef.current);
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line
  }, []);

  // ==========================================
  // STATUS HELPERS
  // ==========================================
  const getStatusText = () => {
    if (connectionStatus === "connecting") return "Menghubungkan...";
    if (connectionStatus === "error") return "Koneksi Error";
    if (connectionStatus === "active") return "Aktif";
    return "Tidak Terhubung";
  };

  const getStatusClass = () => {
    if (connectionStatus === "active") return "status-active";
    if (connectionStatus === "connecting") return "status-connecting";
    if (connectionStatus === "error") return "status-error";
    return "status-idle";
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="content test-bisindo-page">
      <div className="main-test-section">
        {/* LEFT: Camera */}
        <div className="test-section">
          <div className="camera-section">
            <div className="camera-header">
              <div className="head-page">
                <NavLink to="/user/dashboard">
                  <button className="btn-back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>
                </NavLink>
                <p>Uji Alfabet BISINDO (Bahasa Isyarat Indonesia)</p>
              </div>
              {/* <h3>Tampilan Kamera</h3> */}
              <span className={`connection-status ${getStatusClass()}`}>
                <span className="status-dot"></span>
                {getStatusText()}
              </span>
            </div>

            <div className="camera-container">
              {!cameraActive && (
                <div className="camera-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>Kamera Belum Aktif</span>
                  <span className="hint">Klik "Aktifkan Kamera" untuk mulai</span>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: cameraActive ? "block" : "none" }}
              />

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="countdown-overlay">
                  <div className="countdown-number">{countdown}</div>
                  <p className="countdown-text">Bersiap-siap...</p>
                  {repeatMessage && <p className="repeat-message-hint">{repeatMessage}</p>}
                </div>
              )}

              {/* Live Prediction Overlay */}
              {cameraActive && testStarted && !countdownActive && (
                <div className="prediction-overlay">
                  <div className="pred-label">{prediction.label}</div>
                  <div className="pred-confidence">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              {/* Active Timer Bar */}
              {cameraActive && testStarted && !countdownActive && letterTimerActive && (
                <div className="timer-bar-container">
                  <div
                    className={`timer-bar-fill ${letterTimer <= 0.8 ? "danger" : ""}`}
                    style={{ width: `${(letterTimer / ACTIVE_LIMIT_SECONDS) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* Letter Progress */}
          <div className="result-section">
            {targetWord.split("").map((letter, index) => (
              <div
                key={index}
                className={[
                  "result-letter",
                  letterResults[index] === "correct" ? "correct" : "",
                  letterResults[index] === "wrong" ? "wrong" : "",
                  index === currentIndex && testStarted && !letterResults[index] ? "active" : "",
                ].join(" ").trim()}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Evaluation Panel */}
        <div className="evaluation-section">
          <h3>Evaluasi Penilaian</h3>

          <div className="eval-stats">
            <div className="evaluation-item">
              <span className="eval-label">Level</span>
              <span className="eval-value">{level}</span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Kata</span>
              <span className="eval-value word-value">{targetWord}</span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Skor</span>
              <span className="eval-value score-value">{score}</span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Progress</span>
              <span className="eval-value">
                {currentIndex}/{targetWord.length}
              </span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Tangan</span>
              <span className="eval-value">
                {prediction.hands > 0 ? `${prediction.hands} terdeteksi` : "Tidak terdeteksi"}
              </span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Huruf Aktif</span>
              <span className="eval-value active-letter-display">
                {testStarted && !countdownActive ? targetWord[currentIndex] || "-" : "-"}
              </span>
            </div>

            <div className="evaluation-item">
              <span className="eval-label">Sisa Waktu</span>
              <span className={`eval-value timer-value ${letterTimer <= 0.8 ? "timer-warning" : ""}`}>
                {testStarted && !countdownActive && letterTimerActive ? `${letterTimer.toFixed(1)}s` : "-"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentIndex / targetWord.length) * 100}%` }}
            ></div>
          </div>

          <div className="evaluation-buttons">
            <button className="btn-new-question" onClick={handleNewQuestion}>
              Soal Baru
            </button>
            <button
              className={`btn-camera ${cameraActive ? "btn-stop" : "btn-start"}`}
              onClick={handleToggleCamera}
            >
              {cameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          EVALUATION MODAL
          ========================================== */}
      {showEvaluation && evaluationData && (
        <div className="evaluation-modal-overlay">
          <div className="evaluation-modal">
            <div className="modal-header">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Kata Selesai!</h2>
              <p className="completed-word">{evaluationData.word}</p>
            </div>

            <div className="modal-stats">
              <div className="stat-item">
                <span className="stat-number">{evaluationData.score}</span>
                <span className="stat-label">Total Skor</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{evaluationData.accuracy}%</span>
                <span className="stat-label">Akurasi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{evaluationData.duration}s</span>
                <span className="stat-label">Durasi</span>
              </div>
            </div>

            <div className="modal-details">
              <div className="detail-row">
                <span>Level</span>
                <span>{evaluationData.level}</span>
              </div>
              <div className="detail-row">
                <span>Total Huruf</span>
                <span>{evaluationData.totalLetters}</span>
              </div>
              <div className="detail-row">
                <span>Huruf Benar</span>
                <span>{evaluationData.correctLetters}</span>
              </div>
              <div className="detail-row">
                <span>Huruf Salah</span>
                <span>{evaluationData.wrongAttempts}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-new-word" onClick={handleNewQuestion}>
                Soal Baru
              </button>
              <NavLink to="/user/dashboard">
                <button className="btn-finish">Selesai</button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestBisindo;