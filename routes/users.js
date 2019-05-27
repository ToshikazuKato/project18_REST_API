const User = require('../models').User;
const express = require('express');
const router = express.Router();
const bcryptjs = require("bcryptjs");
const authUser = require("./login");

// GET /api/users 200 - Returns the currently authenticated user
router.get('/', authUser ,(req,res) => {
	User.findOne({
		where:{id:req.authOkUser.id},
		attributes:{
			exclude: ['password', 'createdAt','updatedAt']
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
			// next(err);
			res.send(err);
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
	const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if(!emailRegex.test(req.body.emailAddress)){
		const err = new Error("emailAddress is not valid.");
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