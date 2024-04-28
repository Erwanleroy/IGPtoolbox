// Panel.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import componentsList from './Components'; 

const Panel = ({clickLien}) => {
  const theme = useTheme().palette; // Obtenez le thème courant
  return (
    <Box style={{backgroundColor: theme.background.paper, color:theme.primary.main, borderColor:theme.primary.main}} sx={{ width: 250 }} className="pannel" role="presentation" >
      <List>
        {componentsList.map((text, index) => (
          <Link onClick={clickLien} key={index} to={`/${text}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem key={index} className='listItemPerso'>
              <ListItemText primary={text} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
};

export default Panel;
