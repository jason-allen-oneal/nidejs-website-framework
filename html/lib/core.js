const jwt = require('jsonwebtoken');
const moment = require('moment');
const multer = require('multer');

class Core {
	constructor(){
		this.db = require('./db');
		this.allowedAvatarMimes = ["image/png", "image/jpg", "image/jpeg", "image/bmp", "image/gif"];
	}
	
	async initialize(){
	 this.config = await this.getConfig();
	 
	 this.avatarUpload = multer({
		  dest: 'assets/images/avatars/',
		  fileFilter: (req, file, cb) => {
        if(_t.allowedAvatarMimes.includes(file.mimetype)){
          cb(null, true);
        }else{
          cb(null, false);
          return cb(new Error('File format not allowed!'));
        }
      }
		});
	  
		this.services = {
			user: require('./services/user')(this),
			tpl: require('./tpl')(this),
		};
		
		return this;
	}
	
	getConfig(){
	  var _t = this, config = {};
	  
	  return new Promise(function(resolve, reject){
	    var query = "SELECT * FROM config";
	    _t.db.query(query).then((results) => {
	      for(var i = 0; i < results.length; i++){
	        config[results[i].name] = results[i].value;
	      }
	      resolve(config);
	    });
	  });
	}
	
	updateConfig(name, value){
	  var query = 'UPDATE config SET value = "'+value+'" WHERE name = "'+name+'"';
	  return this.db.query(query);
	}
	
	setApp(app, callback){
		this.app = app;
		callback();
	}
	
	isNumeric(str){
    	if (typeof str != "string") return false;
    	return !isNaN(str) && isNaN(parseInt(str));
    }
	
	normalize(str){
		str = str.replace(/^\s+|\s+$/g, '');
		str = str.toLowerCase();
		
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		
		for(var i = 0, l = from.length ; i < l ; i++){
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
		
		str = str.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
		
		return str;
	}
	
	normalizeName(str){
		str = str.replace(/^\s+|\s+$/g, '');
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		
		for(var i = 0, l = from.length ; i < l ; i++){
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
		str = str.replace(/[^a-zA-Z0-9 -]/g, '');
		
		return str;
	}
	
	getEpochTime(){
	  return moment().unix();
	}
	
	getDate(time){
		return moment(time).format('MMMM Do YYYY, h:mm:ss a');
	}
	
	getShortDate(time){
    return moment(time).format("MMM Do 'YY, h:mm a");
	}
	
  getTimeSince(date){
    return moment(date*1000).fromNow();
  }
}

module.exports = new Core();
