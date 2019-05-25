'use strict';

const User = require("../models").User;
const auth = require("basic-auth");
const bcryptjs = require("bcryptjs");

module.exports = (req,res,next) => {
	const credentials = auth(req);
	if(credentials){

		User.findOne({where:{emailAddress:credentials.name}})
			.then(user => {
				if(user){

					const pass = bcryptjs.compareSync(credentials.pass , user.password);
					if(pass){
						//authenticated
						req.authOkUser = user;
						next();

					}else{
						// pass did not match
						const err = new Error("wrong password");
						err.status = 401;
						next(err);

					}

				}else{
					// no user found 
					const err = new Error("No user found by provided emaill.");
					err.status = 401;
					next(err);

				}
			});

	}else{
		// something wrong with password
		const err = new Error("Check your credentials.");
		err.status = 401;
		next(err);
	}

};