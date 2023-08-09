
# if no config file exists, then create from template
if [ ! -f config.py ]; then
	cp config.template.py config.py
fi

# run Flask app
python3 app.py