# Data EDU Load SIS DB

This lambda function is used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) to populate an RDS database that simulates the application databasea for a Student Information System (SIS). 

## Description
TThis lambda function is used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) to populate an RDS database that simulates the application databasea for a Student Information System (SIS). 
It uses publicly accessible data stored in an Event Engine backend module to load data into the RDS MySQL instance that is stored in the account in which this Lambda function is invoked.  This demo SIS database is then used as a 
data source for labs that populate SIS data into the data lake.

## Usage
This funtion is not intended to be used standalone.  Rather it is deployed on your behalf when you create a [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day) environment in Event Engine.  Find out more at (here)[https://immersionday.com/dataedu-immersion-day/how-to-host]

## Support
This function, and the immersion day it is part of, are maintained by the **Higher Education Data Community of Practice**.  See our
(wiki))[https://w.amazon.com/bin/view/AWS/Teams/WWPS/SA/SLGEDU/Verticals/Education/HEdData/Community_of_Practice] for more information or reach us on Slack at (#wwps-slg-edu-cop-highered-data)[https://amzn-aws.slack.com/archives/C037QARM20G].

## License
MIT-0
