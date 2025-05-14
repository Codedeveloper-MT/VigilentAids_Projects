import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; 
import ScreenPage from "./pages/ScreenPage";
import LocationScreen from "./pages/LocationScreen";
import RouteScreen from "./pages/RouteScreen";
import CameraPage from "./pages/CameraPages";
import VeeScreen from "./pages/veeScreen";
import ForgetPassword from "./pages/ForgetPassword";
import AccountSettings from "./pages/AccountSettings"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/screenPage" element={<ScreenPage />} />
        <Route path="/location" element={<LocationScreen />} />
        <Route path="/routes" element={<RouteScreen />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/vee" element={<VeeScreen />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;