const {MongoClient, ObjectID} = require('mongodb')

let obj = new ObjectID()
console.log(obj)

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log(`Unable to connect to Mongodb server: ${err}`)
  }

  console.log('Connected to MongoDB server')

  // db.collection('Todos').insertOne({
  //   text: 'smthing to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to unsert todo', err)
  //   }

  //   console.log(JSON.stringify(result.ops, undefined, 2))
  // })
  // db.collection('Users').insertOne({
  //   name: 'Sergey',
  //   age: 23,
  //   location: 'Mother Russia'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo', err)
  //   }

  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp()))
  // })

  db.close()
})

