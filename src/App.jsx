import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; 
import ScreenPage from "./pages/ScreenPage";
import LocationScreen from "./pages/LocationScreen";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/screenPage" element={<ScreenPage />} />
        <Route path="/location" element={<LocationScreen />} />
      </Routes>
    </Router>
  );
}

export default App;