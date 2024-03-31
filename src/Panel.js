import * as React from 'react';
import './App.css'
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import componentsList from './Components'; 

function Panel() {
  return (
    <Box sx={{ width: 250 }} className="pannel" role="presentation">
      <List>
        {componentsList.map((text, index) => (
        <Link key={text} to={`/${text}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem key={text} className='listItemPerso'>
                <ListItemText primary={text} />
            </ListItem>
        </Link>
        ))}
      </List>
    </Box>
  );
}

export default Panel;


