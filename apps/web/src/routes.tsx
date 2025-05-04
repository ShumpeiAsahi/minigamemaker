import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DummyGame from "./pages/games/dummy-game";
import Edit from "./pages/games/edit";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/games/dummy-game" element={<DummyGame />} />
        <Route path="/edit" element={<Edit />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
