# Data EDU Stack

This CDK is used to generate the CloudFormation template used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day). 

## Description
This CDK is used to generate the CloudFormation template used by the [DataEDU - Higher Education Data Lake Immersion Day](https://immersionday.com/dataedu-immersion-day)

We implement a CDK app with an instance of a stack (`DataEduEeStack`).  The `cdk.json` file tells the CDK Toolkit how to execute the app.

## Useful commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Usage
This CDK app is not intended to be used standalone.  Rather it is part a reusable demo of Redshift & Redshift Spectrum features in the context of the Data EDU Higher Education Data Lake sample data set.  Full instructions are below.

## Support
This CDK app and the related demo are maintained by the **Higher Education Data Community of Practice**.  See our
(wiki))[https://w.amazon.com/bin/view/AWS/Teams/WWPS/SA/SLGEDU/Verticals/Education/HEdData/Community_of_Practice] for more information or reach us on Slack at (#wwps-slg-edu-cop-highered-data)[https://amzn-aws.slack.com/archives/C037QARM20G].

## License
MIT-0
