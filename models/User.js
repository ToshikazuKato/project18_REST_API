'use strict';

module.exports = (sequelize, DataTypes) => {
	
	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey:true,
			autoIncrement: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				notEmpty:{
					msg: "Please enter a first name"
				}
			},
			isAlpha: true,
			len: [2 - 20]
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "Please enter a last name"
				},
				isAlpha: true,
				len: [2 - 20]
			}
		},
		emailAddress: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isEmail:true,
				notEmpty:{
					msg:"Please enter a valid email address."
				}
			}
		},
		password: {
			type:DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "Please enter your password" 
				}
			}
		}

	});

	User.associate = (models) => {
		User.hasMany(models.Course, { foreignKey: 'userId'})
	};
	return User;
};
