var fs = require('fs');

class UserController {
  constructor(){}
  
  init(core, socket){
    socket.on('user-login', (input) => {
      
      var data = {
				username: input.username,
				password: input.password
			};
			
			core.services.user.login(data).then((result) => {
				if(result.status === "ok"){
					global.User = result.data;
				}
				
				socket.emit('user-login-response', result);
			});
    });
    
    socket.on('user-register', (input) => {
      var data = {
				username: input.username,
				email: input.email,
				password: input.password,
			};
			
			core.services.user.create(input).then((result) => {
				socket.emit('user-register-response', result);
			});
    });
    
    socket.on('user-logout', () => {
      global.User = {
				id: 0,
				name: 'Guest',
				email: '',
				joined: 0,
				admin: 0,
				token: '',
				verified: 0,
				fullname: '',
				subtype: 0
			};
			socket.emit('user-logout-response', {status: 'ok'});
    });
    
    socket.on('user-forgot-password', (input) => {
      var data = {
				username: input.username,
				email: input.email
			};
			
			this.core.services.user.recover(data).then((result) => {
				var msg;
				if(result){
					msg = 'An email has been sent to the email address on file, if it exists, with instructions on how to reset your password.';
				}else{
				  msg = 'An error has occurred. Please try again later.';
				}
				socker.emit('user-forgot-password-response', {msg: msg});
			});
    });
    
    socket.on('user-recover-account', (input) => {
      var data = {
				password: input.password,
				id: input.id,
				token: input.token
			};
			if(data.token === global.token){
				var decoded = jwt.verify(data.token, config.server.secret);
				if(decoded.id === data.id){
					this.core.services.user.resetPassword(data).then(() => {
						socket.emit('user-recover-account-response', {msg: 'Your password has been reset, and you may now login securely.'});
					});
				}else{
				  socket.emit('user-recover-account-response', {msg: 'Password recovery ID mismatch'});
				}
			}else{
				socket.emit('user-recover-account-response', {msg: 'Password recovery token mismatch'});
			}
    });
  }
}

module.exports = new UserController();