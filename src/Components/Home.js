// Home.js
import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { getData } from '../Utils/indexeddb';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';


const Home = ({ onUpdatePage }) => {
  let lightModeStored = localStorage.getItem("lightMode");
  //const test={"categories":[{"name":"IGP ToolBox","items":[{"id":1,"nom":"RAS","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"RASSSSSS.","code":"ls -la"}]},{"name":"Linux","items":[{"id":1,"nom":"Kernel","image":"https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000","desc":"The Linux kernel is the core component of the Linux operating system.","code":"uname -a"},{"id":2,"nom":"Bash","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":3,"nom":"Bitsh","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":4,"nom":"TEST2","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"}]},{"name":"MQseries","items":[{"id":1,"nom":"Queue Management","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Manage message queues with MQSeries.","code":"dspmq"}]},{"name":"CFT","items":[{"id":1,"nom":"File Operations","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"},{"id":2,"nom":"TEST","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"}]}]}
  const [ totalData, setTotalData ] = React.useState([])
  const [value, setValue] = React.useState("1");

  const backgroundColor = lightModeStored === 'dark' ? '#272727' : ""
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function loadData() {
    const data = await getData();
    if (data) {
      let dataFromBdd = data.categories
      .filter(category => category.name !== "IGP ToolBox") // Exclure la catégorie "IGP ToolBox"
      .map((category, index) => {
        return {
          id: index,               // Identifiant unique basé sur l'index
          value: category.items.length,  // Nombre d'items dans cette catégorie
          label: category.name     // Nom de la catégorie
        };
      });
      setTotalData(dataFromBdd)
    }
  }

  const changePage = (e) => {
    onUpdatePage(e)
  }

  React.useEffect(() => {
    loadData(); // Appeler loadData uniquement lors du premier rendu
  }, []);

  return (
    <div>
      <div style={{position:"fixed"}}>
        <Paper 
          elevation={3} 
          style={{
              width:"28vw", 
              margin:"1vw",
              height:"4em",  
              lineHeight: '60px',
              borderRadius:".5em .5em 0 0"
            }}
          >
          Navigation
        </Paper>
        <Tabs
          orientation="vertical"
          style={{width: "30vw", backgroundColor:backgroundColor, borderRadius:"5px"}}
          aria-label="Vertical navigation"  
          onChange={handleChange} 
          value={value}
          sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="Binds" value="1" sx={{ backgroundColor:"rgba(0,0,0,0.1)"}} />
            <Tab label="Add/Del binds" value="2" sx={{ fontSize:".5em"}} onClick={() => changePage("AddOrRemove")}/>
            <Tab label="Export binds" value="3" sx={{ fontSize:".5em"}} onClick={() => changePage("Extract")}/>
            <Tab label="MEP" value="4" sx={{ backgroundColor:"rgba(0,0,0,0.1)"}} />
            <Tab label="Manage MEP" value="5" sx={{ fontSize:".5em"}} />
            <Tab label="Run a MEP" value="6" sx={{ fontSize:".5em"}} />
        </Tabs>
      </div>

      <div style={{position:"absolute", right:0}}>
        <h1><u>Total binds :</u></h1>

        <PieChart
          series={[
            {
              data:totalData,
              innerRadius: 30,
              paddingAngle: 5,
              cornerRadius: 5,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            },
          ]}
          style={{height:200, width: "70vw", }}
          />
      </div>
    </div>
  )
}

export default Home