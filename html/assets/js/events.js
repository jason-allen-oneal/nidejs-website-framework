class Events {
  constructor(app){
    this.app = app;
    
    this.events();
    this.listeners();
  }
  
  events(){
    var _t = this;
		
		$(document).on('submit', '#registerForm', function(e){
			e.preventDefault();
			
			var username = $('#username').val(),
				password = $('#password').val();
			
			var data = {
				username: username,
				password: password
			};
			
			_t.app.socket.emit('user-login', data);
		});
		
		$(document).on('click', '#logout', function(e){
			e.preventDefault();
			
			_t.app.deleteCookie('token');
			_t.app.socket.emit('user-logout');
		});
		
		$(document).on('submit', '.form-register', function(e){
			e.preventDefault();
			alert('register')
			if(!_t.app.verified){
				_t.app.template.modal('register-error', 'Ooops!', 'You must complete the captcha!');
			}
			
			var regData = {
				name: $('#name').val(),
				email: $('#email').val(),
				password: $('#password').val()
			};
			
			_t.app.socket.emit('user-register', regData);
		});
		
		$(document).on('submit', '.form-recovery', function(e){
			e.preventDefault();
			
			var data = {
				name: $('#recoveryUsername').val(),
				email: $('#recoveryEmail').val(),
			};
			
			_t.app.socket.emit('user-forgot-password', data);
		});
		
		$(document).on('submit', '.form-passwordReset', function(e){
			e.preventDefault();
			
			var data = {
				password: $('#passwordResetPass').val(),
				confirm: $('#passwordResetConfirm').val(),
				id: $('#recoveryId').val(),
				token: $('#recoveryToken').val()
			};
			
			if(data.password !== data.confirm){
				_t.app.template.modal('resetError', 'Ooops!', 'Passwords do not match!');
				return;
			}
			
			_t.app.socket.emit('user-recover-account', data);
		});
		
		$(document).on('click', '.showHidePass', function(e){
		  e.preventDefault();
		  
		  _t.app.showHidePasswordField();
		});
	}
  
  listeners(){
    this.app.socket.on('user-login-response', (result) => {
      if(result.status === "ok"){
				this.app.setCookie('token', result.data.token);
				
				this.app.template.modal('login-success', 'Success!', 'You have successfully logged in!', () => {
					window.location = "/";
				});
			}else{
			  this.app.template.modal('login-error', 'Ooops!', result.message);
			}
    });
    
    this.app.socket.on('user-logout-response', (result) => {
      if(result.status === 'ok'){
				window.location = '/';
			}else{
				this.app.template.modal('logout-failed', 'Ooops!', 'Something went wrong!');
			}
    });
    
    this.app.socket.on('user-register-response', (result) => {
      window.location = `/user/register/success/`;
    });
    
    this.app.socket.on('user-forgot-password-response', (result) => {
      this.app.template.modal('forgotPass', 'Complete', result.msg);
    });
    
    this.app.socket.on('user-recover-account-response', (result) => {
      this.app.template.modal('recoverComplete', 'Complete', result.msg);
    });
  }
}

export { Events };