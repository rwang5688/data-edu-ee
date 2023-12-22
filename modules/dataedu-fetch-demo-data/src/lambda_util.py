# MIT No Attribution

# Copyright 2021 Amazon Web Services (AWS)

# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import json
import logging
import boto3
from botocore.exceptions import ClientError

def get_lambda_client(profile_name, region_name):
    print('get_lambda_client: profile_name=%s, region_name=%s' % (profile_name, region_name))

    p_name = None
    if (profile_name != ''):
        p_name = profile_name
    session = boto3.Session(profile_name=p_name)
    lmb = session.client('lambda', region_name=region_name)
    return lmb

def copy_s3_objects_async(profile_name, region_name, \
    source_bucket_name, source_prefix, source_object_names, \
    dest_bucket_name, dest_prefix):
    dest_object_names = []

    lmb = get_lambda_client(profile_name, region_name)
    if lmb is None:
        print('copy_s3_objects_async: Failed to get lambda client.')
        return dest_object_names
    
    source_bucket_base_url = source_bucket_name + '.s3.amazonaws.com'

    try:
        for source_object_name in source_object_names:
            source_file_url = "https://{}/{}".format(source_bucket_base_url, source_object_name)
            dest_object_name = source_object_name.replace(source_prefix, dest_prefix)

            payload = {}
            payload["file_url"] = source_file_url
            payload["s3_bucket"] = dest_bucket_name
            payload["key"] = dest_object_name
           
            print("copy_s3_objects_async: Invoke dataedu-fetch-s3-data with payload({})".format(payload))
            
            status = lmb.invoke(
                    FunctionName='dataedu-fetch-s3-data',
                    InvocationType='Event',
                    Payload=json.dumps(payload),
                    )

            dest_object_names.append(dest_object_name)
        
    except ClientError as e:
        logging.error("copy_s3_objects_async: unexpected error: ")
        logging.exception(e)
        return dest_object_names

    return dest_object_names    

