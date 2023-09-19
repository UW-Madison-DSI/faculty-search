################################################################################
#                                                                              #
#                              vote_controller.py                              #
#                                                                              #
################################################################################
#                                                                              #
#        This controller is used to manage votes on results quality.           #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2023, Data Science Institute, University of Wisconsin      #
################################################################################

import os
import sqlite3
from flask import request

class VoteController:

	@staticmethod
	def post_create():

		# get parameter values
		kind = request.json.get('kind')
		target = request.json.get('target')
		query = request.json.get('query')
		vote = request.json.get('vote');

		# create new database
		if not os.path.isfile('services/database/database.db'):
			connection = sqlite3.connect('services/database/database.db')
			with open('services/database/schema.sql') as file:
				connection.executescript(file.read())
				connection.commit()
				connection.close()

		# connect to database
		connection = sqlite3.connect('services/database/database.db')

		# save vote
		query = "INSERT INTO votes ('kind', 'target', 'query', 'vote') VALUES ('{kind}', '{target}', '{query}', '{vote}')".format(kind = kind, target = target, query = query, vote = vote)
		connection.executescript(query)
		connection.commit()
		connection.close()

		return "success";

	@staticmethod
	def get_all():
		if os.path.isfile('services/database/database.db'):

			# connect to database
			connection = sqlite3.connect('services/database/database.db')

			# query database
			votes = connection.execute('SELECT * FROM votes').fetchall()
			connection.close()
		else:
			votes = "No database."

		return votes