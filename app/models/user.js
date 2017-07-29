
var mongoose = require('mongoose'),
  md5 = require('md5'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {type:String,required:true},
  email: {type:String,required:true},
  password: {type:String,required:true},
  created:{type:Date}
});
UserSchema.methods.verifyPassword = function(password){
  var isMatch = md5(password) === this.password;
  console.log('passport.local.verifyPassword:',isMatch);
  return isMatch;
}
UserSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('User', UserSchema);

