var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var userSchema = new Schema({
      local: {
          username: {
            type: String,
            required: true,
            unique: true
          },
          email: {
            type: String,
            required: true,
            unique: true
          },
          name: {
            type: String,
            required: true
          },
          password: {
            type: String,
            required: true
          },
          city: String,
          country: String,
          dob: Date
      },
      facebook: {
        id: String,
        token: String,
        email: String,
        name: String
      }
    })

var User = mongoose.model('User',userSchema)
module.exports = User

module.exports.createUser = (newUser, callback)=>{
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.local.password, salt, function(err, hash) {
        // Store hash in your password DB. 
        newUser.local.password = hash
        console.log(hash)
        newUser.save(callback)
    });
});
}

module.exports.getUserByUsername = (username, callback)=>{
  User.findOne({'local.username': username}, callback)
}

module.exports.getUserById = (id, callback)=>{
  User.findById(id, callback)
}


module.exports.comparePassword = (pass1,pass2,callback)=>{
  bcrypt.compare(pass1, pass2, (err, isMatch)=>{
    if(err)
      throw err
    callback(null, isMatch)
  })
}
