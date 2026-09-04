import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Link, useNavigate } from "react-router-dom";
import "./QrScanner.css";

function QrScanner() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const [status, setStatus] = useState("Initializing scanner...");
  const [error, setError] = useState("");

  const stopScanner = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback((value) => {
    stopScanner();
    const user = localStorage.getItem("wahap_temp_user");
    
    if (!user) {
      sessionStorage.setItem("pendingMapRedirect", value);
      navigate("/signin");
    } else {
      navigate(`/event/${value}`);
    }
  }, [navigate, stopScanner]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setStatus("Processing image...");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          handleScanSuccess(code.data);
        } else {
          setError("No QR code found in this image. Please try a clearer picture.");
          setStatus("Scan failed.");
        }
      };
      img.onerror = () => {
        setError("Error loading image file.");
        setStatus("Error.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const startScanner = useCallback(async () => {
    stopScanner();
    setError("");
    setStatus("Requesting camera permission...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
        setStatus("Scanner ready. Point your camera at a QR code.");

        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;
          const video = videoRef.current;

          if (video.readyState !== 4) return;

          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const foundCodes = await detectorRef.current.detect(canvas);
          if (foundCodes.length > 0) {
            const value = foundCodes[0].rawValue || "QR detected";
            handleScanSuccess(value);
          }
        }, 300);
      } else {
        setStatus("Scanner running (jsQR mode). Point your camera at a QR code.");
        
        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;

          if (video.readyState !== 4) return;

          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScanSuccess(code.data);
          }
        }, 300);
      }
    } catch (scanError) {
      setError("Unable to open the camera. Please allow camera permission and try again.");
      setStatus("Scanner unavailable.");
      console.error(scanError);
    }
  }, [stopScanner, handleScanSuccess]);

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="qr-page">
      <div className="qr-header-row">
        <h1>QR Scanner</h1>
        <Link to="/" className="qr-back-link">Back to Home</Link>
      </div>

      <p className="qr-subtitle">Scan entry or stall QR codes instantly using your device camera.</p>

      <div className="qr-scanner-shell">
        <video ref={videoRef} className="qr-video" muted playsInline />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div className="qr-scan-frame">
          <div className="qr-scan-line" />
        </div>
      </div>

      <p className="qr-status">{status}</p>
      {error && <p className="qr-error">{error}</p>}

      <div className="qr-actions">
        <button type="button" onClick={startScanner} className="qr-action-btn">Restart Scanner</button>
        <button type="button" onClick={stopScanner} className="qr-action-btn secondary">Stop Camera</button>
        <label className="qr-action-btn upload-btn">
          Upload Image
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            style={{ display: "none" }} 
          />
        </label>
      </div>
    </div>
  );
}

export default QrScanner;
