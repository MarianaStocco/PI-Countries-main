const { Router } = require("express");
const axios = require("axios");
const { Activity, Country } = require("../db");
const { Op } = require("sequelize");

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.get("/countries", async (req, res) => {
  const { name } = req.query;
  const dbCountries = await Country.findAll();

  try {
     const allCountries = await axios.get("https://restcountries.com/v3/all");

    !dbCountries.length &&
      (await Country.bulkCreate(
        allCountries.data.map((c) => {
          return {
            cca3: c.cca3,
            name: c.name.common,
            flags: c.flags[1],
            continents: c.continents,
            capital: c.capital || ["No tiene capital"], 
            subregion: c.subregion || ["No hay datos de Subregion"],
            area: c.area,
            population:c.population,
          };
        })
      ));

    let result = name ? await Country.findAll({
          where: {
            name: {
              [Op.like]: `%${name}%`, 
            },
          },
          include: [
            {
              model: Activity,
              attributes: ["name"],
              through: {
                attributes: [],
              },
            },
          ],
        }) 
      : await Country.findAll({
          include: [
            {
              model: Activity,
              attributes: ["name"],
              through: {
                attributes: [],
              },
            },
          ],
        });

    res.status(200).json(
      result.map((c) => {
        return {
          cca3: c.cca3,
          name: c.name,
          flags: c.flags,
          continents: c.continents,
          subregion: c.subregion,
          area: c.area,
          population: c.population,
          activities: c.activities.map((a) => a.name),
        };
      })
    );
  } catch (error) {
    res.json({ error: "No hay resultados para mostrar" });
  }
});


router.get("/countries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let detalle = await Country.findOne({
      where: {
        cca3: id,
      },
      include: [
        {
          model: Activity,
          through: {
            attributes: [],
          },
        },
      ],
    });

    res.status(200).json(detalle);
  } catch (error) {
 
    res.json({ error: "El ID ingresado no existe" });
  }
});

module.exports = router;