#!/usr/bin/env bash

set -o errexit
set -o xtrace
set -o pipefail

if [ ! -s "/usr/src/front/node_modules" ]; then
    mv /usr/src/packages/node_modules /usr/src/front
fi

cd /usr/src/front
npm i
exec npm start
