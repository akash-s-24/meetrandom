import { useState, useRef, useCallback } from 'react';

export function usePictureInPicture() {
  const [isPiP, setIsPiP] = useState(false);
  const videoRef = useRef(null);

  const setVideoElement = useCallback((el) => {
    videoRef.current = el;
  }, []);

  const togglePiP = useCallback(async () => {
    if (!document.pictureInPictureEnabled) {
      console.warn('PiP not supported');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);

        videoRef.current.addEventListener('leavepictureinpicture', () => {
          setIsPiP(false);
        }, { once: true });
      }
    } catch (err) {
      console.error('PiP error:', err);
      setIsPiP(false);
    }
  }, []);

  return { isPiP, togglePiP, setVideoElement };
}
