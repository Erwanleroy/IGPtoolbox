// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from "./Utils/NavBar";
import InterComponent from './Components/InterComponent';
import { orange, red } from '@mui/material/colors';

const App = () => {
  let lightModeStored = localStorage.getItem("lightMode");
  
  const [page, setPage] = useState("Home");
  const [lightMode, setLightMode] = useState((lightModeStored === "dark" || lightModeStored === "light") ? lightModeStored : "dark");
  
  const updateMode = (newMode) => {
    setLightMode(newMode)
  }

  const updatePage = newPage => {
    console.log(newPage)
    setPage(newPage)
  }

  const theme = createTheme({
    palette: {
      mode: lightMode, // Choisissez le mode 'dark' pour activer le mode sombre
      primary: {
        main: lightMode === "light" ? orange[700] : red[500], // Couleur primaire conditionnelle
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavBar onUpdateMode={updateMode} onUpdatePage={updatePage}/>
        <InterComponent page={page}/>
      </div>
    </ThemeProvider>
  );
}


export default App;