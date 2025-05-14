import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from '@capacitor/app';
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Function to speak text
  const speak = async (text) => {
    try {
      setIsSpeaking(true);

      if (Capacitor.isNativePlatform()) {
        // For mobile platforms (Capacitor)
        await TextToSpeech.speak({
          text: text,
          lang: "en-US",
          rate: 0.9,
          pitch: 1.1,
          volume: 1.0,
        });
      } else {
        // For web, use SpeechSynthesis API
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 0.9;
        speech.pitch = 1.1;
        speech.volume = 1.0;
        speechSynthesis.speak(speech);
      }

      setIsSpeaking(false);
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  };

  // Function to stop speech
  const stopSpeech = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
      } else {
        speechSynthesis.cancel(); // Stop speech on web
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error("Stop Speech Error:", error);
    }
  };

  // Show message after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showMessage) {
      speak("Welcome to Vigilent Aids. Tap anywhere to continue to login.");
    }
  }, [showMessage]);

  // Handle navigation
  const handleNavigation = () => {
    stopSpeech();
    document.querySelector(".welcome-container")?.classList.add("fade-out");

    setTimeout(() => {
      if (Capacitor.isNativePlatform()) {
        window.location.hash = "#/login";
      } else {
        navigate("/login");
      }
    }, 300);
  };

  // Handle back button on mobile
  useEffect(() => {
    const backHandler = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <div
      className="welcome-container"
      onClick={handleNavigation}
      role="button"
      aria-label="Welcome screen"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      <div className="particle-background"></div>

      <div className="content-wrapper">
        <h1 className="main-title">
          <span className="title-part">Vigilent</span>
          <span className="title-part accent">Aids</span>
        </h1>

        {showMessage && (
          <div className="instruction-message">
            <p>Tap anywhere to continue</p>
            <div className="pulse-circle"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                speak("Tap anywhere to continue to login.");
              }}
              className="btn btn-outline-light mt-3"
            >
              Tap to Hear Message
            </button>
          </div>
        )}

        {isSpeaking && (
          <div className="speech-indicator">
            <div className="sound-wave">
              {[...Array(4)].map((_, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
