FROM python:3.6-slim


ARG DEBIAN_FRONTEND=noninteractive


RUN apt-get update \
        && apt-get install -y --no-install-recommends \
            gcc \
            libpq-dev \
        && pip install -U pip \
        && pip install uwsgi \
        && rm -fr /var/lib/apt/lists/* \
        && rm -fr /tmp/* \
        && rm -fr /var/tmp/*

COPY ./docker/uwsgi.ini /etc/uwsgi.ini
COPY ./docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

COPY ./requirements.txt /usr/src/back/requirements.txt

RUN pip install -r /usr/src/back/requirements.txt

COPY . /usr/src/back

RUN pip install -e /usr/src/back

WORKDIR /usr/src/back

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
