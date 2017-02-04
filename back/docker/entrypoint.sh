#!/usr/bin/env bash

pip install -r /usr/src/back/requirements.txt
python /usr/src/back/manage.py migrate
python /usr/src/back/manage.py collectstatic --noinput
exec /usr/local/bin/uwsgi /etc/uwsgi.ini
