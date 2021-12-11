const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const foods = data.foods;
const savedPlates = data.savedPlates;
const comments = data.comments;

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    const admin = await users.create('Stevens', 'Dining', 'admin', 'password', true);
    const anisha = await users.create('Anisha', 'Shin', 'anishashin', 'password1', false);
    const kushal = await users.create('Kushal', 'Patel', 'kushalpatel', 'password2', false);
    const lasya = await users.create('Lasya', 'Josyula', 'lasyajosyula', 'password3', false);
    const peixin = await users.create('Peixin', 'Dai', 'peixindai', 'password4', false);

    const cheese_pizza = await foods.create('Cheese Pizza', 1, 'medium slice', 'medium slices', 213, 7.8, 27, 9.1);
    
    const rigatoni = await foods.create('Rigatoni', 1, 'cup', 'cups', 160, 0.9, 31, 5.9);

    const hamburger_patty = await foods.create('Hamburger Patty', 3, 'oz', 'oz', 197, 12, 0, 21);
    const hot_dog = await foods.create('Hot Dog', 1, 'frankfurter', 'frankfurters', 155, 14, 1.3, 5.6);
    const grilled_chicken = await foods.create('Grilled Chicken', 3, 'oz', 'oz', 126, 2.9, 0, 25);
    const chicken_nuggets = await foods.create('Chicken Nuggets', 5, 'piece', 'pieces', 245, 16.5, 12, 12.5);
    const tater_tots = await foods.create('Tater Tots', 10, 'tot', 'tots', 161, 7.6, 23, 1.8);
    
    const white_rice = await foods.create('White Rice', 1, 'cup', 'cups', 205, 0.4, 45, 4.3);
    const brown_rice = await foods.create('Brown Rice', 1, 'cup', 'cups', 218, 1.6, 46, 4.6);

    const meal1 = await savedPlates.create(anisha._id, "Anisha's Meal", [rigatoni._id], [2]);
    const meal2 = await savedPlates.create(kushal._id, "Kushal's Meal", [cheese_pizza._id, rigatoni._id], [3, 2]);
    const meal3 = await savedPlates.create(lasya._id, "Lasya's Meal", [hamburger_patty._id, white_rice._id], [1, 2]);
    const meal4 = await savedPlates.create(peixin._id, "Peixin's Meal", [hamburger_patty._id, cheese_pizza._id], [1, 2]);
    const meal5 = await savedPlates.create(kushal._id, "Cheat Meal", [cheese_pizza._id, chicken_nuggets._id, tater_tots._id], [4, 4, 3]);

    const comment1 = await comments.create(rigatoni._id, anisha._id, 'The pasta is delicious!');
    const comment2 = await comments.create(cheese_pizza._id, kushal._id, 'My favorite midnight snack!');
    const comment3 = await comments.create(hamburger_patty._id, lasya._id, 'The burger could use a little more flavor...');
    const comment4 = await comments.create(cheese_pizza._id, peixin._id, 'Highly recommend the pizza!');

    console.log('Done seeding database');
    await db.serverConfig.close();
};

main().catch(console.log);