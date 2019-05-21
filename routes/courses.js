const Course = require('../models').Course;
const User = require('../models').User;
const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();

// GET / api / courses 200 - Returns a list of courses(including the user that owns each course)
router.get('/', (req,res) => {
	Course.findAll({
		include:[{
			model:User,
			where:{ id: Sequelize.col('course.userId') }
		}]
	})
	.then(courses => {
		// console.log(courses,'courses');
		if(courses){
			res.json({
				courses: courses
			});
			res.status(200);
		}else{
			const err = new Error('There is no courses founded in database');
			err.status(400);
			next(400);
		}
		
	})
	.catch(err => {
		res.send(500,err);
	});
});


// GET / api / courses /: id 200 - Returns a the course(including the user that owns the course) for the provided course ID
router.get('/:id',(req,res,next) => {
	console.log(req.body,'aiubliydbfusinb');
	Course.findByPk(req.params.id,{
		include:{
			model:User,
			where:{id:Sequelize.col('course.userId')}
		}
	})
	.then(course => {
		if(course){
			res.json({
				course:course
			});
			res.status(200);
		}else{
			//Send error
			const err = new Error('There is no course founded by provided id');
			err.status = 400;
			next(err);

		}
	})
	.catch(err => {
		res.send(500,err);
	});
});


// POST / api / courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
// PUT / api / courses /: id 204 - Updates a course and returns no content
// DELETE / api / courses /: id 204 - Deletes a course and returns no content


module.exports = router;