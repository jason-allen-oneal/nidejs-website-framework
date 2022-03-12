const fs = require('fs');

class Tpl {
  constructor(core){
		this.core = core;
  }

  format(str, args){
    return str.replace(/\{\{|\}\}|\{(\d+)\}/g, function(m, n){
      if(m == "{{") return "{";
      if(m == "}}") return "}";
      return args[n];
    });
  }
}

module.exports = (core) => {
	return new Tpl(core);
};