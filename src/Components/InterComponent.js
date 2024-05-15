import React from 'react';
import Item from './Item.js'
import { 
  Accordion, 
  AccordionSummary, 
  Typography,
} from '@mui/material';

//récupere page qui sera le component a afficher Linux/CFT/MQ...
export default function InterComponent( {page, handleForceRefresh}) {
    const composant=page
    const [sortedItems, setSortedItems] = React.useState(null);
    React.useEffect(() => {

      const jsonData = require('../Utils/donnees.json'); // Charger le fichier JSON
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
    }, [composant]); 

    return (
      <div>
        <h1><u>Commandes utiles sur {composant}</u></h1>
        
          {sortedItems && sortedItems.length > 0 ? (
            sortedItems.map((item, index) => (
              <Item key={index} composant={composant} id={item.id} forceRefresh={handleForceRefresh} />
            ))
          ) : (
            <div>
              <Accordion style={{margin:'10px'}}>
                <AccordionSummary>
                  <Typography>Données non chargées</Typography>
                </AccordionSummary>
              </Accordion>
            </div>
        )}
      </div>
    )
}