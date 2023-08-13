#!/bin/bash
rm -rf ./zip && mkdir zip

cd ./src
git archive -o dataedu-fetch-lmsapi.zip HEAD lambda_function.py lmsAPI.py data
mv dataedu-fetch-lmsapi.zip ../zip

cd ..

