import React from 'react';
import Item from '../Utils/Item'

//récupere page qui sera le component a afficher Linux/CFT/MQ...
export default function InterComponent(page) {
    const [sortedItems, setSortedItems] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true); 
    const [error, setError] = React.useState(null);
    const composant=page.page.toLowerCase()
    
    React.useEffect(() => {
      const fetchData = async () => {
        try {
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
  
          setIsLoading(false); // Marquer comme chargé
        } catch (err) {
          console.error('Erreur lors du chargement:', err); // Gérer l'erreur
          setError(err);
        }
      };
  
      fetchData(); // Exécution unique lors du montage
    }, [composant]); // Dépendance sur `composant`
  
    if (error) {
      return <div>Erreur lors du chargement. Veuillez réessayer.</div>; // Afficher un message d'erreur
    }

    return (
      <div>
        <h1><u>Commandes utiles sur {composant.toUpperCase()}</u></h1>
        
        {isLoading ? (
          <div>En cours de chargement...</div> 
        ) : (
          // Afficher les éléments si `sortedItems` n'est pas vide
          sortedItems && sortedItems.length > 0 ? (
            sortedItems.map((item, index) => (
              <Item key={index} composant={composant} id={item.id} />
            ))
          ) : (
            <div>Aucun élément à afficher</div> // Message alternatif si pas d'éléments
          )
        )}
      </div>
    )

}