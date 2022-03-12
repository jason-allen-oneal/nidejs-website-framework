const mysql = require('mysql2');
require('dotenv').config();

class Database {
  constructor(){
    this.pool  = mysql.createPool({
      host            : '127.0.0.1',
      user            : process.env.DB_USER,
      password        : process.env.DB_PASS,
      database        : process.env.DB_NAME,
      port            : process.env.DB_PORT
    });
  }
  
  query(sql){
    var _t = this;
    return new Promise((resolve, reject) => {
      _t.pool.query(sql, (error, results) => {
        if(error){
          return reject(error);
        }else{
          resolve(results);
        }
      });
    });
  }
  
  close(){
    return new Promise((resolve, reject) => {
      _t.pool.end(err => {
        if(err) return reject(err);
        
        resolve();
      });
    });
  }
  
  escape(str){
    return this.pool.escape(str);
  }
}

module.exports = new Database();