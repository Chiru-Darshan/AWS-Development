exports.handler = async (event, context) => {
    const response = event.Records.forEach(record => {
        const {
            body
        } = record
        console.log(body)
    });
    return {}
};