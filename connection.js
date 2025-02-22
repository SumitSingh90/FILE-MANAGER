const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'sumit@rot', // Add your MySQL root password here
    database: 'documents'  // Replace with your database name
});

module.exports= connection;
