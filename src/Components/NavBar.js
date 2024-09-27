import React, { useEffect, useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ToolTip from '@mui/material/Tooltip'
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IsoIcon from '@mui/icons-material/Iso';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Panel from './Panel';
import Tab from '@mui/material/Tab';

export default function NavBar({ onUpdateMode, onUpdatePage }) {
  let lightModeStored = localStorage.getItem("lightMode");
  const [isPanelOpen, setIsPanelOpen] = useState(false); // État pour contrôler la visibilité du panel
  const [lightMode, setLightMode] = useState((lightModeStored === "dark" || lightModeStored === "light") ? lightModeStored : "dark");
  const panelRef = useRef(null);
  const menuIconRef = useRef(null);

  const toggleDarkMode = () => {
    let newMode = lightMode === 'dark' ? 'light' : 'dark'
    setLightMode(newMode)
    localStorage.setItem("lightMode", newMode)
    onUpdateMode(newMode)
  }

  const handleClickOutsidePanel = (event) => {
    //vérifie si on clic hors du panneau && hors du menu burger déja géré ailleurs
    if (
      panelRef.current &&
      !panelRef.current.contains(event.target) &&
      menuIconRef.current &&
      !menuIconRef.current.contains(event.target)
    ) {
      setIsPanelOpen(false); // Déclencher la fermeture du panneau
    }
  }
  // Fonction de gestionnaire pour le clic sur le burger menu
  const handleMenuButtonClick = () => {
    setIsPanelOpen(!isPanelOpen); // Inverse l'état pour afficher ou masquer le panel
  };

  useEffect(() => {
    // Ajouter un écouteur d'événement de clic sur l'ensemble de la fenêtre
    window.addEventListener('click', handleClickOutsidePanel);

    // Retirer l'écouteur d'événement de clic lors du démontage du composant
    return () => {
      window.removeEventListener('click', handleClickOutsidePanel);
    };
  }, []);

  const changePage = e => {
    const id = e.target.id || e.currentTarget.id;
    onUpdatePage(id)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            ref={menuIconRef}
            onClick={handleMenuButtonClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            id="Home"
            sx={{ flexGrow: 1 }}
            onClick={changePage}
          >
            <Tab label="IGP ToolBox" style={{fontSize:"2em"}} />
            
          </Typography>
          <ToolTip title="Add or Remove items">
            <IsoIcon
              id="AddOrRemove"
              style={{
                cursor: "pointer",
                marginRight: "1em"
              }}
              onClick={changePage}
            />
          </ToolTip>
          <ToolTip title="Import / Export configuration">
            <FileUploadIcon
              id="Extract"
              style={{
                cursor: "pointer",
                marginRight: "1em"
              }}
              onClick={changePage}
            />
          </ToolTip>
          <ToolTip title="Switch light">
            {lightMode === 'light'
              ? <DarkModeIcon
                onClick={toggleDarkMode}
                style={{ cursor: "pointer" }}
              />
              : <LightModeIcon
                onClick={toggleDarkMode}
                style={{ cursor: "pointer" }}
              />
            }
          </ToolTip>
        </Toolbar>
      </AppBar>
      {isPanelOpen &&
        <div ref={panelRef}>
          <Panel clickLien={handleMenuButtonClick} onUpdatePage={onUpdatePage} />
        </div>
      }
    </Box>
  );
}