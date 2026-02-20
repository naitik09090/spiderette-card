import React from "react";
import "./App.css";
import OneSuite from "./components/pages/OneSuite";

function App() {
  return (
    <div className="app">
      <header className="game-header">
        <h1 className="game-title">Spiderette Royal</h1>
      </header>
      <div className="app__gameplay">
        <OneSuite />
      </div>
    </div>
  );
}

export default App;
