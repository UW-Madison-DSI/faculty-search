/******************************************************************************\
|                                                                              |
|                                  timestamped.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a base time stamped base model.               |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseModel from '../../models/base-model.js';
import '../../utilities/time/iso8601.js';

export default BaseModel.extend({

	//
	// methods
	//

	getCreateDate: function() {
		if (this.has('created_at')) {
			return this.get('created_at');
		} else if (this.has('create_date')) {
			return this.get('create_date')
		}
	},

	getUpdateDate: function() {
		if (this.has('updated_at')) {
			return this.get('updated_at');
		} else if (this.has('update_date')) {
			return this.get('update_date')
		}
	},

	getDeleteDate: function() {
		if (this.has('deleted_at')) {
			return this.get('deleted_at');
		} else if (this.has('delete_date')) {
			return this.get('delete_date')
		}
	},

	hasCreateDate: function() {
		return this.has('created_at') || this.has('create_date');
	},

	hasUpdateDate: function() {
		return this.has('updated_at') || this.has('update_date');
	},

	hasDeleteDate: function() {
		return this.has('deleted_at') || this.has('delete_date');
	},

	toDate: function(date) {

		// handle string types
		//
		if (typeof(date) === 'string') {

			// handle null string
			//
			if (date === '0000-00-00 00:00:00') {
				date = new Date(0);

			// parse date string
			//
			} else {
				date = Date.parseIso8601(date);
			}
			
		// handle object types
		//
		} else if (typeof(date) === 'object') {
			if (date.date) {
				date = Date.parseIso8601(date.date);
			}
		}

		return date;
	},

	//
	// overridden Backbone methods
	//

	parse: function(response) {

		// convert laravel/rails dates
		//
		if (response.created_at) {
			response.created_at = this.toDate(response.created_at);
		}
		if (response.updated_at) {
			response.updated_at = this.toDate(response.updated_at);
		}
		if (response.deleted_at) {
			response.deleted_at = this.toDate(response.deleted_at);
		}

		// convert other dates
		//
		if (response.create_date) {
			response.create_date = this.toDate(response.create_date);
		}
		if (response.update_date) {
			response.update_date = this.toDate(response.update_date);
		}
		if (response.delete_date) {
			response.delete_date = this.toDate(response.delete_date);
		}

		return response;
	}
});
