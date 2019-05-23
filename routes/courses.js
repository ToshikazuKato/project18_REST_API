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
			err.status = 400;
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
router.post('/', (req,res, next)=>{

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
					materialsNeeded : req.body.materialsNeeded
				  };
				
				  // set userId? foreign key
				  newCourseInfo.userId = 2;

				  Course.create(newCourseInfo)
				  		.then(course => {
							  console.log('Your course has been created.');
							//   res.json(course);
							  res.location(`/courses/${course.id}`);
							//   res.location(`/${course.id}`);
							  res.status(201).end();
						})
						.catch( err => {
							if(err.name == "SequelizeValidationError"){
								err.message = "Please make sure that all fields are filled correctly."
								err.status = 400;
							}else{
								err.status = 400;
								next(err);
							}
						})

			  }
		  })
		  .catch( err => {
			  res.send(500,err);
		  })

});
// PUT / api / courses /: id 204 - Updates a course and returns no content
router.put('/:id', (req,res,next)=> {
	Course.findByPk(req.params.id)
		  .then(course => {
			  if(course){
				  //update
				  course.update(req.body);
				  res.status(204).end();
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
				  next(err);
			  }
		  });

});

// DELETE / api / courses /: id 204 - Deletes a course and returns no content
router.delete('/:id', (req,res,next)=> {
	Course.findByPk(req.params.id)
		  .then(course => {
			  if(course){
				  course.destroy();
				  res.status(204).end();
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