const bcrypt = require('bcrypt'),
	jwt = require('jsonwebtoken');

class UserService {
	constructor(core){
		this.core = core;
	}
	
	async create(data){
		var _t = this;
		
		return new Promise(function(resolve, reject){
			var json;
			var query1 = `SELECT id FROM users WHERE email = "${data.email}"`;
			_t.core.db.query(query1).then((result) => {
				if(Array.isArray(result) && result.length){
					json = {
						status: 'error',
						message: 'You have already registered an account.'
					};
					reject(json);
				}else{
					bcrypt.hash(data.password, 10).then(function(hash){
					  data.password = hash;
						data.joined = _t.core.getEpochTime();
						data.admin = data.admin || 0;
						
						var query2 = `INSERT INTO users SET name = "${data.name}", email = "${data.email}", password = "${data.password}", joined = ${data.joined}, admin = ${data.admin}`;
						return _t.core.db.query(query2);
					}).then((results) => {
						data.id = results.insertId;
						data.token = jwt.sign(data, _t.core.config.secret, { expiresIn: 60*60 });
						
						return _t.update(data);
					}).then(() => {
						return _t.get(data.id);
					}).then((u) => {
						global.User = u;
						resolve({
						  status: 'ok',
						  data: u
						});
					}).catch((err) => {
					  console.log(err);
						json = {
							status: 'error',
							message: err
						};
						reject(json);
					});
				}
			}).catch((err) => {
			  console.log(err);
				json = {
					status: 'error',
					message: err
				};
				reject(json);
			});
		});
	}
	
	async update(obj){
		var json, _t = this;
		return new Promise(function(resolve, reject){
			if(typeof obj !== 'object'){
				json = {
					status: 'error',
					message: 'User update error'
				};
				resolve(json);
			}else{
				var query = `UPDATE users SET `;
				
				var i = 1;
				
				for(const [key, value] of Object.entries(obj)){
					query += key+' = ';
					if(!_t.core.isNumeric(value)){
						query += '"'+value+'"';
					}else{
						query += parseInt(value);
					}
					
					if(i < Object.keys(obj).length){
						query += ', '
					}
					
					i++;
				}
				
				query += ' WHERE id = '+obj.id;
				_t.core.db.query(query).then((results) => {
					resolve();
				}).catch((err) => {
					json = {
						status: 'error',
						message: err
					};
					reject(json);
				});
			}
		});
    }
    
    async get(id){
    	var json, _t = this;
    	
		  return new Promise(function(resolve, reject){
			  var query = `SELECT * FROM users WHERE id = ${id}`;
			  _t.core.db.query(query).then((results) => {
				  var obj = {
					  id: results[0].id,
					  email: results[0].email,
				  	joined: results[0].joined,
			  		admin: results[0].admin,
					  token: results[0].token,
				  	avatar: results[0].avatar
				  };
				  resolve(obj);
		  	}).catch((err) => {
				  json = {
					  status: 'error',
					  message: err
				  };
				  reject(err);
			  });
		  });
    }

	async login(data){
		var json, _t = this;
		
		return new Promise(function(resolve, reject){
			var query = `SELECT * FROM users WHERE name = "${data.username}"`;
			_t.core.db.query(query).then((results) => {
				if(results.length){
					bcrypt.compare(data.password, results[0].password).then(function(result) {
						if(result){
							var u = {
								id: parseInt(results[0].id),
								email: results[0].email,
								joined: parseInt(results[0].joined),
								admin: parseInt(results[0].admin)
							};
							
							u.token = jwt.sign(u, _t.core.config.secret, { expiresIn: 60*60 });
							_t.update(u).then(() => {
								resolve({
									status: "ok",
									data: u
								});
							});
						}else{
							json = {
								status: 'error',
								message: 'Incorrect email or password.'
							};
							resolve(json);
						}
					});
				}else{
					json = {
						status: 'error',
						message: 'No user found.'
					};
					resolve(json);
				}
			}).catch((err) => {
				json = {
					status: 'error',
					message: err
				};
				resolve(json);
			});
		});
	}
	
	recover(data, callback){
		var query = `SELECT * FROM users WHERE email = "${data.email}"`;
		this.core.db.query(query).then((results) => {
			if(results.length){
				if(results[0].name === data.name){
					var rand = Math.random().toString(36).substr(2,9);
					var recoveryURL = this.core.config.server.protocol+'://'+this.core.config.server.name+'/user/recover-account/?ref='+rand;
					
					this.update(results[0].id, {recovery: rand}, (res) => {
						//send the mail
					});
				}
			}
		}).catch((err) => {
			global.logger.error(err);
		});
	}
	
	checkReset(ref, callback){
		var query = `SELECT id FROM users WHERE recovery = "${ref}"`;
		this.core.db.query(query).then((results) => {
			if(results.length){
				global.resetToken = jwt.sign(u, results[0].id, { expiresIn: 60*60 });
				
				var data = {
					id: results[0].id,
					token: global.resetToken
				};
				callback(data);
			}else{
				callback(false);
			}
		}).catch((err) => {
			global.logger.error(err);
		});
	}
    
    resetPassword(data, callback){
    	bcrypt.hash(data.password, 10, (err, hash) => {
    		if(err) global.logger.error(err);
    		
    		this.update(data.id, {password: hash}, () => {
    			callback();
    		});
    	});
    }
}

module.exports = (core) => {
	return new UserService(core);
};