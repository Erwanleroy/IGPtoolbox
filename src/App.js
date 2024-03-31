// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import NavBar from "./NavBar";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import componentsList from "./Components"; // Importez la liste des modules depuis Components.js
import Home from './Components/Home';

function App() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const importModules = async () => {
      const importedModules = await Promise.all(
        componentsList.map(async (moduleName) => {
          const module = await import(`./Components/${moduleName}`); // Utilisez le chemin correct pour importer les modules
          return { name: moduleName, component: module.default };
        })
      );
      setModules(importedModules);
    };
    importModules();
  }, []);

  return (
    <div className="App">
      <Router>
        <NavBar />
          <Routes>
            <Route path="/" element={<Home />} /> 
            {modules.map(({ name, component: Component }) => (
              <Route key={name} path={`/${name}`} element={<Component />} /> 
            ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
