import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BarcodeScanner — Uses the BarcodeDetector API if available,
 * with a manual text-input fallback.
 *
 * Props:
 *   onScan(barcode: string) — called when a barcode is detected or submitted
 */
const BarcodeScanner = ({ onScan }) => {
  const { t } = useTranslation(['stock']);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [hasDetector, setHasDetector] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setHasDetector(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);
    } catch (err) {
      setError(t('barcode.cameraError'));
      setIsScanning(false);
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Scan loop using BarcodeDetector
  useEffect(() => {
    if (!isScanning || !hasDetector || !videoRef.current) return;
    let cancelled = false;
    const detector = new window.BarcodeDetector();

    const scan = async () => {
      if (cancelled || !videoRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue);
          stopCamera();
          return;
        }
      } catch {
        // ignore detection errors
      }
      if (!cancelled) requestAnimationFrame(scan);
    };
    requestAnimationFrame(scan);

    return () => { cancelled = true; };
  }, [isScanning, hasDetector, onScan, stopCamera]);

  // Cleanup on unmount
  useEffect(() => stopCamera, [stopCamera]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Camera scanner */}
      {hasDetector && (
        <div>
          {!isScanning ? (
            <button onClick={startCamera}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              {t('barcode.startScan')}
            </button>
          ) : (
            <div className="relative">
              <video ref={videoRef} className="w-full max-w-sm rounded-md border" muted playsInline />
              <button onClick={stopCamera}
                className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                {t('barcode.stopScan')}
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      )}

      {/* Manual fallback */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder={t('barcode.placeholder')}
          className="flex-1 rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2"
        />
        <button type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
          {t('barcode.lookup')}
        </button>
      </form>
    </div>
  );
};

export default BarcodeScanner;
