const User = require('../models').User;
const express = require('express');
const router = express.Router();
const bcryptjs = require("bcryptjs");

// GET /api/users 200 - Returns the currently authenticated user
router.get('/', (req,res,next) => {
	User.findAll({
		attributes:{
			exclude:['password']
		}
	})
	.then(users => {
		if(users){
			res.json({
				users: users
			});
			res.status(200);
		}else{
			const err = new Error('No users');
			err.status =400;
			next(err);
		}
		
	})
	.catch(err=>{
		// res.status(500).send(err);
		res.status(500);
		next(err);
	});
});

// POST / api / users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/', (req,res,next) => {
	if (!req.body.firstName || !req.body.lastName || !req.body.emailAddress || !req.body.password) {
		const err = new Error("firstName, lastName, emailAddress and password are required to create a user.");
		err.status = 400;
		next(err);
	} 
	User.findOne({ where: { emailAddress: req.body.emailAddress}})
		.then(email => {
			if (email){
				res.json({ error: 'This email is already in use.' });
				res.status(400);
			}else{
				const newUserInfo = {
					firstName : req.body.firstName,
					lastName : req.body.lastName,
					emailAddress: req.body.emailAddress,
					// password : req.body.password,
				};

				// Hash password
				const salt = bcryptjs.genSaltSync(10);
				newUserInfo.password = bcryptjs.hashSync(req.body.password,salt);
				// create user
				User.create(newUserInfo)
					.then( user => {
						// res.json(user)
						res.location('/');
						res.status(201).end();
					})
					.catch( err => {
						if (err.name == "SequelizeValidationError"){
							err.message = "Please make sure that all fields are filled correctly.";
							err.status = 400;
						}else{
							err.status = 400;
						}
						next(err);
					});
				

			}
		})
		.catch(err => {
			if (err.name == "SequelizeValidationError") {
				err.message = "Please make sure that all fields are filled correctly.";
				err.status = 400;
			} else {
				err.status = 400;
			}
			next(err);
		});

});
module.exports = router;