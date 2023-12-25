const { MongoClient } = require('mongodb')

// Create Instance of MongoClient for mongodb
const client = new MongoClient('mongodb+srv://govi:govi@cluster0.qmc6cnq.mongodb.net/PROJECT?retryWrites=true&w=majority')

// Connect to database
module.exports.connect = function () {
  client.connect()
    .then(() => {
      console.log('Connected Successfully')
      // console.log('Exiting..')
      // client.close();
    })
    .catch(error => console.log('Failed to connect', error))
}

module.exports.get = client.db('PROJECT');

