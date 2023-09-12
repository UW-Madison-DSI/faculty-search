################################################################################
#                                                                              #
#                            contact_controller.py                             #
#                                                                              #
################################################################################
#                                                                              #
#        This controller is used to handle requests for contacts.              #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2023, Data Science Institute, University of Wisconsin      #
################################################################################

import flask
import os
from flask import request
from flask_mail import Mail, Message


class ContactController:
    #

    @staticmethod
    def post_create():
        # get current app
        app = flask.current_app

        # try to get app config from config.py
        try:
            MAIL_SENDER = app.config["MAIL_SENDER"]
            MAIL_RECIPIENT = app.config["MAIL_RECIPIENT"]
        except Exception:
            # Get from environment variables (docker workflow)
            MAIL_SENDER = os.getenv("DEBUG")
            MAIL_RECIPIENT = os.getenv("PORT")
            pass

        # parse parameters
        name = request.json.get("name")
        email = request.json.get("email")
        subject = request.json.get("subject")
        message = request.json.get("message")

        # instantiate mail capability
        mail = Mail(app)

        # create new mail message
        msg = Message(subject, sender=MAIL_SENDER, recipients=MAIL_RECIPIENT)
        msg.body = (
            "Contact form submitted: "
            + "\r\n"
            + "Name: "
            + name
            + "\r\n"
            + "Email: "
            + email
            + "\r\n"
            + "Subject: "
            + subject
            + "\r\n"
            + "Message: "
            + message
        )

        # send mail message
        mail.send(msg)

        # return mail parameters
        return {
            "name": name,
            "email": email,
            "subject": subject,
            "message": message,
        }, 200
