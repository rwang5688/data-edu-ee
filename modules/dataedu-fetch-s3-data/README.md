# DataEDU Fetch S3 Data

This lambda function is used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) to fetch demo data from an Event Engine backend module so simulate accessing data provided by an LMS API as Amazon S3 objects. 

## Description
This lambda function is used as part of the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day). When passed an event object containing the path to an S3 object along with a target location the function attempts to copy the object from its source location (which can for the purposes of the immersion day is a publicly accessible area maintained by an Event Engine backend module) to a target location in the account in which the Lambda function executes.

## Usage
This funtion is not intended to be used standalone.  Rather it is deployed on your behalf when you create a [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) environment in Event Engine.  Find out more at (here)[https://immersionday.com/dataedu-immersion-day/how-to-host]

## Support
This function, and the immersion day it is part of, are maintained by the **Higher Education Data Community of Practice**.  See our
(wiki))[https://w.amazon.com/bin/view/AWS/Teams/WWPS/SA/SLGEDU/Verticals/Education/HEdData/Community_of_Practice] for more information or reach us on Slack at (#wwps-slg-edu-cop-highered-data)[https://amzn-aws.slack.com/archives/C037QARM20G].

## License
MIT-0
