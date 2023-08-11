################################################################################
#                                                                              #
#                               pdf_controller.py                              #
#                                                                              #
################################################################################
#                                                                              #
#        This controller is used to handle requests to read pdf files.         #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2023, Data Science Institute, University of Wisconsin      #
################################################################################

import io
import flask
from flask import request
from flask import jsonify
from langchain.document_loaders import PyPDFLoader
from PyPDF2 import PdfReader
from io import StringIO
from io import BytesIO
import PyPDF2
import base64

class PDFController:

	@staticmethod
	def post_read(target_n: int = 1000):

		# parse input data

		# data = request.get_data()
		data = request.get_data()
		# data = request.get_data(parse_form_data=False)
		# data = request.get_data(parse_form_data=True)
		# data = request.get_data(parse_form_data=True).encode()
		# data = base64.encode(request.get_data())
		# data = base64.b64decode(request.get_data())
		# data = request.stream

		file = open("data2.pdf", "wb")
		file.write(data)
		file.close()

		loader = PyPDFLoader("data.pdf")
		pages = loader.load_and_split()

		n = 0
		output = ""
		for page in pages:
			if n < target_n:
				output += page.page_content
			n += len(page.page_content.split(" "))

		return output
