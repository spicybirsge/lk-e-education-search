const mongo = require("mongoose")

module.exports = async () => {
await mongo.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
return mongo
}
mongo.connection.on('connected', () => {
  console.log("[^] Database Connected")
})