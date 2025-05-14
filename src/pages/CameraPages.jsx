import React, { useState, useEffect } from 'react';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Button, Box, Typography, Stack, Chip } from '@mui/material';
import axios from 'axios';

const CameraPage = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [detections, setDetections] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [lastSentence, setLastSentence] = useState('');

  useEffect(() => {
    let intervalId;
    if (cameraActive) {
      intervalId = setInterval(() => {
        streamAndDetect();
      }, 3000); // Every 3 seconds
    }
    return () => clearInterval(intervalId);
  }, [cameraActive]);

  const toggleCamera = async () => {
    if (cameraActive) {
      await CameraPreview.stop();
    } else {
      await CameraPreview.start({
        position: 'rear',
        parent: 'cameraPreview',
        width: window.innerWidth,
        height: window.innerHeight * 0.7,
        toBack: true
      });
    }
    setCameraActive(!cameraActive);
  };

  const streamAndDetect = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const { value } = await CameraPreview.capture({ quality: 60 });
      const photoSrc = `data:image/jpeg;base64,${value}`;

      const res = await axios.post('http://127.0.0.1:5000/stream-detect', {
        image: photoSrc
      });

      const data = res.data;
      setDetections(data.detections);

      const detectedObjects = data.detections.map(d => d.class);
      const sentence = detectedObjects.length > 0
        ? `I see ${detectedObjects.join(', ')}`
        : 'I see nothing interesting';

      if (sentence !== lastSentence) {
        setLastSentence(sentence);
        await TextToSpeech.speak({ text: sentence });
      }

    } catch (error) {
      console.error("Streaming detection error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: '#121212', color: 'white' }}>
      <Box
        id="cameraPreview"
        sx={{
          height: '70%',
          border: '2px solid #333',
          borderRadius: 2,
          m: 2,
          overflow: 'hidden'
        }}
      >
        {!cameraActive && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#000'
          }}>
            <Typography>Camera is off</Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', p: 2 }}>
        <Button
          variant="contained"
          color={cameraActive ? 'error' : 'success'}
          onClick={toggleCamera}
        >
          {cameraActive ? 'Stop Camera' : 'Start Camera'}
        </Button>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Detected Objects:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {detections.map((d, i) => (
            <Chip
              key={i}
              label={`${d.class} (${Math.round(d.confidence * 100)}%)`}
              color="primary"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CameraPage;
