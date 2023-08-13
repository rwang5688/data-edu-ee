#!/bin/bash
rm -rf ./zip && mkdir zip

cd ./src
git archive -o dataedu-fetch-s3-data.zip HEAD lambda_handler.py \
    bin certifi charset_normalizer idna requests smart_open urllib3
mv dataedu-fetch-s3-data.zip ../zip

cd ..

