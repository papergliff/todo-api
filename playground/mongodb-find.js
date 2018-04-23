const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log(`Unable to connect to Mongodb server: ${err}`)
  }

  console.log('Connected to MongoDB server')

  // db.collection('Todos').find({
    // _id: new ObjectID('5ad5c4fe75b61146316a8d16')
  // }).toArray().then((docs) => {
    // console.log('Todos')
    // console.log(JSON.stringify(docs, undefined, 2))
  // }, (err) => {
    // console.log('Unable to fetch todos', err)
  // })

  db.collection('Users').find({name: 'Sergey'}).toArray().then((docs) => {
    console.log(`Found ${docs.length} user(s): `)
    console.log(JSON.stringify(docs, undefined, 2))
  }, (err) => {
    console.log('Unable to fetch users', err)
  })

  db.close()
})
