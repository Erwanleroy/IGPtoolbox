// App.js
import './App.css';
import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from "./Components/NavBar";
import InterComponent from './Components/InterComponent';
import Extract from './Components/Extract';
import Home from './Components/Home';
import AddOrRemove from './Components/AddOrRemove';
import ManageMep from './Components/ManageMep';
import RunMep from './Components/RunMep';
import { orange, red } from '@mui/material/colors';

const App = () => {
  let lightModeStored = localStorage.getItem("lightMode");
  const backgroundColor = lightModeStored === 'dark' ? '#272727' : ""
  const [page, setPage] = useState("Home");
  const [lightMode, setLightMode] = useState((lightModeStored === "dark" || lightModeStored === "light") ? lightModeStored : "dark");
  const [forceRefresh, setForceRefresh] = React.useState(0)
  
  const updateMode = (newMode) => {
    setLightMode(newMode)
  }

  const updatePage = (newPage) => {
    const cleanNewPage = newPage.replace(/\n/g, '');
    setPage(cleanNewPage);
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
      <div className="App" style={{backgroundColor:backgroundColor, height:"100%", minHeight:"100vh"}}>
        <NavBar onUpdateMode={updateMode} style={{zIndex:"9999999"}} onUpdatePage={updatePage} />
        {(() => {
          switch (page) {
            case "Extract":
              return <Extract />;
            case "AddOrRemove":
              return <AddOrRemove />;
            case "ManageMep":
              return <ManageMep onUpdatePage={updatePage}/>;
            case "RunMep":
              return <RunMep onUpdatePage={updatePage}/>;
            case "Home":
              return <Home onUpdatePage={updatePage}/>;
            default:
              return <InterComponent key={forceRefresh} page={page} handleForceRefresh={handleForceRefresh}/>
          }
        })()}
      </div>
    </ThemeProvider>
  );
}


export default App;