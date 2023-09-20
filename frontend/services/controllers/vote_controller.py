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

	database = 'services/database/database.db'

	@staticmethod
	def post_create():

		# get parameter values
		kind = request.json.get('kind')
		target = request.json.get('target')
		query = request.json.get('query')
		top_k = request.json.get('top_k')
		weight_results = request.json.get('weight_results')
		n = request.json.get('n')
		m = request.json.get('m')
		since_year = request.json.get('since_year')
		distance_threshold = request.json.get('distance_threshold')
		relevance_weighting = request.json.get('pow')
		ks = request.json.get('ks')
		ka = request.json.get('ka')
		kr = request.json.get('kr')
		with_plot = request.json.get('with_plot')
		vote = request.json.get('vote');

		# create new database
		if not os.path.isfile(VoteController.database):
			connection = sqlite3.connect(VoteController.database)
			with open('database/schema.sql') as file:
				connection.executescript(file.read())
				connection.commit()
				connection.close()

		# connect to database
		connection = sqlite3.connect(VoteController.database)

		# save vote
		query = "INSERT INTO votes ( \
			'kind', \
			'target', \
			'query', \
			'top_k', \
			'weight_results', \
			'n', \
			'm', \
			'since_year', \
			'distance_threshold', \
			'pow', \
			'ks', \
			'ka', \
			'kr', \
			'with_plot', \
			'vote') VALUES ( \
			'{kind}', \
			'{target}', \
			'{query}', \
			'{top_k}', \
			'{weight_results}', \
			'{n}', \
			'{m}', \
			'{since_year}', \
			'{distance_threshold}', \
			'{pow}', \
			'{ks}', \
			'{ka}', \
			'{kr}', \
			'{with_plot}', \
			'{vote}')".format( \
			kind = kind,
			target = target,
			query = query,
			top_k = top_k,
			weight_results = weight_results,
			n = n,
			m = m,
			since_year = since_year,
			distance_threshold = distance_threshold,
			pow = relevance_weighting,
			ks = ks,
			ka = ka,
			kr = kr,
			with_plot = with_plot,
			vote = vote)
		connection.executescript(query)
		connection.commit()
		connection.close()

		return "success";

	@staticmethod
	def to_vote(vote):
		return {
			'id': vote[0],
			'kind': vote[1],
			'target': vote[2],
			'query': vote[3],
			'vote': vote[4],
			'top_k': vote[6],
			'weight_results': vote[6],
			'n': vote[7],
			'm': vote[8],
			'since_year': vote[9],
			'distance_threshold': vote[10],
			'relevance_weighting': vote[11],
			'ks': vote[12],
			'ka': vote[13],
			'kr': vote[14],
			'with_plot': vote[15]
		}

	@staticmethod
	def to_votes(votes):
		votes2 = [];
		for vote in votes:
			votes2.append(VoteController.to_vote(vote))
		return votes2

	@staticmethod
	def get_all():
		if os.path.isfile(VoteController.database):

			# connect to database
			connection = sqlite3.connect(VoteController.database)

			# query database
			votes = connection.execute('SELECT * FROM votes').fetchall()
			connection.close()

			# convert votes array to objects for legibility
			if votes:
				votes = VoteController.to_votes(votes)
		else:
			return "No database."

		return votes

	@staticmethod
	def delete_all():
		os.remove(VoteController.database)
		return "Database deleted."