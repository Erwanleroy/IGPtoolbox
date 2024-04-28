import React from 'react';
import Item from '../Utils/Item'
import data from '../Utils/donnees.json'

//récupere page qui sera le component a afficher Linux/CFT/MQ...
export default function InterComponent(page) {
    const composant=page.page.toLowerCase()
  let localStore = localStorage.getItem(composant) 
    ? JSON.parse(localStorage.getItem(composant)) 
    : []
  //ici on va chercher dans ../utils/donnees.json celles qui nous concerne 
  const donneesDeCetteCategorie = data.categories.find((category) => category.name === composant);

  // Trier les éléments pour mettre les favoris en premier
  const sortedItems = donneesDeCetteCategorie.items.sort((a, b) => {
    const aIsFav = localStore.includes(a.id);
    const bIsFav = localStore.includes(b.id);
    if (aIsFav && !bIsFav) {
      return -1; // Met "a" avant "b"
    } else if (!aIsFav && bIsFav) {
      return 1; // Met "b" avant "a"
    }
    return 0; // Conserve l'ordre d'origine si les deux sont ou ne sont pas favoris
  })

    return (
      <div>
        <h1><u>Commandes utiles sur {composant.toUpperCase()}</u></h1>
        {sortedItems.map((item,index)=> (
          <Item key={index} composant={composant} id={item.id} />
        ))}
      </div>
    );
  }
  
  
  