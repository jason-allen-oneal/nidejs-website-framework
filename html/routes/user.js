var fs = require('fs');
var jwt = require('jsonwebtoken');

class UserRoutes {
	constructor(core, express){
		this.core = core;
		this.router = express.Router();
	}
	
	init(){
		this.router.post('/logout/', (req, res) => {
			global.User = {
				id: 0,
				email: '',
				joined: 0,
				admin: 0,
				token: ''
			};
			res.clearCookie('token');
			res.json({status: 'ok'});
		});
		
		this.router.get('/login/', (req, res) => {
			res.render('login', {
				layout: 'site',
				pageTitle: 'Login'
			});
		});

		this.router.get('/register/', (req, res) => {
			res.render('register', {
				layout: 'site',
				pageTitle: 'Register'
			});
		});

		this.router.get('/forgot-password/', (req, res) => {
			res.render('forgot-password', {
				layout: 'site',
				pageTitle: 'Forgot Password'
			});
		});

		this.router.get('/recover-account/', (req, res) => {
			var ref = req.params.ref;
			this.core.services.user.checkReset(ref, (result) => {
				if(result){
					res.render('password-reset', {
						layout: 'site',
						id: result.id,
						token: result.token,
						pageTitle: 'Password Reset'
					});
				}else{
				
				}
			});
		});
		
		this.router.get('/account/:slug*?', global.tokenAuth, (req, res) => {
		  var slug = req.params.slug,
		    u;
		  if(slug === undefined){
		    u = global.User;
		    
		    res.render('account', {
				  layout: 'site',
				  pageTitle: 'My Account',
				  user: u
			  });
		  }else{
		    this.core.services.user.getUserBySlug(slug).then((user) => {
		      u = user;
		      res.render('profile', {
				    layout: 'site',
				    pageTitle: 'User Profile',
				    user: u
			    });
		    });
		  }
		});
		
		this.router.get('/account/:slug*?', global.tokenAuth, (req, res) => {
		  var slug = req.params.slug,
		    u;
		  if(slug === undefined){
		    u = global.User;
		    
		    res.render('account', {
				  layout: 'site',
				  pageTitle: 'My Account',
				  user: u
			  });
		  }else{
		    this.core.services.user.getUserBySlug(slug).then((user) => {
		      u = user[0];
		      u.joined = this.core.getDate(u.joined);
		      
		      res.render('profile', {
				    layout: 'site',
				    pageTitle: 'User Profile',
				    user: u
			    });
		    });
		  }
		});
		
		this.router.post('/account/', this.core.avatarUpload.single('avatar'), global.tokenAuth, (req, res) => {
		  var d = req.body;
		  var file = req.file;
		  
		  let data = {
		    ...global.User,
		    ...d
		  };
		  
		  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
		    data.avatar = file.path.replace("assets", "");
		  }
		  
		  if(data.password === 'PASSWORD'){
		    delete data.password;
		  }
		  delete data.name;
		  delete data.name_clean;
		  
		  this.core.services.user.update(data, () => {
				this.core.services.user.getUser(data.id).then((u) => {
					global.User = u[0];
					
					res.render('account', {
				    layout: 'site',
				    pageTitle: 'User Profile',
				    user: u[0],
				    message: 'User data successfully updated!',
				    alert: 'success'
			    });
				});
			});
		});
		
		return this.router;
	}
}

module.exports = (core, express) => {
	var R = new UserRoutes(core, express);
	return R.init();
};