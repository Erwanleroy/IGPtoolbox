// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from "./Utils/NavBar";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import componentsList from "./Utils/Components"; // Importez la liste des modules depuis Components.js
import Home from './Components/Home';
import { orange, red } from '@mui/material/colors';

const App = () => {
  let lightModeStored = localStorage.getItem("lightMode");
  
  const [modules, setModules] = useState([]);
  const [lightMode, setLightMode] = useState((lightModeStored === "dark" || lightModeStored === "light") ? lightModeStored : "dark");
  
  const updateMode = (newMode) => {
    setLightMode(newMode)
  }

  const theme = createTheme({
    palette: {
      mode: lightMode, // Choisissez le mode 'dark' pour activer le mode sombre
      primary: {
        main: lightMode === "light" ? orange[700] : red[500], // Couleur primaire conditionnelle
      },
    },
  });

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
    <ThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <NavBar onUpdateMode={updateMode}/>
            <Routes>
              <Route path="/" element={<Home />} /> 
              {modules.map(({ name, component: Component }) => (
                <Route key={name} path={`/${name}`} element={<Component />} /> 
              ))}
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}


export default App;