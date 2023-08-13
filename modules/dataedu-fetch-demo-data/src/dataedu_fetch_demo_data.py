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


import os
import s3_util

def get_env_vars():
    global profile_name
    global region_name

    global source_data_bucket_name
    global sis_demo_mock_data_prefix
    global lms_demo_mock_data_prefix

    global raw_data_bucket_name
    global sis_demo_raw_data_prefix
    global lms_demo_raw_data_prefix

    profile_name = ''
    region_name = os.environ['AWS_REGION']

    source_data_bucket_name = os.environ['SOURCE_DATA_BUCKET_NAME']
    sis_demo_mock_data_prefix = os.environ['SIS_DEMO_MOCK_DATA_PREFIX']
    lms_demo_mock_data_prefix = os.environ['LMS_DEMO_MOCK_DATA_PREFIX']
    raw_data_bucket_name = os.environ['RAW_DATA_BUCKET_NAME']
    sis_demo_raw_data_prefix = os.environ['SIS_DEMO_RAW_DATA_PREFIX']
    lms_demo_raw_data_prefix = os.environ['LMS_DEMO_RAW_DATA_PREFIX']

    # DEBUG
    print("get_env_vars:")
    print("profile_name: %s" % (profile_name))
    print("region_name: %s" % (region_name))
    print("source_data_bucket_name: %s" % (source_data_bucket_name))
    print("sis_demo_mock_data_prefix: %s" % (sis_demo_mock_data_prefix))
    print("lms_demo_mock_data_prefix: %s" % (lms_demo_mock_data_prefix))
    print("raw_data_bucket_name: %s" % (raw_data_bucket_name))
    print("sis_demo_raw_data_prefix: %s" % (sis_demo_raw_data_prefix))
    print("lms_demo_raw_data_prefix: %s" % (lms_demo_raw_data_prefix))


def lambda_handler(event, context):
    # start
    print('\nStarting data-edu-fetch-demo-data.lambda_handler ...')
    print("event: %s" % (event))
    print("context: %s" % (context))

    # get environment variables
    get_env_vars()

    # get SIS demo mock data objects
    sis_demo_source_object_names = s3_util.get_s3_object_names(sis_demo_mock_data_prefix)
    num_sis_demo_source_object_names = len(sis_demo_source_object_names)

    print("sis_demo_source_object_names: ")
    print(sis_demo_source_object_names)
    print("Total # of SIS demo source objects: %d" % num_sis_demo_source_object_names)

    # copy to SIS demo raw data objects
    sis_demo_dest_object_names = s3_util.copy_s3_objects(profile_name, region_name, \
        source_data_bucket_name, sis_demo_mock_data_prefix, sis_demo_source_object_names, \
        raw_data_bucket_name, sis_demo_raw_data_prefix)
    num_sis_demo_dest_object_names = len(sis_demo_dest_object_names)

    print("sis_demo_dest_object_names: ")
    print(sis_demo_dest_object_names)
    print("Total # of SIS demo dest objects: %d" % num_sis_demo_dest_object_names)

    # get LMS demo mock data objects
    lms_demo_source_object_names = s3_util.get_s3_object_names(lms_demo_mock_data_prefix)
    num_lms_demo_source_object_names = len(lms_demo_source_object_names)

    print("lms_demo_source_object_names: ")
    print(lms_demo_source_object_names)
    print("Total # of LMS demo source objects: %d" % num_lms_demo_source_object_names)
    
    # copy to LMS demo raw data objects
    lms_demo_dest_object_names = s3_util.copy_s3_objects(profile_name, region_name, \
        source_data_bucket_name, lms_demo_mock_data_prefix, lms_demo_source_object_names, \
        raw_data_bucket_name, lms_demo_raw_data_prefix)
    num_lms_demo_dest_object_names = len(lms_demo_dest_object_names)

    print("lms_demo_dest_object_names: ")
    print(lms_demo_dest_object_names)
    print("Total # of LMS demo dest objects: %d" % num_lms_demo_dest_object_names)

    # end
    print('\n... Thaaat\'s all, Folks!')


if __name__ == '__main__':
    event = {}
    context = {}
    lambda_handler(event, context)

