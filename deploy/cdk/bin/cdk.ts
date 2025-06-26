#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { s3CdnStack } from '../lib/cloudfront-stack';

const projectName = 'jsdocs'

const app = new cdk.App();

// const projectEnvironment = process.env.PROJECT_ENVIRONMENT

const projectEnvironment = 'development'


const env = {
  account: process.env.AWS_ACCOUNT_ID ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
}

new s3CdnStack(app,
  {
    env: env,
    projectEnvironment: projectEnvironment,
    projectName: projectName,
    // gitRevision: process.env.GIT_REVISION ?? app.node.tryGetContext("gitRevision"),
    gitRevision: 'test',
  },
  `${projectName}-cloudfront-${projectEnvironment}-stack`
);