import { Template } from './template.js';
import { Events } from './events.js';
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

class Application{
	constructor(base){
		this.base = base;
		this.template = new Template();
		this.socket = io();
		this.events = new Events(this);
	}
	
	showHidePasswordField(){
	  var x = document.getElementById("password");
	  
    var showEye = $("#show");
    var hideEye = $("#hide");
    
    if(x.type === "password"){
      x.type = "text";
      hideEye.removeClass('d-none');
      showEye.addClass('d-none');
    }else{
      x.type = "password";
      hideEye.addClass('d-none');
      showEye.removeClass('d-none');
    }
	}
	
	setCookie(name, value) {
    const d = new Date();
    d.setTime(d.getTime() + (24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  deleteCookie(name){
    document.cookie = name+'=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  
  getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++){
      let c = ca[i];
      while(c.charAt(0) == ' '){
        c = c.substring(1);
      }
      if(c.indexOf(name) == 0){
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  checkCookie(name){
    let cookie = this.getCookie(name);
    if(cookie != ""){
     return true;
    }
    return false;
  }
}

export { Application };