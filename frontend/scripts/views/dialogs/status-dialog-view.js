/******************************************************************************\
|                                                                              |
|                             status-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an notification dialog that is used to show a            |
|        modal notify / alert dialog box.                                      |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../views/dialogs/dialog-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	className: 'focused modal status-dialog',

	template: _.template(`
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<% if (icon) { %>
				<i class="<%= icon %>"></i>
				<% } else { %>
				<i class="fa fa-info-circle"></i>
				<% } %>
				<% if (title) { %>
				<%= title %>
				<% } else { %>
				Notification
				<% } %>
			</h1>
		</div>
		
		<div class="modal-body">
			<p class="status-message"><%= message %></p>
		</div>
		
		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
		</div>
	`),

	events: {
		'click #ok': 'onClickOk',
		'keydown': 'onKeyDown'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			title: this.options.title,
			icon: this.options.icon,
			message: this.options.message
		};
	},

	//
	// mouse event handling methods
	//

	onClickOk: function() {

		// perform callback
		//
		if (this.options.accept) {
			this.options.accept();
		}
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {

		// respond to enter key press
		//
		if (event.keyCode === 13) {

			// close modal dialog
			//
			this.dialog.hide();

			// perform callback
			//
			this.onClickOk();
		}
	}
});