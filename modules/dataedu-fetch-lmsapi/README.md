# DataEDU Fetch LMSAPI

This lambda function is used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) to simulate fetching learning management system (LMS) data from an API. 

## Description
This lambda function is used as part of the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day). It simulates obtaining data for the data lake by invoking a SaaS solutions' API and storing the results in an Amazon S3 bucket that is part of the data lake.  The solution is patterned after Instructure Canvas' Data Service API.

## Usage
This funtion is not intended to be used standalone.  Rather it is deployed on your behalf when you create a [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) environment in Event Engine.  Find out more at (here)[https://immersionday.com/dataedu-immersion-day/how-to-host]

## Support
This function, and the immersion day it is part of, are maintained by the **Higher Education Data Community of Practice**.  See our
(wiki))[https://w.amazon.com/bin/view/AWS/Teams/WWPS/SA/SLGEDU/Verticals/Education/HEdData/Community_of_Practice] for more information or reach us on Slack at (#wwps-slg-edu-cop-highered-data)[https://amzn-aws.slack.com/archives/C037QARM20G].

## License
MIT-0
