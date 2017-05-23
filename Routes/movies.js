
var router = require('express').Router()
var Movie = require('../models/movie.js')
var User = require('../models/user.js')
var http = require('http')
var fs = require('fs')
var async = require('async')

// movieDetails = fs.readFileSync('./Movie_Details_Upto_2016.json')
// movieDetails = JSON.parse(movieDetails)

SimilarMovies = fs.readFileSync('./ProcessedSimilarMoviesData.json', {encoding: 'utf8'})
SimilarMovies = JSON.parse(SimilarMovies)
console.log('SIMILAR MOVIES READ!')

var links = fs.readFileSync('./linksProcessed.json', {encoding: 'utf8'})
links = JSON.parse(links)

console.log('Links READ!')

var ensureAuthentication = (req,res,next)=>{
		if(req.isAuthenticated())
			next()
		else{
			req.flash('error_msg', 'You are not Logged In. Login First')
			return res.redirect('/users/login')
		}
	}

//Make sure to remove ensureAuth function as any user can browse movies but only logged in user can vote
// For that pass this function to router.post('/users/favourite') and router.post('explore/movie/:movie_id/rate')
var wasFav = 0
router.get('/movies/:movie_id',(req,res)=>{
	// console.log(req.user)
	var movieId = req.params.movie_id
	console.log('Movie Id is '+movieId)

	async.waterfall([(cb)=>{

		Movie.findOne({id: movieId},(err,result)=>{
					// console.log('result',result)
					if(!result){
						console.log('Movie Not found in database')
						console.info(err)
						return cb(null, false, movieId)
						}
						//If req.user that is user is logged in, then loop through its favorites list
						// To set wasFav flag
						if(req.user){
							for(i=0;i<req.user.favorites.length;i++){
								if(req.user.favorites[i].movieId==movieId){
									wasFav = 1
								}
							}
						}
						else{
							wasFav = 0
						}
					return cb(null, true, result)
				})
	}, (gotResultFromDB, result, cb)=>{

			if(!gotResultFromDB){
				//Get Data from TMDB
				console.log('Getting Movie Data from TMDB')
				var data
				http.request(`http://api.themoviedb.org/3/movie/${result}?api_key=068e3f59f93f5c2aa67262e9e9f3db73`, function(response) {
					  response.setEncoding('utf8');
					  response.on('data', function (chunk) {
					    // console.log('BODY: ' + chunk);
					    data+=chunk
					  });
					  response.on('end',()=>{
					  	return cb(null, gotResultFromDB, JSON.parse(data.substring(9)))
					  })
					  response.on('error', (err)=>{
					  	return cb(err)
					  })
				}).end();
			}
			else{
				cb(null, gotResultFromDB, result)
			}

	}, (gotResultFromDB, result, cb)=>{

		if(!gotResultFromDB){
			//Save this movie in database since it was not present
			var newMovie = new Movie({
			backdrop_path: (result.backdrop_path|| ''),
			budget: result.budget,
			genres: result.genres,
			homepage: (result.homepage|| ' '),
			id: result.id,
			imdb_id: result.imdb_id,
			original_language: result.original_language,
			original_title: result.original_title,
			overview: result.overview,
			poster_path: result.poster_path,
			release_date: result.release_date,
			revenue: result.revenue,
			runtime: result.runtime,
			status: result.status,
			title: result.title,
			tagline: result.tagline,
			vote_average: result.vote_average,
			vote_count: result.vote_count,
			popularity: result.popularity,
			belongs_to_collection: (result.belongs_to_collection||'')
			})

			newMovie.save((err, savedMovie)=>{
				console.log(savedMovie)
				if(err)
					return cb(null, gotResultFromDB, result)
				return cb(null, gotResultFromDB, result)
			})
		}
		else{
			cb(null, gotResultFromDB, result)
		}

	},(gotResultFromDB, result, cb)=>{

		var movie_details = {}
		//Add Cast, Crew, Similar Movies to movie_details
		//For Cast and Crew make a TMDB API Call
		movie_details.wasFav = wasFav
		movie_details.movie = result

		var data
		http.request(`http://api.themoviedb.org/3/movie/${movieId}/casts?api_key=068e3f59f93f5c2aa67262e9e9f3db73`, function(response) {
			  response.setEncoding('utf8');
			  response.on('data', function (chunk) {
			    // console.log('BODY: ' + chunk);
			    data+=chunk
			  });
			  response.on('end',()=>{
			  	return cb(null, gotResultFromDB, movie_details, data)
			  })
			  response.on('error', (err)=>{
			  	return cb(err)
			  })
		}).end();
	}, (gotResultFromDB, movie_details, cast_and_crew, cb)=>{
			cast_and_crew = cast_and_crew.substring(9)
				   // console.log(result)
			cast_and_crew = JSON.parse(cast_and_crew)
			// console.log('CAST AND CREW')
			// console.log(cast_and_crew)
			movie_details.cast = cast_and_crew.cast
			movie_details.crew= cast_and_crew.crew
			// console.log('NOW PROCESSING SIMILAR MOVIES')
			if(gotResultFromDB){
			var arr = []
			let similarMoviesIds = SimilarMovies[movieId]
			// console.log('SIMILAR MOVIES IDS')
			// console.log(similarMoviesIds)
			var count = 0
			async.each(similarMoviesIds, (id, cb1)=>{

				Movie.findOne({id: id.similar},(err,movieInfo)=>{
					if(err)
						return cb(err)
					count++;
					arr.push(movieInfo)
					cb1()
				})

			}, (err)=>{
				if(err)
					return cb(err)
				movie_details.similarmovies = arr
				return cb(null, gotResultFromDB, movie_details)
			})
		}
		else{
			// Set movie_details.similarmovies = empty array else it will give error in ejs rendering
			movie_details.similarmovies = []
			//Since gotResultFromDB is false don't stop waterfall
			cb(null, gotResultFromDB, movie_details)
		}

	},(gotResultFromDB, movie_details, cb)=>{

		if(req.user&&gotResultFromDB){
			/*var tmp = req.user.recent_movies
			console.log('TMP = '+tmp)
			tmp.pop()
			tmp.push(req.params.movie_id)*/

			if(req.user.recent_movies.length>=10){
				//Pull from back
				var pull_id = req.user.recent_movies[0].movieId
				// console.log('pull_id '+pull_id)
				User.findByIdAndUpdate(req.user._id,{$pull:{'recent_movies':{'movieId':pull_id}}},{safe: true, upsert: true},(err,updatedUser)=>{
					if(err){
						console.log(err)
					}
					else{
						// console.log('Successfully Pulled!')
					}
					return cb(null, gotResultFromDB, movie_details)
				})
			}
			else{
				return cb(null, gotResultFromDB, movie_details)
			}
		}
		else{
			return cb(null, gotResultFromDB, movie_details)
		}

	}, (gotResultFromDB, movie_details, cb)=>{

		if(req.user&&gotResultFromDB){
			/*var tmp = req.user.recent_movies
			console.log('TMP = '+tmp)
			tmp.pop()
			tmp.push(req.params.movie_id)*/
			User.findByIdAndUpdate(req.user._id,{$push:{'recent_movies':{'movieId': req.params.movie_id}}},{safe: true, upsert: true},(err,updatedUser)=>{
				if(err){
					console.log(err)
				}
				else{
					// console.log(updatedUser)
				}
				return cb(null, movie_details)
			})			
		}
		else{
			return cb(null, movie_details)
		}
	}], (err, finalResult)=>{
		if(err)
			return res.render('movie_details',{err: err})
		else{
			// console.log(finalResult)
			return res.render('movie_details',{movie_details: finalResult})
		}
	})

})

router.get('/popular', (req, res)=>{
	async.waterfall([(cb)=>{

			//For Recommendations
				var url = `http://127.0.0.1:5000/get-popular`
			
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
			return res.render('popular.ejs', {data: recommendations})

		})
})

router.get('/upcoming',(req,res)=>{
	
	var request = new Promise(function(resolve, reject) {
	   //do an ajax call here. or a database request or whatever.
	   //depending on its results, either call resolve(value) or reject(error)
	   //where value is the thing which the operation's successful execution returns and
	   //error is the thing which the operation's failure returns.
	   var options = {
		  host: 'http://api.themoviedb.org',
		  path: '/3/movie/upcoming?api_key=068e3f59f93f5c2aa67262e9e9f3db73',
		  method: 'GET'
		};
		var data
		http.request('http://api.themoviedb.org/3/movie/upcoming?api_key=068e3f59f93f5c2aa67262e9e9f3db73', function(result) {
			  result.setEncoding('utf8');
			  result.on('data', function (chunk) {
			    // console.log('BODY: ' + chunk);
			    data+=chunk
			  });
			  result.on('end',()=>{
			  	resolve(data)
			  })
		}).end();
	 });

	 request.then(function successHandler(result) {
	   //do something with the result
	   result = result.substring(9)
	   // console.log(result)
	   result = JSON.parse(result)
	   var byPopularity = result['results'].slice(0);
		byPopularity.sort(function(a,b) {
		    return b.popularity - a.popularity;
		});
		// var stringifiedResult = JSON.stringify(byPopularity,null, 4);
	   res.render('upcoming',{data: byPopularity, total_pages: result.total_pages})
	 }, function failureHandler(error) {
	  //handle
	  res.json(error)
	 });

})

router.get('/upcoming/:page',(req,res)=>{

	async.waterfall([(cb)=>{

		var page = req.params.page
		console.log('Asked for page '+page)  
		var data
		http.request('http://api.themoviedb.org/3/movie/upcoming?api_key=068e3f59f93f5c2aa67262e9e9f3db73&page='+page, function(result) {
			  result.setEncoding('utf8');
			  result.on('data', function (chunk) {
			    // console.log('BODY: ' + chunk);
			    data+=chunk
			  });
			  result.on('end',()=>{
			  	return cb(null, JSON.parse(data.substring(9)))
			  })
		}).end();
	}, (result, cb)=>{

			var byPopularity = result['results'].slice(0);
				byPopularity.sort(function(a,b) {
				    return b.popularity - a.popularity;
				});
				cb(null, result.total_pages, byPopularity)

	}],(err, total_pages, finalResult)=>{
		if(err){
			return res.render('upcoming',{data: finalResult, total_pages: total_pages})
		}
		res.render('upcoming',{data: finalResult, total_pages: total_pages})
	})
})


router.post('/movies/:movieId/rate', ensureAuthentication, (req, res)=>{
	if(req.user.local){
		var id = req.user.local.username
	}
	else{
		var id = req.user.facebook.id
	}
	fs.appendFileSync('./ratings.json', `,{"userId":${id},"movieId": ${req.body.movieId},"rating": ${req.body.rating}}`)
	//modify it res.end()
	//Send a post request to Flask with userId,movieId,rating,timestamp and
	//append it to the Ratings SFrame
	//Give a logic to it that when number of ratings obtained is above a threshold, 
	//save the ratings SFrame as csv
})

module.exports = router; 
