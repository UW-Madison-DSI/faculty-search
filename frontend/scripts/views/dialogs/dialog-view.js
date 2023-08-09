/******************************************************************************\
|                                                                              |
|                                 dialog-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an base class for displaying modal dialogs.              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import Positioning from '../../views/dialogs/behaviors/positioning.js';
import Dragging from '../../views/dialogs/behaviors/dragging.js';
import Resizing from '../../views/dialogs/behaviors/resizing.js';
import Browser from '../../utilities/web/browser.js';
import '../../utilities/scripting/array-utils.js';
import '../../../vendor/bootstrap/js/modal.js';

export default BaseView.extend(_.extend(Positioning, Dragging, Resizing, {

	//
	// attributes
	//

	className: 'focused modal',
	size: undefined,

	Template: `
		<div class="modal-dialog">
			<div class="modal-content">
				<%= content %>
			</div>
		</div>
	`,

	// flags
	//
	modal: true,
	draggable: true,
	resizable: false,

	attributes: {
		'role': 'dialog',

		// prevents dialogs from closing with a
		// click outside of the dialog bounds
		//
		'data-backdrop': 'static'
	},

	events: {
		'dblclick .modal-header .handle': 'onDoubleClickHandle',
		'keydown': 'onKeyDown'
	},

	//
	// setting metods
	//

	setIcon: function(icon) {
		this.$el.find('.modal-title i').attr('class', icon);
	},

	setTitle: function(title) {
		this.$el.find('.modal-title h1').text(title);
	},

	//
	// show / hide methods
	//

	show: function() {

		// render to DOM
		//
		$('body').append(this.render());

		// trigger plug-in
		//
		this.$el.modal({
			show: true,
			keyboard: false,
			backdrop: false
		});
	},

	hide: function() {

		// trigger plug-in
		//
		this.$el.modal('hide');
	},

	//
	// open / close methods
	//

	open: function(options) {
		this.$el.addClass('opening');

		// center vertically
		//
		this.$el.css('display', 'flex');

		// focus when opened
		//
		window.setTimeout(() => {
			this.$el.removeClass('opening');
			this.focus();

			// perform callback
			//
			if (options && options.done) {
				options.done();
			}
		}, this.constructor.transitionDuration);
	},

	close: function(options) {
		this.$el.addClass('closing');

		window.setTimeout(() => {
			this.destroy();

			// perform callback
			//
			if (options && options.done) {
				options.done();
			}
		}, this.constructor.transitionDuration - 100);
	},

	isClosing: function() {
		return this.$el.hasClass('closing');
	},

	//
	// focusing methods
	//

	focus: function() {
		this.$el.find('.modal-dialog').addClass('focused');
	},

	blur: function() {
		this.$el.find('.modal-dialog').removeClass('focused');
	},

	isFocused: function() {
		return this.$el.find('.modal-dialog').hasClass('focused');
	},

	//
	// rendering methods
	//

	getTemplate: function() {
		let data = this.templateContext? this.templateContext() : {};
		return _.template(this.Template.replace('<%= content %>', this.template(data)));
	},

	render: function() {

		// call superclass method
		//
		let element = BaseView.prototype.render.call(this);

		// add buttons
		//
		if (this.buttons) {
			this.$el.find('.modal-header').prepend(this.buttons().render().$el);
		}

		// enable window features
		//
		if (this.draggable && !Browser.is_mobile) {
			this.enableDrag();
		}
		if (this.resizable && !Browser.is_mobile) {
			this.enableResize();
		}

		// set window size
		//
		if (this.options.width) {
			this.$el.find('.modal-dialog').css('width', this.options.width + 'px');
		}
		if (this.options.height) {
			this.$el.find('.modal-dialog').css('height', this.options.height + 'px');
		}

		// set up callbacks
		//
		this.$el.on('show.bs.modal', (event) => {
			this.onShow(event);
		});
		this.$el.on('hide.bs.modal', (event) => {
			this.onHide(event);
		});

		// add modal extents wrapping div
		//
		if (this.maxHeight || this.options.maxHeight) {
			this.$el.find('.modal-dialog').wrap($('<div class="modal-extents">').css({
				'min-height': this.maxHeight || this.options.maxHeight
			}));
		}

		return element;
	},

	//
	// event handling methods
	//

	onShow: function() {

		// blur parent
		//
		if (this.opener && this.opener.blur) {
			this.opener.blur();
		}

		// notify child views
		//
		let regionNames = Object.keys(this.regions);
		for (let i = 0; i < regionNames.length; i++) {
			let childView = this.getChildView(regionNames[i]);
			if (childView && childView.onShow) {
				childView.onShow();
			}
		}

		// perform opening animation
		//
		this.open({

			// callbcks
			//
			done: () => {
				this.onShown();
			}
		});
	},

	onShown: function() {

		// show backdrop
		//
		if (this.modal) {
			this.$el.addClass('backdrop');
		}
		
		// focus form
		//
		if (this.hasChildView('form')) {
			this.getChildView('form').focus();
		}

		// perform callback
		//
		if (this.options.onShown) {
			this.options.onShown();
		}
	},

	onHide: function(event) {

		// undo bootstrap adjustments
		//
		$('body').removeClass('modal-open');
		$('body').css('padding-left', '');
		$('body').css('padding-right', '');
		
		this.close({

			// callbacks
			//
			done: () => {
				this.onHidden();
			}
		});

		// prevent further handling of event
		//
		event.preventDefault();
		event.stopPropagation();
	},

	onHidden: function() {
		this.destroy();

		// perform callback
		//
		if (this.options.onHidden) {
			this.options.onHidden();
		}
	},

	//
	// mouse event handling methods
	//

	onDoubleClickHandle: function() {
		this.resetPosition();
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {

		// delegate key events to modal content
		//
		let view = this.getChildView('content');
		if (view && view.onKeyDown) {
			view.onKeyDown(event);
		}
	},

	//
	// cleanup methods
	//

	onBeforeDestroy: function() {
		this.$el.remove();
		$('body').removeClass('modal-open');

		// remove backdrops
		//
		$('.modal-backdrop').remove();
	}
}), {

	//
	// static attributes
	//

	transitionDuration: 300
});
