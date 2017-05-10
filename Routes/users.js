var router = require('express').Router()
var User = require('../models/user.js')

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy

router.get('/register',(req,res)=>{
	res.render('register',{
		errors: {},
	})
})
router.post('/register',(req,res)=>{
	var name = req.body.name,
		username = req.body.username,
		email = req.body.email,
		password1 = req.body.password1,
		password2 = req.body.password2,
		dob = req.body.dob
		city = req.body.city
		country = req.body.country
	console.log(name)
	console.log(username)
	console.log(email)
	console.log(password1)
	console.log(password2)
	console.log(dob)
	console.log(city)
	console.log(country)

	req.checkBody('name','Name is Required').notEmpty()
	req.checkBody('email','Email Address is Required').notEmpty()
	req.checkBody('email','Email Address is Not Valid').isEmail()
	req.checkBody('password1','Password is Required').notEmpty()
	req.checkBody('password2','Please Confirm the Password').notEmpty()
	req.checkBody('password2','Passwords Do Not Match').equals(password1) 

	errors = req.validationErrors();
	if(errors){
		console.log('YES ERORRS '+errors.toString())
		res.render('register',{
			errors: errors
		});
	}
	else{
		console.log('NO ERORRS!')
		var newUser = new User({
			local: {
					name: name,
					email: email,
					password: password1,
					username: username,
					city: city,
					country: country,
					dob: dob
					},
			facebook: {

			}
		})
		User.getUserByUsername(username,(err, existingUser)=>{
			if(err)
				throw err
			if(existingUser){
				req.flash('error_msg', 'UserName not Available')
				return res.redirect('/users/register')
			}
			else{
				User.createUser(newUser,(err,user)=>{
					if(err)
						throw err;
					console.log(user)
					req.flash('success_msg','You are Now Registered. Login Now')
					return res.redirect('/users/login')
				})
			}
		})
	}
})

passport.use(new LocalStrategy((username, password, done)=>{
	console.log('UserName '+username+'\t'+'Password '+password)
	User.getUserByUsername(username,(err, user)=>{
		if(err)
			throw(err)
		if(!user)
			return done(null, false, {message: 'Incorrect Username'})
		User.comparePassword(password, user.local.password, (err, isMatch)=>{
			if(err)
				throw err
			if(isMatch)
				return done(null, user)
			else
				return done(null, false, {message: 'Incorrect Password'})
		})
	})
}))

passport.serializeUser((user, done)=>{
	done(null, user.id)
})

passport.deserializeUser((id, done)=>{
	User.getUserById(id,(err, user)=>{
		done(err, user)
	})
})

router.get('/login',(req, res)=>{
	res.render('login')
}).post('/login',passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/users/login',
	failureFlash: true
	}),(req,res)=>{
		return res.redirect('/')
	})

router.get('/logout',(req,res)=>{
	req.logout();
	req.flash('success_msg','Successfully Logged Out!')
	return res.redirect('/users/login')
})

module.exports = router;