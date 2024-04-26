import React from 'react';
import Item from '../Utils/Item'
import data from '../Utils/donnees.json'

export default function Linux() {
  const composant="Linux"
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
        <p>Ici vous trouverez des commandes pour aider a la gestion de Linuss </p>
        {sortedItems.map((item,index)=> (
          <Item key={index} composant={composant} id={item.id} />
        ))}
      </div>
    );
  }
  
  
  