import boto3
import json
# List the KMS Keys by ID
kms_client = boto3.client('kms', region_name='us-east-1')
try:
    response = kms_client.list_keys()
except ClientError as e:
    logging.error(e)
 
print(json.dumps(response, indent=4, sort_keys=True))