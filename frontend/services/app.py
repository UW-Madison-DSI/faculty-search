################################################################################
#                                                                              #
#                                    app.py                                    #
#                                                                              #
################################################################################
#                                                                              #
#        This is a simple web server for the Community Search application.     #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2023, Data Science Institute, University of Wisconsin      #
################################################################################

import os
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from controllers.contact_controller import ContactController
import config
import logging

# set logging file
# logging.basicConfig(filename='log/info.log', level=logging.INFO)

################################################################################
#                            app initialization                                #
################################################################################

# create new Flask app
app = Flask(__name__, static_folder='../', static_url_path="/")

# configure app fron config.py
app.config.from_object(config)

################################################################################
#                    request parameter parsing methods                         #
################################################################################

def get_array(name):

	"""
	Get a set of form (body) parameters that are passed as an array.

	Parameters:
		name: The parameter name
	Return
		array: The set of array values
	"""

	array = []
	value = request.form.get(name)
	if not value:
		return []
	terms = value.split('_')
	for term in terms:
		array.append(int(term) if term.isnumeric() else term)
	return array

def get_query_array(name):

	"""
	Get a set of query string parameters that are passed as an underscore separated string.

	Parameters:
		name: The parameter name
	Return
		array: The set of array values
	"""
	array = []
	value = request.args.get(name)
	if not value:
		return []
	terms = value.split('_')
	for term in terms:
		array.append(int(term) if term.isnumeric() else term)
	return array

def get_dict(name):

	"""
	Get a set form (body) parameters that are passed as key / value pairs.

	Parameters:
		name: The parameter name
	Return
		array: The set of array values
	"""

	array = {}
	dict = request.form.to_dict(flat=True)
	for key in dict:
		if (key.startswith(name)):
			value = dict[key]
			key = key.replace(name, '').replace('[', '').replace(']', '')
			array[key] = float(value) if value.isnumeric() else value
	return array

################################################################################
#                            API route definitions                             #
################################################################################

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):

	"""
	Handles requests for the static web content (the UI).

	Return
		response: The web content requested
	"""

	return app.send_static_file("index.html")

################################################################################
#                            contact form routes                               #
################################################################################

@app.post('/api/contacts')
def post_create():

	"""
	Submit a contact email request.

	Return
		response: The status of the request
	"""

	return ContactController.post_create()

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':
	app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=int(app.config['PORT']))
