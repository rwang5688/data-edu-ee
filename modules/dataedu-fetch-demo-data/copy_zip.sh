#!/bin/bash
# We only need to copy to us-east-1; there appears to be cross-region replication to other regions
export AWS_REGION='us-east-1'
export SOURCE_CODE_BUCKET_NAME_PREFIX='ee-assets-prod-'
export SOURCE_MODULE_VERSION_PREFIX='modules/cfdd4f678e99415a9c1f11342a3a9887/v1/'

cd ./zip

echo "aws s3 cp dataedu-fetch-demo-data.zip \
    s3://${SOURCE_CODE_BUCKET_NAME_PREFIX}${AWS_REGION}/${SOURCE_MODULE_VERSION_PREFIX}lambda/"
aws s3 cp dataedu-fetch-demo-data.zip \
    s3://${SOURCE_CODE_BUCKET_NAME_PREFIX}${AWS_REGION}/${SOURCE_MODULE_VERSION_PREFIX}lambda/

cd ..

