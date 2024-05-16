// App.js
import './App.css';
import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from "./Components/NavBar";
import InterComponent from './Components/InterComponent';
import Extract from './Components/Extract';
import Home from './Components/Home';
import { orange, red } from '@mui/material/colors';

const App = () => {
  let lightModeStored = localStorage.getItem("lightMode");
  const [page, setPage] = useState("Home");
  const [lightMode, setLightMode] = useState((lightModeStored === "dark" || lightModeStored === "light") ? lightModeStored : "dark");
  const [forceRefresh, setForceRefresh] = React.useState(0)
  
  const updateMode = (newMode) => {
    setLightMode(newMode)
  }

  const updatePage = newPage => {
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

  const handleForceRefresh = () => {
    setForceRefresh(val=>val+1)
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavBar onUpdateMode={updateMode} onUpdatePage={updatePage}/>
        {(() => {
          switch (page) {
            case "Extract":
              return <Extract />;
            case "Home":
              return <Home />;
            default:
              return <InterComponent key={forceRefresh} page={page} handleForceRefresh={handleForceRefresh}/>
          }
        })()}
      </div>
    </ThemeProvider>
  );
}


export default App;