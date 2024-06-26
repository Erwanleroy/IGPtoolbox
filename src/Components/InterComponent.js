import React from 'react';
import Item from './Item.js';
import {
  Accordion,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { getData } from '../Utils/indexeddb'; // Importer la fonction pour récupérer les données

export default function InterComponent({ page, handleForceRefresh }) {
  const [composant, setComposant] = React.useState(page);
  const [jsonData, setJsonData] = React.useState(null);
  const [sortedItems, setSortedItems] = React.useState(null);
  


  // Charger les données depuis IndexedDB lors du montage du composant
  async function loadData() {
    try {
      const data = await getData();
      if (data) {
        setJsonData(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données depuis IndexedDB:", error);
    }
  }

  React.useEffect(() => {
    setComposant(page)
  }, [page]);

  React.useEffect(() => {
    if (composant) {
      loadData();
    }
  }, [composant]);

  React.useEffect(() => {
    if (jsonData) {
      setSortedItems(null)
      trierData()
    }
  }, [jsonData, localStorage])

  const trierData = () => {
    const localStore = localStorage.getItem(composant)
      ? JSON.parse(localStorage.getItem(composant))
      : []; 
    const donneesDeCetteCategorie = jsonData.categories.find(
      (category) => category.name === composant
    );
    if (donneesDeCetteCategorie) {
      const valeursTriees = donneesDeCetteCategorie.items.sort((a, b) => {
        const aIsFav = localStore.includes(a.id);
        const bIsFav = localStore.includes(b.id);
        return aIsFav && !bIsFav ? -1 : (!aIsFav && bIsFav ? 1 : 0);
      });
      setSortedItems(valeursTriees);
    }
  }

  return (
    <div>
      <h1><u>{composant}</u></h1>
      {sortedItems && sortedItems.length > 0 ? (
        sortedItems.map((item, index) => (
          <Item key={index} composant={composant} id={item.id} forceRefresh={handleForceRefresh} />
        ))
      ) : (
        <div>
          <Accordion style={{ margin: '10px' }}>
            <AccordionSummary onClick={loadData}>
              <Typography>Données non chargées</Typography>
            </AccordionSummary>
          </Accordion>
        </div>
      )}
    </div>
  );
}
