'use strict';

// aws --profile Admin ---region us-east-1 ssm put-parameter --name learning-serverless-secret-token --value secreValue! --type String

const authorize = require("./authorize.js")
module.exports.generateToken = async (event, context) => {
    console.log(`started........`)
    console.log(`The GenerateToken got called...: ${JSON.stringify(event)}`)
    const token = authorize.generateToken(event.body || {})
    return {
        statusCode: 200,
        body: JSON.stringify({
            token: token

        })
    }
}



module.exports.authorize = async (event, context, callback) => {
    console.log(`Authorize Got Called`)
    console.log(event)
    try {
        const policy = authorize.generatePolicy(event.authorizationToken, event.methodArn)
        return policy
    }
    catch (error) {
        console.log(error)
    }
}