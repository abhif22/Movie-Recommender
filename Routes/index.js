	var router = require('express').Router()

	var ensureAuthentication = (req,res,next)=>{
		if(req.isAuthenticated())
			next()
		else{
			req.flash('error_msg', 'You are not Logged In. Login First')
			return res.redirect('/users/login')
		}
	}

	router.get('/', ensureAuthentication, (req,res)=>{
		res.render('index.ejs')
	})
	module.exports = router;