import boto3
 
kms_client = boto3.client('kms', region_name='us-west-1')
response = kms_client.schedule_key_deletion(
    KeyId='fa15d2b2-a4ae-458a-84c2-9d5b6c9c952f',
    PendingWindowInDays=7
)
print(response, indent=4, sort_keys=True)