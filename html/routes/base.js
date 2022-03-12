const fs = require('fs');

class BaseRoutes {
	constructor(core, express){
		this.core = core;
		this.router = express.Router();
	}
	
	init(){
		this.router.get('/', (req, res) => {
			res.render('home', {
				layout: 'site',
				pageTitle: 'Home',
			});
		});
		return this.router;
	}
}

module.exports = (core, express) => {
	var BR = new BaseRoutes(core, express);
	return BR.init();
};