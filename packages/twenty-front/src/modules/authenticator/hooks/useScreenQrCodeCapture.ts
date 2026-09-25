import { t } from '@lingui/core/macro';
import jsQR from 'jsqr';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const SCAN_INTERVAL_IN_MILLISECONDS = 500;

type CaptureSession = {
  stream: MediaStream;
  scanIntervalId: number;
};

const releaseCaptureSession = (captureSession: CaptureSession) => {
  window.clearInterval(captureSession.scanIntervalId);
  captureSession.stream.getTracks().forEach((track) => track.stop());
};

const readQrCodeFromVideo = (video: HTMLVideoElement) => {
  if (video.videoWidth === 0) {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!isDefined(context)) {
    return null;
  }

  context.drawImage(video, 0, 0);
  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return jsQR(data, width, height)?.data ?? null;
};

type UseScreenQrCodeCaptureProps = {
  onOtpauthUriFound: (uri: string) => void;
  onStatusChange: (status: string) => void;
};

// Shares a screen/tab via getDisplayMedia and scans its frames for an otpauth QR code
export const useScreenQrCodeCapture = ({
  onOtpauthUriFound,
  onStatusChange,
}: UseScreenQrCodeCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [captureSession, setCaptureSession] = useState<CaptureSession | null>(
    null,
  );

  const endCaptureSession = (sessionToEnd: CaptureSession) => {
    releaseCaptureSession(sessionToEnd);

    if (isDefined(videoRef.current)) {
      videoRef.current.srcObject = null;
    }

    setCaptureSession((currentSession) =>
      currentSession === sessionToEnd ? null : currentSession,
    );
  };

  const stopCapture = () => {
    if (isDefined(captureSession)) {
      endCaptureSession(captureSession);
    }
  };

  const startCapture = async () => {
    if (!isDefined(navigator.mediaDevices?.getDisplayMedia)) {
      onStatusChange(t`Screen capture requires HTTPS or localhost.`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (isDefined(videoRef.current)) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const session: CaptureSession = {
        stream,
        scanIntervalId: window.setInterval(() => {
          const uri = isDefined(videoRef.current)
            ? readQrCodeFromVideo(videoRef.current)
            : null;

          if (isDefined(uri) && uri.startsWith('otpauth://')) {
            endCaptureSession(session);
            onOtpauthUriFound(uri);
          }
        }, SCAN_INTERVAL_IN_MILLISECONDS),
      };

      // The browser's own "Stop sharing" button ends the track
      stream
        .getVideoTracks()[0]
        ?.addEventListener('ended', () => endCaptureSession(session));

      setCaptureSession(session);
      onStatusChange(t`Waiting to scan an otpauth QR code.`);
    } catch (error) {
      onStatusChange(
        error instanceof Error ? error.message : t`Screen capture failed.`,
      );
    }
  };

  // Release the screen share if the dialog unmounts while capturing
  useEffect(() => {
    if (!isDefined(captureSession)) {
      return;
    }

    return () => releaseCaptureSession(captureSession);
  }, [captureSession]);

  return {
    videoRef,
    isCapturing: isDefined(captureSession),
    startCapture,
    stopCapture,
  };
};
