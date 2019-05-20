'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const sequelize = require('./models').sequelize;


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup request body JSON
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here
const routes = require('./routes/index');
app.use('/api', routes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);


// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

//Test connection and start listening on our port
sequelize.
	authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
		return sequelize.sync();
	})
	.then(() => {
		app.listen(app.get('port'), () => {
			console.log(`Express server is listening on port ${app.get('port')}`);
		});
	});
