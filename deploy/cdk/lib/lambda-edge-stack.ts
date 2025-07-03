import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CustomStackProps, CustomStack } from './stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';
export class LambdaEdgeStack extends CustomStack {
  public readonly edgeLambdaVersion: lambda.Version;
  constructor(scope: Construct, props: CustomStackProps, stackName: string) {
    super(scope, props, stackName);
    const edge = new LambdaEdge(this, props, stackName);
    this.edgeLambdaVersion = edge.edgeLambdaVersion;
  }
}
export class LambdaEdge extends Construct {
  public readonly edgeLambdaVersion: lambda.Version;
  constructor(scope: Construct, props: CustomStackProps, id: string) {
    super(scope, id);
    // const basicAuthUser = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   '/jsDoc/basic-auth/username'
    // );
    // const basicAuthPass = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   '/jsDoc/basic-auth/password'
    // );
    const edgeLambdaRole = new iam.Role(this, 'EdgeLambdaExecutionRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
    });
    const fn = new lambda.Function(this, 'BasicAuthFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      role: edgeLambdaRole,
      // environment: {
      //   BASIC_AUTH_USER: basicAuthUser,
      //   BASIC_AUTH_PASS: basicAuthPass,
      // },
    });
    fn.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    const version = fn.currentVersion;
    version.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    this.edgeLambdaVersion = version;
    new cdk.CfnOutput(this, `${id}-EdgeLambdaVersionArn`, {
      value: this.edgeLambdaVersion.functionArn,
      exportName: `${id}-EdgeLambdaVersionArn`,
    });
  }
}