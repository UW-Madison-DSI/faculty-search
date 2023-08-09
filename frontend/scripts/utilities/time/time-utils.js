/******************************************************************************\
|                                                                              |
|                                 time-utils.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose time oriented utilities.          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../utilities/math/math-utils.js';
import './iso8601.js';

export default {

	daysOfWeek: [
		'Sunday',
		'Monday', 
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	],

	//
	// getting methods
	//

	getTime: function() {
		let date = new Date();
		return {
			hours: date.getHours(),
			minutes: date.getMinutes(),
			seconds: date.getSeconds()
		};
	},

	getTimeOfDay: function() {
		let hour = new Date().getHours();
		if (hour > 6 && hour < 18) {
			return 'day';
		} else {
			return 'night';
		}
	},

	//
	// elapsed time getting methods
	//

	getElapsedSeconds: function(date1, date2, options) {
		if (!date1 || !date2) {
			return;
		}

		let time1 = date1? date1.getTime() : 0;
		let time2 = date2? date2.getTime() : 0;
		let seconds = (time2 - time1) / 1000;

		// check options
		//
		if (!options || !options.bidirectional) {
			if (seconds < 0) {
				seconds = 0;
			}
		}

		return seconds;
	},

	getElapsedTime: function(date1, date2, options) {
		let seconds = this.getElapsedSeconds(date1, date2);

		if (options == 'seconds') {
			return seconds;
		} else if (typeof options == 'string') {
			return this.secondsToUnits(seconds, options);
		} else {
			return this.secondsToTime(seconds, options);
		}
	},

	//
	// time converting methods
	//

	secondsToUnits: function(seconds, units) {

		// constants
		//
		let secondsPerMinute = 60;
		let secondsPerHour = secondsPerMinute * 60;
		let secondsPerDay = secondsPerHour * 24;
		let secondsPerWeek = secondsPerDay * 7;
		let secondsPerMonth = secondsPerDay * 30;
		let secondsPerYear = secondsPerWeek * 52;

		switch (units) {
			case 'seconds':
				return seconds;
			case 'minutes':
				return seconds / secondsPerMinute;
			case 'hours':
				return seconds / secondsPerHour;
			case 'days':
				return seconds / secondsPerDay;
			case 'weeks':
				return seconds / secondsPerWeek;
			case 'months':
				return seconds / secondsPerMonth;
			case 'years':
				return seconds / secondsPerYear;
		}
	},

	secondsToTime: function(seconds, options) {
		let sign = Math.sign(seconds);
		let time = {};

		if (seconds == undefined) {
			return;
		}
		
		// constants
		//
		let secondsPerMinute = 60;
		let secondsPerHour = secondsPerMinute * 60;
		let secondsPerDay = secondsPerHour * 24;
		let secondsPerWeek = secondsPerDay * 7;
		let secondsPerMonth = secondsPerDay * 30;
		let secondsPerYear = secondsPerWeek * 52;

		seconds = Math.abs(seconds);

		// add elapsed years
		//
		if (!options || options.years) {
			let years = Math.floor(seconds / secondsPerYear);
			time.years = years * sign;
			seconds -= years * secondsPerYear;
		}

		// add elapsed months
		//
		if (options && options.months) {
			let months = Math.floor(seconds / secondsPerMonth);
			time.months = months * sign;
			seconds -= months * secondsPerMonth;
		}

		// add elapsed weeks
		//
		if (!options || options.weeks) {
			let weeks = Math.floor(seconds / secondsPerWeek);
			time.weeks = weeks * sign;
			seconds -= weeks * secondsPerWeek;
		}

		// add elapsed days
		//
		if (!options || options.days) {
			let days = Math.floor(seconds / secondsPerDay);
			time.days = days * sign;
			seconds -= days * secondsPerDay;
		}

		// add elapsed hours
		//
		if (!options || options.hours) {
			let hours = Math.floor(seconds / secondsPerHour);
			time.hours = hours * sign;
			seconds -= hours * secondsPerHour;
		}

		// add elapsed minutes
		//
		if (!options || options.minutes) {
			let minutes = Math.floor(seconds / secondsPerMinute);
			time.minutes = minutes * sign;
			seconds -= minutes * secondsPerMinute;
		}

		// add elapsed seconds
		//
		if (!options || options.seconds) {
			time.seconds = seconds * sign;
		}

		return time;
	},

	secondsToString: function(seconds, options) {
		let time = this.secondsToTime(seconds);
		return this.timeToString(time, options);
	},

	//
	// time formatting methods
	//

	timeToString: function(time, options) {
		let string = '';

		if (!time) {
			return;
		}

		// convert to string
		//
		if (time.years && (!options || options.years != false)) {
			if (options && options.verbose) {
				string += time.years + ' ' + (time.years > 1? 'years' : 'year');
			} else {
				string += time.years + 'y';
			}
		}
		if (time.months && (!options || options.months != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += time.months + ' ' + (time.months > 1? 'months' : 'month');
			} else {
				string += time.months + 'mo';
			}
		}
		if (time.weeks && (!options || options.weeks != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += time.weeks + ' ' + (time.weeks > 1? 'weeks' : 'week');
			} else {
				string += time.weeks + 'wk';
			}
		}
		if (time.days && (!options || options.days != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += time.days + ' ' + (time.days > 1? 'days' : 'day');
			} else {
				string += time.days + 'd';
			}
		}
		if (time.hours && (!options || options.hours != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += time.hours + ' ' + (time.hours > 1? 'hours' : 'hour');
			} else {
				string += time.hours + 'h';
			}
		}
		if (time.minutes && (!options || options.minutes != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += time.minutes + ' ' + (time.minutes > 1? 'mins' : 'min');
			} else {
				string += time.minutes + 'm';
			}
		}
		if (time.seconds && (!options || options.seconds != false)) {
			if (string) {
				string += ' ';
			}
			if (options && options.verbose) {
				string += Math.round(time.seconds) + ' ' + (time.seconds > 1? 'secs' : 'sec');
			} else {
				string += Math.round(time.seconds) + 's';
			}
		}

		return string;
	},

	timeToDigits: function(time) {
		function digits(n) {
			return n > 9 ? "" + n: "0" + n;
		}

		if (time) {
			if (time.hours) {
				return digits(time.hours) + ':' + digits(time.minutes) + ':' + digits(Math.floor(time.seconds));
			} else {
				return digits(time.minutes) + ':' + digits(Math.floor(time.seconds));
			}
		} else {
			return '00:00';
		}
	},

	timeToObject: function(timeOfDay) {
		let strings = timeOfDay.split(':');
		return {
			hours: parseInt(strings[0], 10), 
			minutes: parseInt(strings[1], 10), 
			seconds: parseInt(strings[2], 10) 
		};
	},

	UTCDateToLocalDate: function(date) {
		let newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
		let offset = date.getTimezoneOffset() / 60;
		let hours = date.getHours();

		newDate.setHours(hours - offset);

		return newDate;   
	},

	LocalDateToUTCDate: function(date) {
		return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
	},

	UTCLocalTimeOfDay: function(timeOfDay) {
		let time = this.timeToObject(timeOfDay);

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

	//
	// sleeping methods
	//
	
	sleep: function(milliseconds) {
		let start = new Date().getTime();
		for (let i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	}
};