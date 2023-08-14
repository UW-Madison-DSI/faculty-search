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

import os
from dotenv import load_dotenv
from pathlib import Path
from flask import request
from langchain.document_loaders import PyPDFLoader
load_dotenv()

class PDFController:
	
	def __init__(self, upload_folder: Path):
		self.upload_folder = upload_folder
		os.makedirs(upload_folder, exist_ok=True)

	def post_read(self, target_n: int = 1000):

		# check for file parameter
		if 'file' not in request.files:
			return "No file specified.", 404

		# get file parameter
		file = request.files['file']

		# check that file parameter is a pdf file
		if file and file.filename.endswith('.pdf'):

			# save pdf file to uploads folder
			file_path = os.path.join(self.upload_folder, file.filename)
			file.save(file_path)

			# read pdf file from uploads folder
			loader = PyPDFLoader(file_path)
			pages = loader.load_and_split()

			# parse words from pdf file
			n = 0
			output = ""
			for page in pages:
				words = page.page_content.split(" ")
				while n < target_n:
					for word in words:
						if n > 0:
							output += ' '
						output += word
						n += 1
						if n > target_n:
							break

				# if n < target_n:
				#	output += page.page_content
				#n += len(page.page_content.split(" "))

			return output

		return "Invalid PDF file."