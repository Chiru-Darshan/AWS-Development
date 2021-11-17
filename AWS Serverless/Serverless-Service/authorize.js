'use strict';

const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET_KEY
const APPLICATION_ID = "007"
const APPLICATION_SECRET = "darshan"
module.exports.generateToken = (jsonToSign) => {

    console.log(`JSON To Sign : ${JSON.stringify(jsonToSign)}`)

    return jwt.sign(jsonToSign, SECRET)


}



module.exports.generatePolicy = (token, methodArn) => {
    console.log('generate Policy got Called...')
    console.log(`token : ${JSON.stringify(token)} and methodArn : ${methodArn}`)
    if (decodeToken(token) != null) {
        return buildPolicy('user', 'Allow', methodArn)
    } else {
        throw Error('Unauthorized')
    }

}


const decodeToken = (token) => {
    try {
        var decoded = jwt.verify(token, SECRET)
        var hasValidAppId = decoded.applicationId && decoded.applicationId === APPLICATION_ID
        var hasValidSecretId = decoded.applicationSecretId && decoded.applicationSecretId === APPLICATION_SECRET
        console.log(`decoded : ${decoded}`)
        console.log(`decoded.applicationId : ${decoded.applicationId}`)
        console.log(`decoded.applicationSecretId : ${decoded.applicationSecretId}`)
        if (hasValidAppId && hasValidSecretId) {
            console.log('valid body')
            return decoded
        } else {
            console.log('valid body')
            Throw(new Error)
        }

    } catch (err) {
        return null
    }

}

const buildPolicy = (principalId, effect, resource) => {
    var authResponse = {}
    authResponse.principalId = principalId
    if (effect && resource) {
        var policyDocument = {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:invoke',
                Effect: effect,
                Resource: resource
            }]
        }
        authResponse.policyDocument = policyDocument
    }

    return authResponse


}