#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DataEduEeStack } from '../lib/data-edu-ee-stack';

const app = new cdk.App();
new DataEduEeStack(app, 'DataEduEeStack');
