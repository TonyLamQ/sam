const dbConn = require('../../database/dbConnection')
const database = require('../../database/inmemdb')
const assert = require('assert');
// const { router } = require('../..');

let controller = {
        ValidateUser:(req, res, next)=>{
          const emailRegex = RegExp(
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
          );
          const passwordRegex = RegExp(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
          );
            let user = req.body;
            let{firstName, lastName, street, city, password, emailAdress} = user;
            try{
                assert(typeof firstName === 'string', 'firstName is not found or must be a string');
                assert(typeof lastName === 'string', 'lastName is not found or must be a string');
                assert(typeof street === 'string', 'street is not found or must be a string');
                assert(typeof city === 'string', 'city is not found or must be a string');
                assert(typeof password === 'string', 'password is not found or must be a string');
                assert(typeof emailAdress === 'string', 'emailAdress is not found or must be a string');
                assert(emailRegex.test(emailAdress));
                assert(passwordRegex.test(password));
                next();
            } 
            catch(err) {
                const error = {
                    status: 400,
                    results: err.message,
                };
                next(error);
            }
        },
    addUser:(req, res, next) => {

      dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        // Use the connection
        const firstName = req.body.firstName;
        const lastname = req.body.lastName;
        const emailAddress = req.body.emailAdress;
        const password = req.body.password;
        const street = req.body.street;
        const city = req.body.city;
        connection.query(`INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES ('${firstName}','${lastname}','${emailAddress}','${password}','${street}','${city}')`, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
         // Handle error after the release.
          if (error) {
            const error = {
              status: 409,
              results: `The email: '${emailAddress}' already exists`,           
           }
           next(error);
          } else {
       
          // Don't use the connection here, it has been returned to the pool.
          const id = results.insertId
          console.log("Results = ", results.affectedRows);
          
            const result = { 
              id,
              ...req.body
            }

          if (results.affectedRows == 1){
            res.status(201).json({
              status: 201,
              results: result,
            })
          } else {                   
            const error = {
                status: 404,
                results: `User could not be created.`,           
          }
          next(error);
        }}
          
          
        });
      });
    },

    getAllUsers:(req,res)=>{  

      let { name, isActive } = req.query
      let queryString = `SELECT * FROM user`
      if (name || isActive) {
          queryString += ` WHERE `
          if (name) {
            name = `%` + name + `%`
            queryString += `firstName LIKE '${name}'`
              
          }
          if (name && isActive) queryString += ` AND `
          if (isActive) {
              queryString += `isActive = ${isActive}`
          }
      }
      queryString += `;`
      console.log(queryString)
      dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        // Use the connection
        connection.query(queryString, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
       
          // Handle error after the release.
          if (error) throw error;
       
          // Don't use the connection here, it has been returned to the pool.
          console.log("Results = ", results.length);
          res.status(200).json({
            status: 200,
            results: results
          })
    
          // pool.end((err) => {
          //   console.log("pool was closed.");
          //   });
          
        });
      });
    },

    getUserProfile:(req,res)=>{  
      dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        const userId = Number(req.userId)
        // Use the connection
        connection.query(`SELECT * FROM user WHERE id = ${userId}`, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
       
          // Handle error after the release.
          if (error) throw error;
       
          // Don't use the connection here, it has been returned to the pool.
          console.log("Results = ", results.length);
          if (results.length == 1){
            res.status(200).json({
              status: 200,
              results: results
            })
          } else {                   
            const error = {
                status: 404,
                results: `User with ID ${userId} not found.`,           
          }
          next(error);
        }

    
          // pool.end((err) => {
          //   console.log("pool was closed.");
          //   });
          
        });
      });
    },

    getUserById:(req,res, next)=>{
      dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        const userId = Number(req.params.userId)
        // Use the connection
        connection.query(`SELECT * FROM user WHERE id = ${userId}`, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
       
          // Handle error after the release.
          if (error) throw error;
       
          // Don't use the connection here, it has been returned to the pool.
          console.log("Results = ", results.length);
          if (results.length == 1){
            res.status(200).json({
              status: 200,
              results: results
            })
          } else {                   
            const error = {
                status: 404,
                results: `User with ID ${userId} not found.`,           
          }
          next(error);
        }

    
          // pool.end((err) => {
          //   console.log("pool was closed.");
          //   });
          
        });
      });
    },

    deleteUser:(req,res, next)=>{
       dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        // Use the connection
        const userId = Number(req.params.userId);


        connection.query(`SELECT * FROM user WHERE id = '${userId}' `, function (error, results, fields) {

        connection.release();    
        if (error) throw error;
        console.log(results.length)
        if(results.length == 0){
          const error = {
              status: 404,
              results: `User with ID ${userId} not found.`,           
        }
        next(error);
        } else {
          if(req.userId == userId){
            connection.query(`DELETE FROM user WHERE id = ${userId}`, function (error2, results2, fields) {
              // When done with the connection, release it.
              connection.release();
           
              // Handle error after the release.
              if (error2) {
                const error = {
                  status: 400,
                  results: `U have to delete your meals first`,           
            }
            next(error);
              }
           
              // Don't use the connection here, it has been returned to the pool.
              console.log("Results = ", results2.affectedRows);
    
              if (results2.affectedRows == 1){
                res.status(200).json({
                  status: 200,
                  results: `User with ID ${userId} has been deleted.`,
                })
              } else {                   
                const error = {
                    status: 400,
                    results: `User with ID ${userId} not found.`,           
              }
              next(error);
            }
              
            });
          } else {
            const error = {
              status: 400,
              results: `This user can only deleted by a user with id: `+userId + ` Current userId: ${req.userId}`,           
        }
        next(error);
          }
        }
        });
      });
    },

    updateUser:(req,res, next)=>{
      dbConn.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
       
        // Use the connection
        const id = Number(req.params.userId);
        const firstName = req.body.firstName;
        const lastname = req.body.lastName;
        const emailAddress = req.body.emailAdress;
        const password = req.body.password;
        const street = req.body.street;
        const city = req.body.city;
        connection.query(`UPDATE user SET firstName= '${firstName}', lastName= '${lastname}', emailAdress= '${emailAddress}', password= '${password}', street= '${street}', city= '${city}' WHERE id = '${id}'`, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
       
          // Handle error after the release.
          if (error) {
            const error = {
              status: 404,
              results: `The email: '${emailAddress}' already exists`,           
           }
           next(error);
          } else {
       
          // Don't use the connection here, it has been returned to the pool.

          console.log("Results = ", results.affectedRows);
          const result = { 
            id,
            ...req.body
          }
          if (results.affectedRows == 1){
            res.status(200).json({
              status: 200,
              results: result,
            })
          } else {                   
            const error = {
                status: 400,
                results: `User with ID ${id} not found.`,           
          }
          next(error);
        }}
          
        });
      });
    },

};

module.exports = controller;