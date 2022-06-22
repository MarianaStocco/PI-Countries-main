const { Router } = require("express");
const axios = require("axios");
const { Activity, Country } = require("../db");


// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

const getCountries = async ()=>{
  const url = await axios.get('https://restcountries.com/v3/all')
  const apiInfo = await url.data.map( c => {
    return{
      cca3 : c.cca3,
      name: c.name.common,
      flag: c.flags[1],
      continents: c.continents,
      capital: c.capital || ['No tiene capital'],
      subregion: c.subregion || ['No hay datos de subregión'],
      area: c.area,
      population: c.population
    };
  });
  return apiInfo;
}

const getDbInfo = async () => {
  return await Country.findAll({
    include: {
      model: Activity,
      attibutes: ['name'],
      through: {
        attibutes: []
      }
    }
  });
};

const getAllCountries = async () => {
  const apiInfo = await getCountries();
  const dbInfo = await getDbInfo();
  const infoCountryTotal = apiInfo.concat(dbInfo)
  return infoCountryTotal
};

router.get("/", async (req, res) => {
   const {name} = req.query;
   let countriesTotal = await getAllCountries();
   if(name){
    let countryName = await countriesTotal.filter( c=> c.name.toLowerCase().includes(name.toLocaleLowerCase()))
    countryName.length ? 
    res.status(200).send(countryName) :
    res.status(404).send('No se encontró el país')
   } else {
    res.status(200).send(countriesTotal)
   }
});

router.get('/:id', async (req, res) => {
  const {id} = req.params;
  const totalCountries = await getAllCountries();
  if(id){
    let countriesID = await totalCountries.filter( c => c.id === id)
    countriesID.length ?
    res.status(200).json(countriesID) :
    res.status(404).send('No se encontró el país')
  }
})

module.exports = router;