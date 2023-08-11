$.validator.setDefaults({

	// attributes
	//
	errorElement: 'label',

	//
	// overriden methods
	//

	errorPlacement: function(error, element) {
		if (element.parent('.input-group').length || element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
			error.insertAfter(element.parent());
		} else {
			error.insertAfter(element);
		}
	},

	highlight: function(element) {
		$(element).closest('.form-group').removeClass('success').addClass('error');
	},
	
	success: function(element) {
		$(element).closest('.form-group').removeClass('error').addClass('success');
	}
});