import React, { useEffect, useState, useCallback } from "react";
import { startAssistant, stopAssistant } from "./ai";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Badge } from "react-bootstrap";
import "../styles/LoginPage.css";
import "../styles/VeeScreen.css";

function VeeScreen() {
  const [assistantActive, setAssistantActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  // Use Capacitor TTS on mobile, fallback to browser on web
  const speak = useCallback(async (text) => {
    if (window && window.Capacitor && window.Capacitor.isNativePlatform && TextToSpeech) {
      try {
        await TextToSpeech.speak({
          text,
          lang: "en-US",
          rate: 0.9,
          pitch: 1.2,
        });
      } catch (e) {
        // fallback to browser
        if ("speechSynthesis" in window) {
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.2;
          utterance.lang = "en-US";
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }
    } else if ("speechSynthesis" in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle mobile back button
  useEffect(() => {
    const handler = App.addListener("backButton", () => {
      speak("Navigating back to the main screen.");
      navigate("/screenPage");
    });
    return () => {
      handler.remove();
    };
  }, [navigate, speak]);

  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        await startAssistant();
        setAssistantActive(true);
        speak("Initializing Vee assistant.");
      } catch (error) {
        console.error("Error initializing assistant:", error);
        speak("System malfunction detected. Please try reactivating me.");
      }
    };

    initializeAssistant();
    return () => stopAssistant();
  }, [speak]);

  const handleActivate = async () => {
    try {
      await startAssistant();
      setAssistantActive(true);
      speak("Vee Assistant activated.");
    } catch (error) {
      console.error("Error activating assistant:", error);
      speak("Failed to activate Vee Assistant.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await stopAssistant();
      setAssistantActive(false);
      speak("Vee Assistant deactivated.");
    } catch (error) {
      console.error("Error deactivating assistant:", error);
      speak("Failed to deactivate Vee Assistant.");
    }
  };

  const handleBack = () => {
    speak("Navigating back to the main screen.");
    navigate("/screenPage");
  };

  return (
    <Container fluid className="vee-container min-vh-100 p-4 d-flex flex-column">
      <Row className="text-center mb-4">
        <h1 style={{ color: "#00bcd4" }} className="fw-bold mb-0">VEE ASSISTANT</h1>
        <Badge
          style={{
            background: "#00bcd4",
            color: "#0d1b2a",
            borderRadius: "999px",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "1rem"
          }}
          className="px-3 fs-6 mb-3"
        >
          v2.0
        </Badge>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className={`status-indicator pulse`}
            style={{
              width: "12px",
              height: "12px",
              background: assistantActive ? "#00bcd4" : "#b0bec5",
              boxShadow: assistantActive
                ? "0 0 8px #00bcd4"
                : "0 0 8px #b0bec5"
            }}
          ></div>
          <small className={`fw-bold`} style={{ color: assistantActive ? "#00bcd4" : "#b0bec5" }}>
            {assistantActive ? "ACTIVE • LISTENING" : "STANDBY"}
          </small>
        </div>
      </Row>

      <Row className="mt-auto mb-4">
        <Button
          style={{
            background: assistantActive ? "#00bcd4" : "#00bcd4",
            color: "#0d1b2a",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
          size="lg"
          className="w-100 mb-3 py-3"
          onClick={handleActivate}
          disabled={assistantActive}
        >
          {assistantActive ? "ASSISTANT ACTIVE" : "ACTIVATE ASSISTANT"}
        </Button>

        <Button
          style={{
            background: !assistantActive ? "#b0bec5" : "#00bcd4",
            color: "#0d1b2a",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
          size="lg"
          className="w-100 mb-3 py-3"
          onClick={handleDeactivate}
          disabled={!assistantActive}
        >
          DEACTIVATE ASSISTANT
        </Button>

        <Button
          variant="outline-light"
          size="lg"
          className="w-100 py-3 fw-bold border-3"
          style={{
            background: "transparent",
            color: "#00bcd4",
            border: "2px solid #00bcd4",
            borderRadius: "8px"
          }}
          onClick={handleBack}
        >
          BACK TO MAIN MENU
        </Button>
      </Row>
    </Container>
  );
}

export default VeeScreen;