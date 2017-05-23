	var router = require('express').Router()
	var User = require('../models/user.js')
	var Movie = require('../models/movie.js')
	var async = require('async')
	var http = require('http')
	var fs = require('fs')

	var ensureAuthentication = (req,res,next)=>{
		if(req.isAuthenticated())
			next()
		else{
			req.flash('error_msg', 'You are not Logged In. Login First')
			return res.redirect('/users/login')
		}
	}

	var links = fs.readFileSync('./linksProcessed.json', {encoding: 'utf8'})
	links = JSON.parse(links)

//Work on recommendation and recent Movies will be done here

	router.get('/', ensureAuthentication, (req,res)=>{

		async.waterfall([(cb)=>{

			//For Recommendations
			console.log('Fetching Recommendations for '+req.user.local.username)
			console.log('Fetching Recommendations for '+req.user.facebook.email)
			if(req.user.local.username){
				var url = `http://127.0.0.1:5000/get-recommendations/user/${req.user.local.username}`
			}
			else{
				var url = `http://127.0.0.1:5000/get-popular`
			}
			var data
				http.request(url, function(response) {
					  response.setEncoding('utf8');
					  response.on('data', function (chunk) {
					    // console.log('BODY: ' + chunk);
					    data+=chunk
					  });
					  response.on('end',()=>{
					  	// console.log('Data Received from Python')
					  	// console.log(JSON.parse(data.substring(9)))
					  	return cb(null, JSON.parse(data.substring(9)))
					  })
					  response.on('error', (err)=>{
					  	return cb(err)
					  })
				}).end();

		},(recommendations, cb)=>{

			var movies = []
			async.each(recommendations, (recommendation, cb1)=>{
				// console.log(recommendation.movieId)
				// console.log('Movie Id '+links[recommendation.movieId].tmdbId)
				Movie.findOne({id: links[recommendation.movieId].tmdbId}, (err, movieData)=>{
					// console.log(movieData)
					if(err){
						return cb1()
					}
					movies.push(movieData)
					return cb1()
				})
			}, (err)=>{
				if(err){
					return cb(err)
				}
				return cb(null, movies)
			})

		}],(err, recommendations)=>{
			if(err){
				//Do this inside the callback which returns recent data
				console.log(err)
				console.log('Called with Error!')
				// return res.render('recommendations.ejs',{err: err})
			}
			// console.log(recommendations)
			console.log('Calling without err')
			// return res.json(recommendations)
			return res.render('recommendations.ejs', {data: recommendations})

		})

	})
	module.exports = router;