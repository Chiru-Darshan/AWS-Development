'use strict';

const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
})
const s3 = new AWS.S3()



const getFileName = (key, isAThumbnail) => {

    let fileName = key.split('/')[1]
    if (isAThumbnail) {
        fileName = fileName + "_thumbnail"
    }
    return fileName

}

const getSignedURL = async (bucket, key) => {
    try {
        let params = {
            Bucket: bucket,
            Key: key
        }
        let signedURL = await s3.getSignedUrl('getObject', params)
        console.log(`signed URL : ${signedURL}`)
        return signedURL

    } catch (err) {
        console.log(`Error Occurred Fetching Signed URL : ${err}`)
    }
}



module.exports.getImage = async (imageId) => {
    console.log('get Image got invoked' + imageId)
    try {
        console.log(`fetching image....`)
        const params = {
            Key: {
                ImageId: imageId
            },
            TableName: process.env.IMAGE_METADATA_TABLE_NAME
        }


        const data = await dynamo.get(params).promise()
        console.log(`the data: ${JSON.stringify(data)}`)
        return data.Item

    } catch (err) {
        console.log(`Error : ${err}`)
    }
}

const updateImage = async (imageId, thumbnails) => {
    try {
        console.log(`updating Image Metadata`)
        const params = {
            TableName: process.env.IMAGE_METADATA_TABLE_NAME,
            Key: {
                ImageId: ImageId
            },
            ConditionExpression: "attribute_exists(ImageId)",
            UpdateExpression: "set thumbnails= :t",
            ExpressionAttributeValues: {
                ":t": thumbnails

            },
            ReturnValues: 'ALL_NEW'
        }

        console.log(params)
        const data = await dynamo.update(params).promise()
        return data.Attributes
    } catch (err) {
        console.log(`Error : ${err}`)
    }
}


module.exports.main = async (bucket, key, isAThumbnail) => {
    try {

        console.log(`Dynamo DB........`)

        let image = {}
        image['ImageId'] = getFileName(key, isAThumbnail)
        image['key'] = key
        image['bucket'] = bucket
        image['imageURL'] = getSignedURL(bucket, key)
        image['thumbnails'] = []
        image['isAThumbnail'] = isAThumbnail

        console.log(` image data :${JSON.stringify(image)}`)
        let params = {
            TableName: process.env.IMAGE_METADATA_TABLE_NAME,
            Item: image
        }
        console.log(` image data :${JSON.stringify(image)}`)
        params = {
            TableName: 'images-metadata',
            Item: image
        }
        let status = await dynamo.put(params).promise()
        console.log(`Success: ${JSON.stringify(status)}`)
    } catch (err) {
        console.log(`Error : ${err}`)
    }

}