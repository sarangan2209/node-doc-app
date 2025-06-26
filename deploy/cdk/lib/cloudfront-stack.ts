import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CustomStack, CustomStackProps } from './stack';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export class s3CdnStack extends CustomStack {
  constructor(scope: Construct, props: CustomStackProps, stackName: string) {
    super(scope, props, stackName);
    new s3Cdn(this, props, stackName);
  }
}
export class s3Cdn extends Construct {
  constructor(scope: CustomStack, props: CustomStackProps, stackName: string) {
    super(scope, stackName);

    const projectName = scope.projectName;
    const environment = scope.projectEnvironment;
    const domainName = 'jsdoc.silo.tecofize.in';

    const codeBaseBucket = new s3.Bucket(this, `${projectName}-deploy-bucket`, {
      bucketName: `silo-${projectName}-${environment}`,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      autoDeleteObjects: true,
    });

    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'SiteCertificate',
      'arn:aws:acm:us-east-1:533267230957:certificate/42919b9c-9429-47b0-8e2f-b52001a615a6'
    );

    const oai = new cloudfront.OriginAccessIdentity(this, 'ReactOAI');

    const bucketPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:ListBucket'],
      effect: iam.Effect.ALLOW,
      resources: [codeBaseBucket.bucketArn, `${codeBaseBucket.bucketArn}/*`],
      principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
    });

    codeBaseBucket.addToResourcePolicy(bucketPolicy);

    const distribution = new cloudfront.CloudFrontWebDistribution(this, `${projectName}-cdn-distribution`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: codeBaseBucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              defaultTtl: cdk.Duration.seconds(0),
              allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              forwardedValues: {
                queryString: true,
                cookies: {
                  forward: 'all',
                },
              },
            },
          ],
        },
      ],
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      errorConfigurations: [
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
        },
      ],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [domainName],
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      }),
    });

    const distributionDomainName = distribution.distributionDomainName;

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'silo.tecofize.in',
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'jsdoc',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}


