/******************************************************************************\
|                                                                              |
|                                 date-utils.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose date formatting utilities.        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import TimeUtils from '../../utilities/time-utils.js';
import '../../utilities/math/math-utils.js';
import '../../utilities/time/date-format.js';

export default {

	//
	// formatting
	//

	parse: function(string, format) {
		let strings, date;

		switch (format) {

			case 'yyyy-mm-dd':
				strings = string.replace('/', '-').split('-');
				date = new Date();
				date.setYear(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setDate(parseInt(strings[2]));
				break;

			case 'mm-dd-yyyy':
				strings = string.replace('/', '-').split('-');
				date = new Date();
				date.setDate(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setYear(parseInt(strings[2]));
				break;

			case 'yyyy mm dd':
				strings = string.replace('/', '-').split(' ');
				date = new Date();
				date.setYear(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setDate(parseInt(strings[2]));
				break;
				
			case 'mm dd yyyy':
				strings = string.replace('/', '-').split(' ');
				date = new Date();
				date.setDate(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setYear(parseInt(strings[2]));
				break;

			case 'yyyy/mm/dd':
				strings = string.replace('/', '-').split('/');
				date = new Date();
				date.setYear(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setDate(parseInt(strings[2]));
				break;
				
			case 'mm/dd/yyyy':
				strings = string.replace('/', '-').split('/');
				date = new Date();
				date.setDate(parseInt(strings[0]));
				date.setMonth(parseInt(strings[1]) - 1);
				date.setYear(parseInt(strings[2]));
				break;

			default:

				// use default date parsing
				//
				date = new Date(string.replace('/', '-').replace(' ', 'T'));
		}

		return date;
	},

	getDateFormat: function(format) {
		switch (format) {
			case 'date_only':
				return 'mmm d, yyyy';
			case 'day_date':
				return 'ddd, mmm d, yyyy';
			case 'time_only':
				return 'h:MM TT';
			case 'date_time':
				return 'mmm d, yyyy h:MM TT';
			case 'day_date_time':
				return 'ddd, mmm d, yyyy h:MM TT';
			default:
				return 'ddd, mmm dd, yyyy HH:MM:ss';
		}
	},

	when: function(date, options) {
		let localDate = this.UTCToLocalDate(date);
		let seconds = TimeUtils.getElapsedSeconds(localDate, new Date(), options);
		let sign = Math.sign(seconds);
		let ending = sign < 0? 'in the future' : 'ago';

		if (Math.abs(seconds) < 60) {
			return "just now";
		} else if (seconds < 3600 * 24) {

			// show hours and minutes
			//
			return TimeUtils.timeToString(TimeUtils.secondsToTime(Math.abs(seconds)), _.extend({}, options, {
				'seconds': false
			})) + ' ' + ending;		
		} else if (seconds < 3600 * 24 * 7) {

			// show days and hours
			//
			return TimeUtils.timeToString(TimeUtils.secondsToTime(Math.abs(seconds)), _.extend({}, options, {
				'minutes': false,
				'seconds': false
			})) + ' ' + ending;		
		} else if (seconds < 3600 * 24 * 30) {

			// show weeks and days
			//
			return TimeUtils.timeToString(TimeUtils.secondsToTime(Math.abs(seconds)), _.extend({}, options, {
				'hours': false,
				'minutes': false,
				'seconds': false
			})) + ' ' + ending;

		} else if (seconds < 3600 * 24 * 365) {

			// show months
			//
			return TimeUtils.timeToString(TimeUtils.secondsToTime(Math.abs(seconds), {
				months: true
			}), _.extend({}, options, {
				'months': true,
				'weeks': false,
				'days': false,
				'hours': false,
				'minutes': false,
				'seconds': false
			})) + ' ' + ending;
		} else {

			// show years
			//
			return TimeUtils.timeToString( TimeUtils.secondsToTime(Math.abs(seconds)), _.extend({}, options, {
				'months': false,
				'weeks': false,
				'days': false,
				'hours': false,
				'minutes': false,
				'seconds': false
			})) + ' ' + ending;
		}
	},

	//
	// date arithmetic methods
	//

	offsetDate: function(date, value, units) {
		switch (units) {
			case 'seconds':
				date.setSeconds(date.getSeconds() + value);
				break;
			case 'minutes':
				date.setMinutes(date.getMinutes() + value);
				break;
			case 'hours':
				date.setHours(date.getHours() + value);
				break;
			case 'days':
				date.setDate(date.getDate() + value);
				break;
			case 'weeks':
				date.setDate(date.getDate() + value * 7);
				break;
			case 'months':
				date.setDate(date.getDate() + value * 365 / 12);
				break;
			case 'years':
				date.setDate(date.getDate() + value * 365);
				break;
		}
	},

	//
	// UTC methods
	//

	UTCToLocalDate: function(date) {
		if (!date) {
			return;
		}
		return new Date(
			date.getTime() - 
			date.getTimezoneOffset() * 60 * 1000
		);
	},

	localToUTCDate: function(date) {
		if (!date) {
			return;
		}
		return new Date(
			date.getTime() + 
			date.getTimezoneOffset() * 60 * 1000
		);
	},

	UTCLocalTimeOfDay: function(timeOfDay) {
		if (!timeOfDay) {
			return;
		}
		let time = TimeUtils.timeToObject(timeOfDay);

		// get time zone offset
		//
		let timeZoneOffsetMinutes = new Date().getTimezoneOffset();
		let timeZoneOffsetHours = Math.floor(timeZoneOffsetMinutes / 60);
		timeZoneOffsetMinutes -= timeZoneOffsetHours * 60;

		// add time zone offset
		//
		time.hours -= timeZoneOffsetHours;
		time.minutes -= timeZoneOffsetMinutes;
		if (time.hours > 24) {
			time.hours -= 24;
		}

		return time;
	},

	UTCTimeOfDayToLocalDate: function(timeOfDay) {
		if (!timeOfDay) {
			return;
		}
		let time = this.UTCLocalTimeOfDay(timeOfDay);

		let date = new Date();
		date.setHours(time.hours);
		date.setMinutes(time.minutes);
		date.setSeconds(time.seconds);
		return date;
	},

	UTCToLocalTimeOfDay: function(timeOfDay) {
		if (!timeOfDay) {
			return;
		}
		let time_date = this.UTCTimeOfDayToLocalDate(timeOfDay);
		return dateFormat(time_date, "HH:MM");
	},

	UTCToLocalTimeOfDayMeridian: function(timeOfDay) {
		if (!timeOfDay) {
			return;
		}
		let time_date = this.UTCTimeOfDayToLocalDate(timeOfDay);
		return dateFormat(time_date, "h:MM TT");
	},

	//
	// HTML date formatting methods
	//

	dateToHTML: function(date) {
		let html = '<span class="date">';
		if (date) {
			html += this.UTCToLocalDate(date).format('mm/dd/yyyy');
		}
		html += '</span>';
		return html;	
	},

	dateToDetailedHTML: function(date) {
		let html = '<div class="datetime">';

		// add date
		//
		html += '<div class="date">';
		if (date) {
			html += this.UTCToLocalDate(date).format('mm/dd/yyyy');
		}
		html += '</div>';

		// add time
		//
		html += '<div class="time">';
		if (date) {
			html += this.UTCToLocalDate(date).format('HH:MM:ss');
		}
		html += '</div>';

		html += '</div>';	
		return html;
	},

	dateToSortableHTML: function(date) {

		// add non-displayable sorting datetime
		//
		let html = '<div class="datetime">';
		if (date) {
			html += this.UTCToLocalDate(date).format('mm/dd/yyyy HH:MM');
		}
		html += '</div>';
		
		return html;
	}
};