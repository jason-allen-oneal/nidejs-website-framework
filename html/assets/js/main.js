import { Application } from './application.js';

class Main {
	constructor(base){
		this.app = new Application(base);
	}
	
	init(){
	  var loc = window.location.href;
	  if(/login/.test(loc)){
		  $('.nav-login').siblings().removeClass('active');
		  $('.nav-login').addClass('active');
	  }else if(/register/.test(loc)){
		  $('.nav-register').siblings().removeClass('active');
		  $('.nav-register').addClass('active');
	  }else if(/logout/.test(loc)){
		  $('.nav-logout').siblings().removeClass('active');
		  $('.nav-logout').addClass('active');
	  }else{
		  $('.nav-home').siblings().removeClass('active');
		  $('.nav-home').addClass('active');
	  }
	  
	  window.addEventListener('DOMContentLoaded', (event) => {
	    
   });
	}
}

export { Main };