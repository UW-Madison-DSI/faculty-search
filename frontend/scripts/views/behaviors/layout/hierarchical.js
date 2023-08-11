/******************************************************************************\
|                                                                              |
|                               hierarchical.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a behavior for managing hierarchical views.              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	//
	// querying methods
	//

	hasChildView: function(name) {
		if (name.includes(' ')) {
			return this.hasGrandChildView(name);
		}
		return this.getChildView(name) != undefined;
	},

	hasGrandChildView: function(name) {
		let names = name.split(' ');
		let view = this;
		for (let i = 0; i < names.length; i++) {
			view = view.getChildView(names[i]);
			if (view == null) {
				return false;
			}
		}
		return view != null;
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

	hasAncestorView: function(name) {
		let terms = name.split(' ');
		let view = this;
		for (let i = 0; i < terms.length; i++) {
			view = view.getParentView(terms[i]);
			if (view == null) {
				return false;
			}
		}
		return view != null;
	},

	//
	// hierarchical view getting methods
	//

	getChildView: function(name) {
		if (name.includes(' ')) {
			return this.getGrandChildView(name);
		}
		if (this.hasRegion(name)) {
			return this.getRegion(name).currentView;
		}
	},

	getGrandChildView: function(name) {
		let names = name.split(' ');
		let view = this;
		for (let i = 0; i < names.length; i++) {
			view = view.getChildView(names[i]);
			if (view == null) {
				return null;
			}
		}
		return view;
	},

	getParentView: function(className) {
		if (this.$el.hasClass(className)) {
			return this;
		} else if (this.parent && this.parent.getParentView) {
			return this.parent.getParentView(className);
		} else if (this.options.parent && this.options.parent.getParentView) {
			return this.options.parent.getParentView(className);
		}
	},

	getAncestorView: function(name) {
		let terms = name.split(' ');
		let view = this;
		for (let i = 0; i < terms.length; i++) {
			view = view.getParentView(terms[i]);
			if (view == null) {
				return null;
			}
		}
		return view;
	}
};