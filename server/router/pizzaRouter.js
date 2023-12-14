const express = require("express");
const router = express.Router();
const pizzaModel = require("../models/pizzaModel");

router.use(express.json());
router.use(
    express.urlencoded({
      extended: true,
    })
  );


router.get("/getAllPizzas", async (req, res) => {
  try {
    const pizza = await pizzaModel.find({});
    res.send(pizza);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/addpizza", async (req, res) => {
    const pizza = req.body.pizza
    try {
      const newPizza = new pizzaModel({
        name: pizza.name,
        image: pizza.image,
        varients: ["small", "medium", "larg"],
        description: pizza.description,
        category: pizza.category,
        prices: [pizza.prices],
      });
      await newPizza.save();
      res.status(201).send("New Pizza Added");
    } catch (error) {
      res.json({ message: error });
    }
  });

  router.post("/deletepizza", async (req, res) => {
    const pizzaId = req.body.pizzaId;
    try {
      await pizzaModel.findOneAndDelete({ _id: pizzaId });
      res.status(200).send("Pizza Deleted");
    } catch (error) {
      res.status(404).json({ message: error });
    }
  });
  
  


module.exports = router;
