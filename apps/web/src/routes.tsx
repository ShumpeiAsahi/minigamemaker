import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DummyGame from "./pages/games/dummy-game";
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/games/dummy-game" element={<DummyGame />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;