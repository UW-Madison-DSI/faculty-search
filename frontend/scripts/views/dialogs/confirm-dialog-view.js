/******************************************************************************\
|                                                                              |
|                            confirm-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a confirmation modal dialog box that is used to          |
|        prompt the user for confirmation to proceed with some action.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../views/dialogs/dialog-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	className: 'focused modal confirm-dialog',

	template: _.template(`
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<% if (icon) { %>
				<i class="<%= icon %>"></i>
				<% } else { %>
				<i class="fa fa-question-circle"></i>
				<% } %>
				<% if (title) { %>
				<%= title %>
				<% } else { %>
				Confirm
				<% } %>
			</h1>
		</div>
		
		<div class="modal-body">
			<i class="alert-icon fa fa-3x fa-question-circle" style="float:left; margin-left:10px; margin-right:20px"></i>
			<p><%= message %></p>
		</div>
		
		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>
				<% if (ok) { %><%= ok %><% } else { %>OK<% } %>
			</button>
			<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>
				<% if (cancel) { %><%= cancel %><% } else { %>Cancel<% } %>
			</button> 
		</div>
	`),

	events: {
		'click #ok': 'onClickOk',
		'click #cancel': 'onClickCancel',
		'keydown': 'onKeyDown'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			icon: this.options.icon,
			title: this.options.title,
			message: this.options.message,
			ok: this.options.ok,
			cancel: this.options.cancel
		};
	},

	//
	// mouse event handling methods
	//

	onClickOk: function() {
		if (this.options.accept) {
			return this.options.accept();
		}
	},

	onClickCancel: function() {

		// perform callback
		//
		if (this.options.reject) {
			this.options.reject();
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
