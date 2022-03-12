class Template{
	constructor(){
		Handlebars.registerHelper('ucfirst', function(str){
			if(str && typeof str === 'string'){
				return str[0].toUpperCase() + str.substring(1);
			}
			return '';
		});
	}
	
	modalClose(id){
		var modalEl = document.getElementById('modal-'+id);
		var modal = bootstrap.Modal.getInstance(modalEl);
		modal.hide();
	}
	
	modal(id, title, content, cb=null, size='modal-lg'){
		var html = '<div id="modal-'+id+'" class="modal" tabindex="-1"><div class="modal-dialog '+size+'"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">'+title+'</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">'+content+'</div></div></div></div>';
		$('body').append(html);
		var modal = new bootstrap.Modal($('#modal-'+id), {keyboard: false});
		
		modal.show();
		$(document).on('hidden.bs.modal', '#modal-'+id, function(e){
			$('#modal-'+id).remove();
			if(cb !== null){
				cb();
			}
		});
	}
	
	buildTemplate(data){
		var template = Handlebars.compile(data.html);
		return template(data.data);
	}
	
	buildModal(id, title, data){
		var template = Handlebars.compile(data.html);
		var html = template(data.data);
		
		this.modal(id, title, html);
	}
}

export { Template };