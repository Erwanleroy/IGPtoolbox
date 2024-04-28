// Panel.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import componentsList from './Components'; 

const Panel = ({clickLien, onUpdatePage}) => {
  const theme = useTheme().palette; // Obtenez le thème courant

  const clickItem = e => {
    clickLien()
    onUpdatePage(e.target.innerText)
  }

  return (
    <Box style={{backgroundColor: theme.background.paper, color:theme.primary.main, borderColor:theme.primary.main}} sx={{ width: 250 }} className="pannel" role="presentation" >
      <List>
        {componentsList.map((text, index) => (
          <ListItem key={index} onClick={clickItem} style={{cursor:"poiter"}} className='listItemPerso'>
            <ListItemText primary={text} />
          </ListItem>    
        ))}
      </List>
    </Box>
  );
};

export default Panel;
