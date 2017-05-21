	var router = require('express').Router()
	var User = require('../models/user.js')
	var Movie = require('../models/movie.js')
	var async = require('async')
	var ensureAuthentication = (req,res,next)=>{
		if(req.isAuthenticated())
			next()
		else{
			req.flash('error_msg', 'You are not Logged In. Login First')
			return res.redirect('/users/login')
		}
	}

//Work on recommendation and recent Movies will be done here

	router.get('/', ensureAuthentication, (req,res)=>{

		async.waterfall([(cb)=>{

			var recent = req.user.recent_movies
			var movieData = []
			async.each(recent, (movie, cb1)=>{
				Movie.findOne({'id': movie.movieId},(err, result)=>{
					if(err){
						return cb1(err)
					}
					movieData.push(result)
					//This statement means increment counter of loop and run loop again
					return cb1()
				})
			}, (err)=>{
				//This callback is invoked if
				// i.  err occurs and cb1(err) is called
				// ii. loop finishes 
				if(err)
					return cb(err)
				return cb(null, movieData)
			})


		},(res1, cb)=>{

			//For Recommendations
			cb(null, res1)

		}],(err, finalResult)=>{
			if(err){
				//Do this inside the callback which returns recent data
				return res.render('index.ejs',{err: err})
			}
			return res.render('index.ejs', {data: finalResult})

		})

	})
	module.exports = router;