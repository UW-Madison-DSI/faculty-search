/******************************************************************************\
|                                                                              |
|                              collection-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a base class for creating collection views.              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Boundable from '../../views/behaviors/layout/boundable.js';
import Hideable from '../../views/behaviors/layout/hideable.js';
import TooltipShowable from '../../views/behaviors/tips/tooltip-showable.js';

export default Marionette.CollectionView.extend(_.extend({}, Boundable, Hideable, TooltipShowable, {

	//
	// constructor
	//

	initialize: function(options) {

		// set attributes
		//
		if (this.options.emptyView) {
			this.emptyView = this.options.emptyView;
		}
		if (this.options.viewFilter) {
			this.viewFilter = this.options.viewFilter;
		}

		// call superclass constructor
		//
		Marionette.CollectionView.prototype.initialize.call(this, options);
	},

	//
	// iterator
	//

	each: function(callback, filter, options) {
		for (let i = 0; i < this.children.length; i++) {
			let child = this.children.findByIndex(i);
			if (!filter || filter(child)) {
				if (callback(child, options) == false) {
					break;
				}
			}
		}
	},

	//
	// querying methods
	//

	isVisible: function() {
		return this.$el.is(':visible');
	},

	hasParentView: function(className) {
		if (this.$el.hasClass(className)) {
			return true;
		} else if (this.parent && this.parent.hasParentView) {
			return this.parent.hasParentView(className);
		} else if (this.options.parent && this.options.parent.hasParentView) {
			return this.options.parent.hasParentView(className);
		} else {
			return false;
		}
	},

	hasChildViewAt: function(index) {
		return this.children.findByIndex(index) != null;
	},

	//
	// counting methods
	//

	numChildren: function(filter) {
		if (!filter) {
			return this.children.length;
		} else {
			let num = 0;
			this.each(() => {
				num++;
			} ,filter);
			return num;
		}
	},

	//
	// getting methods
	//

	getParentView: function(className) {
		if (this.$el.hasClass(className)) {
			return this;
		} else if (this.parent && this.parent.getParentView) {
			return this.parent.getParentView(className);
		} else if (this.options.parent && this.options.parent.getParentView) {
			return this.options.parent.getParentView(className);
		}
	},

	getChildViewAt: function(index) {
		if (index !== undefined) {
			return this.children.findByIndex(index);
		}
	},

	getItemView: function(model) {
		if (model) {
			return this.children.findByModel(model);
		}
	},

	//
	// setting methods
	//

	setClass(className, selected) {
		if (selected) {
			this.$el.addClass(className);
		} else {
			this.$el.removeClass(className);		
		}
	},

	setVisible: function(visibility) {
		if (visibility) {
			this.$el.show();
		} else {
			this.$el.hide();
		}
	},

	//
	// rendering methods
	//

	buildChildView: function(child, ChildViewClass, childViewOptions) {

		// call superclass method
		//
		let view = Marionette.CollectionView.prototype.buildChildView.call(this, child, ChildViewClass, childViewOptions);

		// attach child to parent
		//
		view.parent = this;

		return view;
	},

	//
	// event handling methods
	//

	block: function(event) {

		// prevent further handling of event
		//
		event.preventDefault();
		event.stopPropagation();
	},

	//
	// child event handling methods
	//

	onAddChild: function(parentView, childView) {

		// perform callback
		//
		if (this.options.onadd && this.isRendered()) {
			this.options.onadd(childView);
		}
	},

	onRemoveChild: function(parentView, childView) {

		// perform callback
		//
		if (this.options.onremove && this.isRendered()) {
			this.options.onremove(childView);
		}
	}
}));