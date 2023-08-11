/******************************************************************************\
|                                                                              |
|                                validatable.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a form validating behavior.                              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../../../vendor/jquery/validate/js/jquery.validate.js';

export default {

	//
	// attributes
	//

	// this determines whether to revalidate on losing focus
	//
	onfocusout: undefined,

	//
	// validating rule methods
	//

	addMethod: function(name, method, message) {
		$.validator.addMethod(name, method, message);
	},

	addRule: function(name, rule) {
		this.addMethod(name, rule.method, rule.message);
	},

	addRules: function(rules) {
		let names = Object.keys(rules);
		for (let i = 0; i < names.length; i++) {
			let name = names[i];
			if (rules[name]) {
				this.addRule(name, rules[name]);
			}
		}
	},

	addRulesByName: function(names, rules) {
		for (let i = 0; i < names.length; i++) {
			let name = names[i];
			if (rules[name]) {
				this.addRule(name, rules[name].rule, rules[name].message);
			}
		}
	},

	addRuleSets: function(rule_sets) {
		for (let i = 0; i < rule_sets.length; i++) {
			this.addRules(this.rule_sets[i]);
		}
	},

	//
	// validating methods
	//

	validate: function() {
		this.validator = this.$el.validate({
			rules: this.rules,
			messages: this.messages,
			onfocusout: this.onfocusout,
			errorPlacement: this.errorPlacement
		});
	},

	errorPlacement: function ($error, $element) {
		if ($element.closest('.input-group').length > 0) {
			$element.closest('.input-group').after($error);
		} else {
			$element.append($error);
		}
	},

	isValid: function() {
		if (this.validator) {
			return this.validator.checkForm();
		} else {
			return true;
		}
	},

	check: function() {

		// trigger form updates
		//
		return this.validator.form();
	}
};