var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var userSchema = new Schema({
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
  }},{
  timestamps: true
})

var User = mongoose.model('User',userSchema)
module.exports = User

module.exports.createUser = (newUser, callback)=>{
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        // Store hash in your password DB. 
        newUser.password = hash
        console.log(hash)
        newUser.save(callback)
    });
});
}

module.exports.getUserByUsername = (username, callback)=>{
  User.findOne({username: username}, callback)
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
