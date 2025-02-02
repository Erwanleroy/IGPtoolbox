// Home.js
import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { getData, getMep } from '../Utils/indexeddb';
import { Card, Paper, Tab, Tabs, CardContent, CardActions, Button, Typography, Box } from '@mui/material';


const Home = ({ onUpdatePage }) => {
  let lightModeStored = localStorage.getItem("lightMode");
  //const test={"categories":[{"name":"IGP ToolBox","items":[{"id":1,"nom":"RAS","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"RASSSSSS.","code":"ls -la"}]},{"name":"Linux","items":[{"id":1,"nom":"Kernel","image":"https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000","desc":"The Linux kernel is the core component of the Linux operating system.","code":"uname -a"},{"id":2,"nom":"Bash","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":3,"nom":"Bitsh","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":4,"nom":"TEST2","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"}]},{"name":"MQseries","items":[{"id":1,"nom":"Queue Management","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Manage message queues with MQSeries.","code":"dspmq"}]},{"name":"CFT","items":[{"id":1,"nom":"File Operations","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"},{"id":2,"nom":"TEST","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"}]}]}
  const [ totalData, setTotalData ] = React.useState([])
  const [ totalMep, setTotalMep ] = React.useState([])
  const [value, setValue] = React.useState("1");

  const backgroundColor = lightModeStored === 'dark' ? '#272727' : ""
  const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#D3D3D3' : ""
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function loadData() {
    const data = await getData();
    const mep = await getMep();
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
    setTotalMep(mep)
  }

  const changePage = (e) => {
    onUpdatePage(e)
  }

  React.useEffect(() => {
    loadData(); // Appeler loadData uniquement lors du premier rendu
  }, []);

  return (
    <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
      <div style={{flexGrow:1, maxWidth:"300px"}}>
        <Paper 
          elevation={3} 
          style={{
              width:"28vw",
              maxWidth:"280px", 
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
          style={{width:"30vw", minWidth:"150px", maxWidth: "300px", backgroundColor:backgroundColor, borderRadius:"5px"}}
          aria-label="Vertical navigation"  
          onChange={handleChange} 
          value={value}
          sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="Binds" value="1" sx={{ backgroundColor:"rgba(0,0,0,0.1)"}} />
            <Tab label="Add/Del binds" value="2" sx={{ fontSize:".5em"}} onClick={() => changePage("AddOrRemove")}/>
            <Tab label="Export binds" value="3" sx={{ fontSize:".5em"}} onClick={() => changePage("Extract")}/>
            <Tab label="MEP" value="4" sx={{ backgroundColor:"rgba(0,0,0,0.1)"}} />
            <Tab label="Manage MEP" value="5" sx={{ fontSize:".5em"}} onClick={() => changePage("ManageMep")}/>
            <Tab label="Run a MEP" value="6" sx={{ fontSize:".5em"}} onClick={() => changePage("RunMep")}/>
        </Tabs>
      </div>

      <div style={{flexGrow:3, display:"flex", flexDirection:"column"}}>
        <div>
          <h2 style={{color:writingColor}}>Total binds :</h2>

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
            style={{height:200}}

            sx={{
              '& tspan': {
                fill: writingColor, // Légende en blanc
              },
            }}
            />
        </div>
        <div style={{marginTop:"10vh"}}>
            <div style={{color:writingColor}}>Numbers of MEP available : {totalMep.mep?totalMep.mep.length:"0"}</div>
          <Card sx={{ maxWidth: 345, margin: 'auto', mt: 5 }}>
            <CardContent>
              <Typography variant="h5" component="div" title="Major Environment Push 😉">
                MEP 
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Entering MEP management 😎
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
              <Box>
                <Button variant="contained" color="primary" sx={{ mb: 1, width: '100%' }} onClick={() => changePage("ManageMep")}>
                  Manage MEP
                </Button>
                <Button variant="outlined" color="secondary" sx={{ width: '100%' }} onClick={() => changePage("RunMep")}>
                  Run a MEP
                </Button>
              </Box>
            </CardActions>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home