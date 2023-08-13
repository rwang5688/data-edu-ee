#!/bin/bash
rm -rf ./zip && mkdir zip

cd ./src
git archive -o dataedu-load-sisdb.zip HEAD lambda_function.py rds_credentials.py sisdb.py sql
mv dataedu-load-sisdb.zip ../zip

cd ..

