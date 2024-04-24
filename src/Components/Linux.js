import Item from '../Utils/Item'
import data from '../Utils/donnees.json'

export default function Linux() {
  const categorie = data.categories.find((category) => category.name === 'Linux');

    return (
      <div>
        <p>Ici vous trouverez des commandes pour aider a la gestion de Linuss</p>
        {categorie.items.map((item,index)=> (
          <Item key={index} nom={item.nom} desc={item.desc} image={item.image} code={item.code} />
        ))}
      </div>
    );
  }
  
  
  