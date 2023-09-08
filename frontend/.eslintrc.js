module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"rules": {
	},
	"globals": {
		"_": "readonly",
		"$": "readonly",
		"config": "readonly",
		"defaults": "readonly",
		"application": "writable",
		"template": "readonly",
		"require": "readonly",
		"Backbone": "readonly",
		"Marionette": "readonly",
		"Clipboard": "readonly",
		"Flickity": "readonly",
		"Split": "readonly",
		"dateFormat": "readonly",
		"PDFJS": "readonly"
	}
}