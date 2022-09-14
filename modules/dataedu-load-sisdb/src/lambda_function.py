# MIT No Attribution

# Copyright (c) 2021 Amazon Web Services (AWS)

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
import sisdb
import boto3
import logging
logger = logging.getLogger(__name__)

def lambda_handler(event, context):
    lmb = boto3.client('lambda')

    print(json.dumps(event))

    if "tablename" not in event:
        print("initializing sisDB")
        sisdb.initEmptySISDb(drop_on_exception=True)
        sisdb.initEmptySISDbTables(drop_on_exception=True)
        
        tables = sisdb.sisTables()
        nextT = 0
        nextTable = tables[nextT]
        
        event["nextT"] = nextT + 1
        event["tablename"] = nextTable
        event["reinvoke"] = True

        # stop here and call this function again
        print('invoking another instance for table {} and exiting this one'.format(nextTable))

        status = lmb.invoke(
            FunctionName=context.function_name,
            InvocationType='Event',
            Payload=json.dumps(event),
            )
    else:
        nextT = event["nextT"]
        tablename = event["tablename"]

        print("Calling loadInitialData('{}')".format(tablename))
        sisdb.loadInitialData(tablename)

        tables = sisdb.sisTables()
        if nextT < len(tables):
            
            nextTable = tables[nextT]
            
            
            event["nextT"] = nextT + 1
            event["tablename"] = nextTable
            event["reinvoke"] = True
    
            # stop here and call this function again
            print('invoking another instance for table {} and exiting this one'.format(nextTable))
    
            status = lmb.invoke(
                FunctionName=context.function_name,
                InvocationType='Event',
                Payload=json.dumps(event),
                )

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
