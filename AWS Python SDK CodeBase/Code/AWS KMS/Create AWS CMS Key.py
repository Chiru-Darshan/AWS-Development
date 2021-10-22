import boto3
import json
 
kms_client = boto3.client('kms', region_name='us-east-1')
 
response = kms_client.create_key(
    Description='My KMS Key',
    KeyUsage='ENCRYPT_DECRYPT',
    Origin='AWS_KMS',
    Tags=[
        {
            'TagKey': 'KeyPurpose',
            'TagValue': 'dev-on-aws-key'
        },
    ]
)
 
print(response)