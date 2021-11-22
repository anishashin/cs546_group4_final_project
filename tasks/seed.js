const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const foods = data.foods;
const savedPlates = data.savedPlates;
const comments = data.comments;

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    const anisha = await users.create('Anisha', 'Shin', 'anishashin', 'password1');
    const kushal = await users.create('Kushal', 'Patel', 'kushalpatel', 'password2');
    const lasya = await users.create('Lasya', 'Josyula', 'lasyajosyula', 'password3');
    const peixin = await users.create('Peixin', 'Dai', 'peixindai', 'password4');

    const pizza = await foods.create('Cheese Pizza', 1, 'medium slice', 'medium slices', 213, 7.8, 27, 9.1);
    const burger = await foods.create('Hamburger Patty', 3, 'oz', 'oz', 197, 12, 0, 21);
    const rice = await foods.create('White Rice', 1, 'cup', 'cups', 205, 0.4, 45, 4.3);
    const pasta = await foods.create('Rigatoni', 1, 'cup', 'cups', 160, 0.9, 31, 5.9);

    const meal1 = await savedPlates.create(anisha._id, "Anisha's Meal", [pasta._id], [2]);
    const meal2 = await savedPlates.create(kushal._id, "Kushal's Meal", [pizza._id, pasta._id], [3, 2]);
    const meal3 = await savedPlates.create(lasya._id, "Lasya's Meal", [burger._id, rice._id], [1, 2]);
    const meal4 = await savedPlates.create(peixin._id, "Peixin's Meal", [burger._id, pizza._id], [1, 2]);

    const comment1 = await comments.create(pasta._id, anisha._id, 'The pasta is delicious!');
    const comment2 = await comments.create(pizza._id, kushal._id, 'My favorite midnight snack!');
    const comment3 = await comments.create(burger._id, lasya._id, 'The burger could use a little more flavor...');
    const comment4 = await comments.create(pizza._id, peixin._id, 'Highly recommend the pizza!');

    console.log('Done seeding database');
    await db.serverConfig.close();
};

main().catch(console.log);