import React from 'react';
import data from '../Utils/donnees.json';
import Button from '@mui/material/Button';
const Panier = () => {
  const categories = data.categories;
  // État local pour suivre les cases à cocher des éléments
  const [itemCheckState, setItemCheckState] = React.useState({});

  // Fonction pour gérer le changement de la case à cocher d'un élément
  const handleItemCheckboxChange = (categoryId, itemId, isChecked) => {
    setItemCheckState(prevState => ({
      ...prevState,
      [`${categoryId}-${itemId}`]: isChecked
    }));
  };

  // Fonction pour cocher ou décocher tous les sous-éléments d'une catégorie
  const handleMasterButtonClick = (categoryId) => {
    const isAnyChildChecked = Object.keys(itemCheckState).some(key => key.startsWith(`${categoryId}-`) && itemCheckState[key]);
    const newState = {};
    categories.find(cat => cat.name === categoryId).items.forEach(item => {
      newState[`${categoryId}-${item.id}`] = !isAnyChildChecked;
    });
    setItemCheckState(prevState => ({
      ...prevState,
      ...newState,
      [categoryId]: !isAnyChildChecked
    }));
  };

  const getCheckedItems = () => {
    const checkedCategories = [];
    const checkedItems = [];

    // Parcourir l'état pour trouver les catégories et les éléments cochés
    Object.entries(itemCheckState).forEach(([key, value]) => {
      if (value) {
        const [categoryId, itemId] = key.split('-');
        if(itemId!=undefined){
            checkedItems.push({ categoryId, itemId });
        }
      }
    });

    console.log({ checkedItems })
  };


  return (
    <div style={{ textAlign: "left" }}>
      {categories.map(category => (
        <div key={category.name}>
          <Button
            onClick={() => handleMasterButtonClick(category.name)}
            style={{ margin: "1em 0 0 1em" }}
            variant="outlined"
          >
            <strong>{category.name}</strong>
          </Button>
          {category.items.map(item => (
            <div key={item.id}>
              <input
                style={{ marginLeft: "1em" }}
                type="checkbox"
                id={`${category.name}-${item.id}`} // ID unique pour chaque case à cocher d'élément
                checked={itemCheckState[`${category.name}-${item.id}`] || false}
                onChange={(e) => handleItemCheckboxChange(category.name, item.id, e.target.checked)}
              />
              <label htmlFor={`${category.name}-${item.id}`}>{item.nom}</label>
              {/* Vous pouvez afficher d'autres détails de l'élément ici */}
            </div>
          ))}
        </div>
      ))}
          <Button 
            variant="outlined" 
            style={{ position: "absolute", bottom: "0", left: "0", margin:"1em" }} 
            onClick={getCheckedItems}
            >
                Extract
            </Button>

    </div>
  );
}

export default Panier;
