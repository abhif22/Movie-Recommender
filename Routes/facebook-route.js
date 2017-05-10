var router = require('express').Router()
var User = require('../models/user.js')

var passport = require('passport')

var FacebookStrategy = require('passport-facebook').Strategy

router.get('/logout',(req,res)=>{
	req.logout();
	req.flash('success_msg','Successfully Logged Out!')
	return res.redirect('/users/login')
})

 //CONFIGURATION
    var FACEBOOK_APP_ID = '1907256159563750',
        FACEBOOK_APP_SECRET = '52f1107f1cf1b442d13061426ffa4a64'

passport.use(new FacebookStrategy({
	clientID: FACEBOOK_APP_ID,
	clientSecret: FACEBOOK_APP_SECRET,
	callbackURL: 'http://localhost:8080/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
},(accessToken, refreshToken, profile, done)=>{
	console.log(accessToken, refreshToken, profile)
	process.nextTick(()=>{
		console.log('profile is given as follows '+profile.id)
		User.findOne({'facebook.id': profile.id},(err, user)=>{
			if(err)
				return done(err)
			if(user)
				return done(null, user)
			else{
				var newUser = new User({
					profile:{},
					facebook:{
						'id': profile.id,
						'token': accessToken,
						'email': profile.email|| '',
						'name': profile.displayName || ''
					}
				})
				
				// newUser.save((err)=>{
				// 	if(err){
				// 		console.log('Some Error Occured in Saving Facbook Part of Object')
				// 		throw err
				// 	}
				// 	done(null,newUser)
				// })
				console.log('New User has to be created')
				done(null)
			}	
		})
	})
}))

	passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

router.get('/auth/facebook',
  passport.authenticate('facebook',{scope: 'email'}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/users/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;