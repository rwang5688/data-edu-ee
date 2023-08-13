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


import logging
import boto3
from botocore.exceptions import ClientError

def get_s3_client(profile_name, region_name):
    print('get_s3_client: profile_name=%s, region_name=%s' % (profile_name, region_name))

    p_name = None
    if (profile_name != ''):
        p_name = profile_name
    session = boto3.Session(profile_name=p_name)
    s3 = session.client('s3', region_name=region_name)
    return s3

def get_s3_object_names(prefix):
    s3_object_names = []

    # OPen inventory file
    file = None
    if ('lms' in prefix):
        file = open('./data/lms.txt', 'r')
    elif ('sis' in prefix):
        file = open('./data/sis.txt', 'r')
    
    if file is None:
        print('get_s3_objects: There is no inventory file to open.')
        return s3_object_names
    
    # Read inventory
    Lines = file.readlines()

    # Add to s3_object_names array
    count = 0
    for line in Lines:
        count += 1
        s3_object_name = prefix + line.strip()
        #print("DEBUG: get_s3_object_names: Line{}: {}".format(count, s3_object_name))
        s3_object_names.append(s3_object_name)

    return s3_object_names

def copy_s3_objects(profile_name, region_name, \
    source_bucket_name, source_prefix, source_object_names, \
    dest_bucket_name, dest_prefix):
    dest_object_names = []

    s3 = get_s3_client(profile_name, region_name)
    if s3 is None:
        print('copy_s3_objects: Failed to get s3 client.')
        return dest_object_names

    try:
        for source_object_name in source_object_names:
            copy_source = {
                'Bucket': source_bucket_name,
                'Key': source_object_name
            }
            dest_object_name = source_object_name.replace(source_prefix, dest_prefix)

            #print('DEBUG: copy_s3_objects: dest_object_name: %s' % (dest_object_name))
            s3.copy(copy_source, dest_bucket_name, dest_object_name)

            dest_object_names.append(dest_object_name)
        
    except ClientError as e:
        logging.error("copy_s3_objects: unexpected error: ")
        logging.exception(e)
        return dest_object_names

    return dest_object_names    

