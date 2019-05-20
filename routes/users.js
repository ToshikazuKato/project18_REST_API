const User = require('../models').User;
const express = require('express');
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user
router.get('/', (req,res) => {
	User.findAll()
		.then(users => {
			console.log(users);
			res.json({
				users:users
			});
		})
	// res.json({
	// 	id : req.currentUser.id,
	// 	firstNmae : req.currentUser.firstName,
	// 	lastName : req.currentUser.lastName,
	// 	emailAddress: req.currentUser.emailAddress
	// });
	res.status(200);
});

// POST / api / users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/', (req,res) => {
	console.log(req.body);
	User.findOne({ where: { emailAddress: req.body.emailAddress}})
		.then(email => {
			console.log(email);
			if (email){
				res.json({ error: 'This email is already in use.' });
				res.status(400);
			}else{
				const newUserInfo = {
					firstName : req.body.firstName,
					lastName : req.body.lastName,
					emailAddress: req.body.emailAddress,
					password : req.body.password,
				};

				// Hash password

				// create user
				User.create(newUserInfo)
					.then( (user) => {
						// res.json(user)
						res.status(201).end();
					})
					.catch( err => {
						if (err.name == "SequelizeValidationError"){
							err.message = "Please make sure that all fields are filled correctly.";
							err.status(400);
						}else{
							err.status(400);
							next(err);
						}
					});

			}
		})

});
module.exports = router;