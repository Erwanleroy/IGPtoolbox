import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { getData } from '../Utils/indexeddb';

const Panel = ({ clickLien, onUpdatePage }) => {
  const theme = useTheme().palette; // Obtenez le thème courant
  const [data, setData] = React.useState([]);
  const [componentsList, setComponentsList] = React.useState([]);

  React.useEffect(() => {
    // Charger les données depuis IndexedDB lors du montage du composant
    async function loadData() {
      const data = await getData();
      if (data) {
        setData(data);
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (data && data.categories) {
      // Filtrer et exclure la catégorie "IGP ToolBox"
      const filteredComponents = data.categories
        .map(category => category.name)
        .filter(name => name !== "IGP ToolBox");

      setComponentsList(filteredComponents);
    }
  }, [data]);

  const clickItem = e => {
    clickLien();
    console.log(e)
    onUpdatePage(e.target.innerText);
  };

  return (
    <Box style={{ backgroundColor: theme.background.paper, color: theme.primary.main, borderColor: theme.primary.main }} sx={{ width: 250 }} className="pannel" role="presentation">
      <List>
        {componentsList && componentsList.map((text, index) => (
          <ListItem key={index} onClick={clickItem} style={{ cursor: "pointer" }} className='listItemPerso'>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Panel;
