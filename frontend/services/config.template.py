################################################################################
#                                                                              #
#                                  config.py                                   #
#                                                                              #
################################################################################
#                                                                              #
#        This file contains your application configuration.                    #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2023, Data Science Institute, University of Wisconsin      #
################################################################################

# system configuration
DEBUG = True
HOST = 'localhost'
PORT = '5000'

# mail configuration - used only for contact form
MAIL_SERVER = '<Your mail host here>'
MAIL_PORT = 587
MAIL_USERNAME = '<Your mail username here>'
MAIL_PASSWORD = '<Your mail password here>'
MAIL_USE_TLS = True
MAIL_USE_SSL = False
MAIL_SENDER = '<Your mail sender email address here>'