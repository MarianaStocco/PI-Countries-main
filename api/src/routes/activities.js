const { Router } = require("express");
const { Activity, Country } = require("../db")


const router = Router();

router.get("/activities", async (req, res) => {
   try {
      const allActivities = await Activity.findAll()
      res.status(200).json(allActivities.map(a => a.name))
   } catch (error) {
      res.status(400).json({ error: "No se encontraron actividades" })
   }

});

router.post('/activity', async (req, res) => {
   const { name, difficulty, duration, season, countries } = req.body;
   try {
      if (name.length !== 0) {
         let aux = countries.split(",");
         let countriesList = [];
         for (let i = 0; i < aux.length; i++) {
            const country = await Country.findOne({
               where: {
                  name: aux[i],
               }
            });
            countriesList.push(country);
         }
         const newActivity = await Activity.create({
            name,
            difficulty,
            duration,
            season
         })
         newActivity.addCountry(countriesList)
         res.status(200).send(`La actividad ${name} ha sido creada`)
      }
   } catch (error) {
      res.status(400).json({ error: "Los datos son incorrectos" })
   }
});

   module.exports = router;