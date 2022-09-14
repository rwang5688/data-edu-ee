#!/bin/bash
rm -rf ./zip && mkdir zip

cd ./src
git archive -o dataedu-fetch-demo-data.zip HEAD dataedu_fetch_demo_data.py s3_util.py requirements.txt
mv dataedu-fetch-demo-data.zip ../zip

cd ..

