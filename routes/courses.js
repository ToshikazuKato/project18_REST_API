const Course = require('../models').Course;
const User = require('../models').User;
const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
const authUser = require("./login");

// GET / api / courses 200 - Returns a list of courses(including the user that owns each course)
router.get('/', (req,res) => {
	Course.findAll({
		include:[{
			model:User,
			where:{ id: Sequelize.col('course.userId') },
			attributes: {
				exclude: ['password','createdAt', 'updatedAt']
			}
		}],
		attributes: {
			exclude: ['createdAt', 'updatedAt']
		}
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
			err.status = 400;
			next(400);
		}
		
	})
	.catch(err => {
		res.status(500);
		next(err);
	});
});


// GET / api / courses /: id 200 - Returns a the course(including the user that owns the course) for the provided course ID
router.get('/:id',(req,res,next) => {
	console.log(req.body,'aiubliydbfusinb');
	Course.findByPk(req.params.id,{
		include:{
			model:User,
			where:{id:Sequelize.col('course.userId')},
			attributes: {
				exclude: ['createdAt', 'updatedAt','password']
			}
		},
		attributes: {
			exclude: ['createdAt', 'updatedAt']
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
		res.status(500);
		next(500);
	});
});


// POST / api / courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/', authUser ,(req,res, next)=>{
	if (!req.body.title || !req.body.description) {
		const err = new Error("Title and Description are required.");
		err.status = 400;
		next(err);
	} 
	Course.findOne({where:{title : req.body.title}})
	      .then(title => {
			  if(title){
				  //the same title already exists
				  res.json({error:'The same title already exists.'});
				  res.status(400);
			  }else{
				  //create
				  const newCourseInfo = {
					title : req.body.title,
					description : req.body.description,
					estimatedTime : req.body.estimatedTime,
					materialsNeeded : req.body.materialsNeeded,
					 // set userId? foreign key
				  	userId : req.authOkUser.id	
				  };
				
				 

				  Course.create(newCourseInfo)
				  		.then(course => {
							  console.log('Your course has been created.');
							//   res.json(course);
							  res.location(`/api//courses/${course.id}`);
							//   res.location(`/${course.id}`);
							  res.status(201).end();
						})
						.catch( err => {
							if(err.name == "SequelizeValidationError"){
								err.message = "Please make sure that all fields are filled correctly."
								err.status = 400;
							}else{
								err.status = 400;
							}
							next(err);
						})

			  }
		  })
		  .catch( err => {
			  res.status(500);
			  next(err);
		  })

});
// PUT / api / courses /: id 204 - Updates a course and returns no content
router.put('/:id', authUser ,(req,res,next)=> {
	
	if (!req.body.title || !req.body.description) {
		const err = new Error ("Title and Description are required.");
		err.status = 400;
	    next(err);
	} 
	Course.findByPk(req.body.id)	
		  .then(course => {
			  if(course){
				  //update
				  if (req.authOkUser.id === course.userId){
					  course.update(req.body);
					  res.status(204).end();
				  }else{
					  //err
					  const err = new Error("Course can not be updated becasue you don't own this course. ");
					  err.status = 403;
					  next(err);
				  }
				  
			  }else{
				  //err
				  const err = new Error("Course you want to update was not found");
				  err.status = 400;
				  next(err);
			  }
		  })
		  .catch(err => {
			  if (err.name == "SequelizeValidationError"){
				  err.message = "Please make sure that all fields are filled correctly."
				  err.status = 400;
			  }else{
				  err.status = 400;
			  }
			  next(err);

		  });

});

// DELETE / api / courses /: id 204 - Deletes a course and returns no content
router.delete('/:id',authUser ,(req,res,next)=> {
	Course.findByPk(req.params.id)
		  .then(course => {
			  if(course){
				
				  if (req.authOkUser.id === course.userId) {
					  course.destroy();
					  res.status(204).end();
				  } else {
					  //err
					  const err = new Error("You can only delete own your course.");
					  err.status = 403;
					  next(err);
				  }
				  
			  }else{
				  const err = new Error('No course found');
				  err.status = 400;
				  next(err);
			  }
		  })
		  .catch(err => {
			  err.status =400;
			  next(err);
		  });
});


module.exports = router;