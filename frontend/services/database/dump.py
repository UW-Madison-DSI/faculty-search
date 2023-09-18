import sqlite3

#
# database querying methods
#

def get_connection():
	return sqlite3.connect('database.db')

def get_votes():
	connection = get_connection()
	votes = connection.execute('SELECT * FROM votes').fetchall()
	connection.close()
	return votes

#
# main
#

votes = get_votes()
print(votes)