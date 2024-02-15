import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as dms from "aws-cdk-lib/aws-dms";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as eb from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as glue from 'aws-cdk-lib/aws-glue';
import { Construct } from "constructs";

export class DataEduEeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DMS Role Parameter
    const createDMSRole = new cdk.CfnParameter(this, "createDMSRole", {
      allowedValues: ["true", "false"],
      constraintDescription: "Value must be set to true or false.",
      default: "true",
      description:
        "Set this value to false if the 'dms-vpc-role' IAM Role has already been created in this AWS Account.",
    });

    // Create DMS Role Condition
    const createDMSRoleCondition = new cdk.CfnCondition(
      this,
      "createDMSRoleCondition",
      {
        expression: cdk.Fn.conditionEquals(createDMSRole, "true"),
      }
    );

    // Workshop Studio Static Bucket Name Table by Region
    const wsStaticBucketNameTable = new cdk.CfnMapping(this, 'wsStaticBucketNameTable', {
      mapping: {
        'ap-northeast-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-nrt-2cb4b4649d0e0f94',
        },
        'ap-northeast-2': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-icn-ced060f0d38bc0b0',
        },
        'ap-northeast-3': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-kix-c2a28ad4e55ea53a',
        },
        'ap-south-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-bom-431207042d319a2d',
        },
        'ap-southeast-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-sin-694a125e41645312',
        },
        'ap-southeast-2': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-syd-b04c62a5f16f7b2e',
        },
        'ca-central-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-yul-5c2977cd61bca1f3',
        },
        'eu-central-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-fra-b129423e91500967',
        },
        'eu-north-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-arn-580aeca3990cef5a',
        },
        'eu-west-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-dub-85e3be25bd827406',
        },
        'eu-west-2': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-lhr-cc4472a651221311',
        },
        'eu-west-3': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-cdg-9e76383c31ad6229',
        },
        'sa-east-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-gru-527b8c19222c1182',
        },
        'us-east-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-iad-ed304a55c2ca1aee',
        },
        'us-east-2': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-cmh-8d6e9c21a4dec77d',
        },
        'us-west-1': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-sfo-f61fc67057535f1b',
        },
        'us-west-2': {
          wsStaticBucketName: 'ws-assets-prod-iad-r-pdx-f3b3f9f1a7d6a3d0',
        },
      }
    });

    // Workshop Studio Bucket Name
    const wsStaticBucketName = wsStaticBucketNameTable.findInMap(cdk.Aws.REGION, 'wsStaticBucketName');

    // Workshop Studio Static Bucket ARN
    const wsStaticBucket = s3.Bucket.fromBucketName(
      this,
      "dataeduWSStaticBucketName",
      wsStaticBucketName
    );
    const wsStaticBucketArn = wsStaticBucket.bucketArn;

    // Workshop Studio Bucket Prefix
    const wsStaticBucketPrefix = "296c402e-cadd-43f5-956b-116895a050f9/";

    // Demo Datasets Bucket Name
    const demoDatasetsBucketName = "aws-edu-cop-data-demo-datasets";

    // Demo Datasets Bucket ARN
    const demoDatasetsBucket = s3.Bucket.fromBucketName(
      this,
      "dataeduDemoDatasetsBucketName",
      demoDatasetsBucketName
    );
    const demoDatasetsBucketArn = demoDatasetsBucket.bucketArn;

    // Demo Datasets Bucket Prefix
    const demoDatasetsBucketPrefix = "data-edu/";
    
    // GUID for Raw, Curated, Results Bucket Names
    const GUID = cdk.Stack.of(this).stackId;

    // KMS Key Name
    const KeyName = "dataedu-key";

    // S3 Bucket Names
    const RawBucketName = "dataedu-raw-";
    const CuratedBucketName = "dataedu-curated-";
    const ResultsBucketName = "dataedu-results-";

    // IAM Role for dms-vpc-role
    const dmsVPCRolePolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AmazonDMSVPCManagementRole"
    );

    const dmsVPCRole = new iam.Role(this, "dataeduDMSVPCRole", {
      assumedBy: new iam.ServicePrincipal("dms.amazonaws.com"),
      roleName: "dms-vpc-role",
      managedPolicies: [dmsVPCRolePolicy],
    });

    dmsVPCRole.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Create dms-vpc-role only if the createDMSRole CFT Parameter is set to "true"
    (dmsVPCRole.node.defaultChild as iam.CfnRole).cfnOptions.condition =
      createDMSRoleCondition;

    // IAM Role for DMS Source Endpoint to Secrets Manager Access
    const dmsSourceEndpointExecutionRole = new iam.Role(
      this,
      "dataeduDMSSourceRole",
      {
        assumedBy: new iam.ServicePrincipal(
          "dms." + cdk.Stack.of(this).region + ".amazonaws.com"
        ),
        roleName: "dataedu-dms-source-execution-role",
      }
    );

    // IAM Role for DMS Target Endpoint to S3 Access
    const dmsTargetEndpointExecutionRole = new iam.Role(
      this,
      "dataeduDMSTargetRole",
      {
        assumedBy: new iam.ServicePrincipal("dms.amazonaws.com"),
        roleName: "dataedu-dms-target-execution-role",
      }
    );

    // IAM Role for SIS Import Lambda Execution Role
    const sisLambdaExecutionRole = new iam.Role(this, "dataeduSISImportRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "dataedu-sis-import-lambda-execution-role",
    });

    // IAM Role for LMS S3 Fetch Lambda Execution Role
    const lmsS3FetchRole = new iam.Role(this, "dataeduLMSS3FetchRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "dataedu-fetch-s3-lambda-role",
    });

    // IAM Role for LMS API Fetch Lambda Execution Role
    const lmsAPIFetchRole = new iam.Role(this, "dataeduLMSAPIFetchRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "dataedu-fetch-s3-data-role",
    });

    // Key Policy json
    const keyPolicyJson = {
      Id: "key-consolepolicy-3",
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "Enable IAM User Permissions",
          Effect: "Allow",
          Principal: {
            AWS: "arn:aws:iam::" + cdk.Stack.of(this).account + ":root",
          },
          Action: "kms:*",
          Resource: "*",
        },
      ],
    };

    // Create KMS Policy (CDK does not generate UI Editable KMS Policy)
    // MANUALLY ADD TO KEY POLICY IN SYNTHESIZED JSON: "Id": "key-consolepolicy-3"
    // This enables adding users to the Key Policy via the IAM UI
    const keyPolicy = iam.PolicyDocument.fromJson(keyPolicyJson);

    // Create KMS Key
    const key = new kms.Key(this, "dataeduKMS", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pendingWindow: cdk.Duration.days(7),
      alias: KeyName,
      description: "KMS key to encrypt objects in the dataEDU S3 buckets.",
      enableKeyRotation: true,
      policy: keyPolicy,
    });

    // Create RAW Bucket
    const rawBucket = new s3.Bucket(this, "dataeduRawBucket", {
      bucketName: cdk.Fn.join("", [RawBucketName, GUID]),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    });

    rawBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${rawBucket.bucketArn}/*`],
        conditions: {
          StringEquals: { "s3:x-amz-server-side-encryption": "AES256" },
        },
      })
    );

    rawBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${rawBucket.bucketArn}/*`],
        conditions: {
          StringNotLikeIfExists: {
            "s3:x-amz-server-side-encryption-aws-kms-key-id": key.keyArn,
          },
        },
      })
    );

    // Create CURATED Bucket
    const curatedBucket = new s3.Bucket(this, "dataeduCuratedBucket", {
      bucketName: cdk.Fn.join("", [CuratedBucketName, GUID]),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    });

    curatedBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${curatedBucket.bucketArn}/*`],
        conditions: {
          StringEquals: { "s3:x-amz-server-side-encryption": "AES256" },
        },
      })
    );

    curatedBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${curatedBucket.bucketArn}/*`],
        conditions: {
          StringNotLikeIfExists: {
            "s3:x-amz-server-side-encryption-aws-kms-key-id": key.keyArn,
          },
        },
      })
    );

    // Create RESULTS Bucket
    const resultsBucket = new s3.Bucket(this, "dataeduResultsBucket", {
      bucketName: cdk.Fn.join("", [ResultsBucketName, GUID]),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    });

    resultsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${resultsBucket.bucketArn}/*`],
        conditions: {
          StringEquals: { "s3:x-amz-server-side-encryption": "AES256" },
        },
      })
    );

    resultsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:PutObject"],
        resources: [`${resultsBucket.bucketArn}/*`],
        conditions: {
          StringNotLikeIfExists: {
            "s3:x-amz-server-side-encryption-aws-kms-key-id": key.keyArn,
          },
        },
      })
    );

    // Create VPC
    const vpc = new ec2.Vpc(this, "dataeduVPC", {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 2,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "dataedu-public-",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: false,
        },
        {
          name: "dataedu-private-",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
      restrictDefaultSecurityGroup: false,
    });

    // Create RDS Secret
    const rdsSecret = new secretsmanager.Secret(this, "dataeduRDSSecret", {
      secretName: "dataedu-rds-secret",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "admin" }),
        generateStringKey: "password",
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Grant DMS Target Endpoint Role access to S3 Bucket + KMS Key
    rawBucket.grantReadWrite(dmsTargetEndpointExecutionRole);

    // Grant DMS Source Endpoint Role access to KMS Key (for Secrets Manager) + Secrets Manager Values
    key.grantDecrypt(dmsSourceEndpointExecutionRole);
    rdsSecret.grantRead(dmsSourceEndpointExecutionRole);

    // Grant SIS Import Lambda Function access to KMS Key + Secrets Manager Secret Values
    key.grantDecrypt(sisLambdaExecutionRole);
    rdsSecret.grantRead(sisLambdaExecutionRole);

    // Create RDS Instance Security Group
    const rdsInstanceSG = new ec2.SecurityGroup(this, "dataeduRDSsg", {
      vpc: vpc,
      allowAllOutbound: true,
      description: "DataEDU RDS Instance security group",
    });

    // Create DMS Instance Security Group
    const dmsInstanceSG = new ec2.SecurityGroup(this, "dataeduDMSsg", {
      vpc: vpc,
      allowAllOutbound: true,
      description: "DataEDU DMS Instance security group",
    });

    // Create SIS Import Lambda Function Security Group
    const sisLambdaSG = new ec2.SecurityGroup(this, "dataeduLambdasg", {
      vpc: vpc,
      allowAllOutbound: true,
      description: "DataEDU SIS Import Lambda Function security group",
    });

    // Allow DMS SG to communicate to RDS SG
    rdsInstanceSG.connections.allowFrom(
      new ec2.Connections({ securityGroups: [dmsInstanceSG] }),
      ec2.Port.tcp(3306),
      "DMS to RDS (MySQL)"
    );

    // Allow SIS Import Lambda Function SG to communicate to RDS SG
    rdsInstanceSG.connections.allowFrom(
      new ec2.Connections({ securityGroups: [sisLambdaSG] }),
      ec2.Port.tcp(3306),
      "SIS Import Lambda to RDS (MySQL)"
    );

    // Create RDS Instance, defaults to m5.large
    const rdsInstance = new rds.DatabaseInstance(this, "dataeduRDSInstance", {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      credentials: rds.Credentials.fromSecret(rdsSecret),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [rdsInstanceSG],
      storageEncrypted: true,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      publiclyAccessible: false,
      allocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      instanceIdentifier: "dataedu-rds-instance",
    });

    // Convert ISubnet array into an array of strings for the L1 replication subnet group
    const privateSubnetIds = vpc.privateSubnets.map(function (item) {
      return item["subnetId"];
    });

    // Create L1 DMS Replication Subnet Group
    const dmsSubnetGroup = new dms.CfnReplicationSubnetGroup(
      this,
      "dataeduDMSSubnetGroup",
      {
        replicationSubnetGroupIdentifier: "dataedu-replication-subnet-group",
        replicationSubnetGroupDescription: "dataedu-replication-subnet-group",
        subnetIds: privateSubnetIds,
      }
    );

    // Create L1 DMS Instance
    const dmsInstance = new dms.CfnReplicationInstance(
      this,
      "dataeduDMSInstance",
      {
        replicationInstanceClass: "dms.t3.micro",
        replicationInstanceIdentifier: "dataedu-dms-replication-instance",
        replicationSubnetGroupIdentifier: dmsSubnetGroup.ref,
        vpcSecurityGroupIds: [dmsInstanceSG.securityGroupId],
        allocatedStorage: 20,
        publiclyAccessible: false,
      }
    );

    // Create L1 DMS Source Endpoint
    const dmsSourceEndpoint = new dms.CfnEndpoint(
      this,
      "dataeduDMSSourceEndpoint",
      {
        endpointType: "source",
        engineName: "mysql",
        endpointIdentifier: "dataedu-dms-source-endpoint",
        mySqlSettings: {
          secretsManagerSecretId: rdsSecret.secretArn,
          secretsManagerAccessRoleArn: dmsSourceEndpointExecutionRole.roleArn,
        },
      }
    );

    // Adds a dependency to the DMS Source Endpoint, so on stack delete the DMS Source Endpoint is deleted before the dms-vpc-role
    //dmsSourceEndpoint.node.addDependency(lmsS3FetchRole);

    // Create L1 DMS Target Endpoint
    /*    const dmsTargetEndpoint = new dms.CfnEndpoint(
      this,
      "dataeduDMSTargetEndpoint",
      {
        endpointType: "target",
        engineName: "s3",
        endpointIdentifier: "dataedu-dms-target-endpoint",
        s3Settings: {
          bucketName: rawBucket.bucketName,
          serviceAccessRoleArn: dmsTargetEndpointExecutionRole.roleArn,
          bucketFolder: "sisdb",
        },
        extraConnectionAttributes: `encryptionMode=SSE_KMS;serverSideEncryptionKmsKeyId=${key.keyArn};dataFormat=parquet`,
      }
    );*/

    // Create SIS Import Lambda Function Layer for MySQL
    const sisLambdaLayer = new lambda.LayerVersion(
      this,
      "dataeduSISLambdaLayer",
      {
        code: lambda.Code.fromBucket(
          wsStaticBucket,
          wsStaticBucketPrefix + "v1/lambda/mysql_layer.zip"
        ),
        compatibleRuntimes: [
          lambda.Runtime.PYTHON_3_9,
        ],
      }
    );

    // Create SIS Import Lambda Function
    const sisLambdaImport = new lambda.Function(
      this,
      "dataeduSISLambdaFunction",
      {
        code: lambda.Code.fromBucket(
          wsStaticBucket,
          wsStaticBucketPrefix + "v1/lambda/dataedu-load-sisdb.zip"
        ),
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: "lambda_function.lambda_handler",
        functionName: "dataedu-load-sisdb",
        memorySize: 1769,
        timeout: cdk.Duration.seconds(900),
        layers: [sisLambdaLayer],
        environment: {
          secret_name: rdsSecret.secretName,
          region_name: cdk.Stack.of(this).region,
        },
        vpc: vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        role: sisLambdaExecutionRole,
        securityGroups: [sisLambdaSG],
      }
    );

    // Add policies to SIS Import Lambda Execution Role
    sisLambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:AttachNetworkInterface",
        ],
        resources: [
          "arn:aws:ec2:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":*",
        ],
      })
    );
    sisLambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ec2:DescribeNetworkInterfaces"],
        resources: ["*"],
      })
    );
    sisLambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        resources: [
          "arn:aws:lambda:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":function:dataedu-*",
        ],
      })
    );
    // Add policies in order to create CloudWatch log group and log stream
    // https://aws.amazon.com/premiumsupport/knowledge-center/lambda-cloudwatch-log-streams-error/
    sisLambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":*",
        ],
      })
    );
    sisLambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":log-group:/aws/lambda/dataedu-load-sisdb:*",
        ],
      })
    );

    // Create LMS Config Parameter
    const lmsSSMParam = new ssm.StringParameter(this, "dataeduSSMParam", {
      parameterName: "/dataedu/lms-demo/state",
      description: "SSM Parameter for mock LMS integration.",
      stringValue:
        '{"base_url":"' +
        wsStaticBucketName +
        '.s3.amazonaws.com/' +
        wsStaticBucketPrefix +
        'v1/mockdata/lms_demo",' +
        '"version": "v1", "current_date": "2020-08-17", "perform_initial_load": "1",' +
        '"target_bucket":"' +
        rawBucket.bucketName + '",' +
        '"base_s3_prefix":"lmsapi"}',
    });

    // Create LMS S3 Fetch Lambda Function
    const lmsS3FetchLambda = new lambda.Function(
      this,
      "dataeduLMSS3FetchLambda",
      {
        code: lambda.Code.fromBucket(
          wsStaticBucket,
          wsStaticBucketPrefix + "v1/lambda/dataedu-fetch-s3-data.zip"
        ),
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: "lambda_handler.lambda_handler",
        functionName: "dataedu-fetch-s3-data",
        memorySize: 1769,
        timeout: cdk.Duration.seconds(600),
        role: lmsS3FetchRole,
        description:
          "Lambda function that fetches a file from a URL and stores it in a S3 bucket",
      }
    );

    // Add policies to LMS S3 Fetch Lambda Execution Role
    lmsS3FetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:ListBucket"],
        resources: [rawBucket.bucketArn],
      })
    );
    lmsS3FetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        resources: [rawBucket.bucketArn + "/*"],
      })
    );
    // Add policies in order to create CloudWatch log group and log stream
    // https://aws.amazon.com/premiumsupport/knowledge-center/lambda-cloudwatch-log-streams-error/
    lmsS3FetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":*",
        ],
      })
    );
    lmsS3FetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":log-group:/aws/lambda/dataedu-fetch-s3-data:*",
        ],
      })
    );

    // Create LMS API Fetch Lambda Function
    const lmsAPIFetchLambda = new lambda.Function(
      this,
      "dataeduLMSAPIFetchLambda",
      {
        code: lambda.Code.fromBucket(
          wsStaticBucket,
          wsStaticBucketPrefix + "v1/lambda/dataedu-fetch-lmsapi.zip"
        ),
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: "lambda_function.lambda_handler",
        functionName: "dataedu-fetch-lmsapi",
        memorySize: 1769,
        timeout: cdk.Duration.seconds(600),
        role: lmsAPIFetchRole,
        description:
          "Lambda function that mimics invoking an API to obtain data from a SaaS app",
      }
    );

    // Create EventBridge Rule
    const lmsAPIEventRule = new eb.Rule(this, "dataeduEventBridgeRule", {
      description: "Invokes demo API on a scheduled basis",
      ruleName: "dataedu-lmsapi-sync",
      schedule: eb.Schedule.rate(cdk.Duration.minutes(1)),
      enabled: false,
    });

    // Add Lambda Target to Event Rule
    lmsAPIEventRule.addTarget(new targets.LambdaFunction(lmsAPIFetchLambda));

    // Add policies to LMS API Fetch Lambda Execution Role
    lmsAPIFetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ssm:PutParameter", "ssm:GetParameter"],
        resources: [lmsSSMParam.parameterArn],
      })
    );
    lmsAPIFetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        resources: [
          "arn:aws:lambda:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":function:dataedu-*",
        ],
      })
    );
    lmsAPIFetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["events:DisableRule"],
        resources: [
          "arn:aws:events:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":rule/dataedu-lmsapi-sync",
        ],
      })
    );
    // Add policies in order to create CloudWatch log group and log stream
    // https://aws.amazon.com/premiumsupport/knowledge-center/lambda-cloudwatch-log-streams-error/
    lmsAPIFetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":*",
        ],
      })
    );
    lmsAPIFetchRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":log-group:/aws/lambda/dataedu-fetch-lmsapi:*",
        ],
      })
    );

    // Create IAM role for dataedu-fetch-demo-data Lambda Function
    const fetchDemoDataLambdaRole = new iam.Role(this, "dataeduFetchDemoDataLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "dataedu-fetch-demo-data-role",
    });

    // Add policies in order to read from demo datasets bucket and write to raw bucket
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:List*"],
        resources: [
          wsStaticBucketArn,
          rawBucket.bucketArn,
        ],
      })
    );
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [
          wsStaticBucketArn + "/*",
          rawBucket.bucketArn + "/*",
        ],
      })
    );
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:DeleteObject"],
        resources: [rawBucket.bucketArn + "/*"],
      })
    );

    // Add policies to invoke Lambda function asynchronously
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        resources: [
          "arn:aws:lambda:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":function:dataedu-*",
        ],
      })
    );
    
    // Add policies in order to create CloudWatch log group and log stream
    // https://aws.amazon.com/premiumsupport/knowledge-center/lambda-cloudwatch-log-streams-error/
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":*",
        ],
      })
    );
    fetchDemoDataLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [
          "arn:aws:logs:" +
            cdk.Stack.of(this).region +
            ":" +
            cdk.Stack.of(this).account +
            ":log-group:/aws/lambda/dataedu-fetch-demo-data:*",
        ],
      })
    );

    // Create LMS S3 Fetch Lambda Function
    const fetchDemoDataLambda = new lambda.Function(
      this,
      "dataeduFetchDemoDataLambda",
      {
        code: lambda.Code.fromBucket(
          wsStaticBucket,
          wsStaticBucketPrefix + "v1/lambda/dataedu-fetch-demo-data.zip"
        ),
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: "dataedu_fetch_demo_data.lambda_handler",
        functionName: "dataedu-fetch-demo-data",
        memorySize: 1769,
        timeout: cdk.Duration.seconds(900),
        role: fetchDemoDataLambdaRole,
        environment: {
          SOURCE_DATA_BUCKET_NAME: wsStaticBucketName,
          SIS_DEMO_MOCK_DATA_PREFIX: wsStaticBucketPrefix + 'v1/mockdata/sis_demo_parquet/',
          LMS_DEMO_MOCK_DATA_PREFIX: wsStaticBucketPrefix + 'v1/mockdata/lms_demo/v1/',
          RAW_DATA_BUCKET_NAME: rawBucket.bucketName,
          SIS_DEMO_RAW_DATA_PREFIX: 'sisdb/sisdemo/',
          LMS_DEMO_RAW_DATA_PREFIX: 'lmsapi/'
        },
        description:
          "Lambda function that fetches demo data from source data bucket and \
          copies the data objects to raw data bucket.",
      }
    );

    // IAM Role for Fetch Demo Data Lambda Execution Role
    const glueCrawlerRole = new iam.Role(this, 'dataeduGlueCrawlerRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      roleName: "dataedu-glue-crawler-role",
    });

    // Add AmazonS3FullAccess in order to acccess raw data bucket
    glueCrawlerRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')
    );
    
    // Add policies in order to read raw bucket
    glueCrawlerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:List*"],
        resources: [rawBucket.bucketArn],
      })
    );
    glueCrawlerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [rawBucket.bucketArn + "/*"],
      })
    );

    // Set Raw Bucket Path
    const rawBucketPath = 's3://'+rawBucket.bucketName+'/';

    // lmsdemo_crawler: Crawls S3 target path; creates db_raw_lmsdemo tables
    const lmsdemoCrawler = new glue.CfnCrawler(this, 'dataeduLmsdemoCrawler', {
      role: glueCrawlerRole.roleArn,
      targets: {
        s3Targets: [{
          path: rawBucketPath+'lmsapi/',
        }],
      },
    
      // the properties below are optional
      databaseName: 'db_raw_lmsdemo',
      description: 'LMS demo data crawler.',
      name: 'dataedu-lmsdemo-crawler',
    });
    
    // sisdemo_crawler: Crawls S3 target path; creates db_raw_sisdemo tables
    const sisdemoCrawler = new glue.CfnCrawler(this, 'dataeduSisdemoCrawler', {
      role: glueCrawlerRole.roleArn,
      targets: {
        s3Targets: [{
          path: rawBucketPath+'sisdb/sisdemo/',
        }],
      },
    
      // the properties below are optional
      databaseName: 'db_raw_sisdemo',
      description: 'SIS demo data crawler.',
      name: 'dataedu-sisdemo-crawler',
    });
  }
}
