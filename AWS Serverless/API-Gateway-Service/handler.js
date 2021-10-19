'use strict';

module.exports.hello = async (event, context, callback) => {


  const done = (err, res) => {
    callback(null, {
      status: err ? '200' : '400',
      body: err ? err.message : res,
      headers: {
        "Content-Type": 'application/json'
      }
    })
  }


  switch (event.httpMethod) {
    case 'GET':
      done(null, `${event.httpMethod} was called! `)
      break;
    default:
      console.log(`Other http Method was called- Unsupported Method (${event.httpMethod})`)
      done(new Error(`Unsupported format was called - method ${event.httpMethod}`))
      break;
  }


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
