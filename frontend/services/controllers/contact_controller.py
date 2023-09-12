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
        app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
        app.config["MAIL_PORT"] = os.getenv("MAIL_PORT")
        app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
        app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
        app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS")
        app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL")

        # try to get app config from config.py
        try:
            MAIL_SENDER = app.config["MAIL_SENDER"]
            MAIL_RECIPIENT = app.config["MAIL_RECIPIENT"]
            MAIL_ANOTHER_RECIPIENT = app.config["MAIL_ANOTHER_RECIPIENT"]
        except Exception:
            # Get from environment variables (docker workflow)
            MAIL_SENDER = os.getenv("MAIL_SENDER")
            MAIL_RECIPIENT = os.getenv("MAIL_RECIPIENT")
            MAIL_ANOTHER_RECIPIENT = os.getenv("MAIL_ANOTHER_RECIPIENT")
            pass

        # parse parameters
        name = request.json.get("name")
        email = request.json.get("email")
        subject = request.json.get("subject")
        message = request.json.get("message")

        # instantiate mail capability
        mail = Mail(app)

        # create new mail message
        msg = Message(
            subject,
            sender=MAIL_SENDER,
            recipients=[MAIL_RECIPIENT, MAIL_ANOTHER_RECIPIENT],
        )
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
