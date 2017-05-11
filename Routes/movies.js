var router = require('express').Router()
var Movie = require('../models/movie.js')
var http = require('http')
var fs = require('fs')

// movieDetails = fs.readFileSync('./Movie_Details_Upto_2016.json')
// movieDetails = JSON.parse(movieDetails)

var ensureAuthentication = (req,res,next)=>{
		if(req.isAuthenticated())
			next()
		else{
			req.flash('error_msg', 'You are not Logged In. Login First')
			return res.redirect('/users/login')
		}
	}

router.get('/movies/:movie_id',ensureAuthentication,(req,res)=>{
res.render('movie_details')
//movieDetails[req.params.movie_id]
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
			  console.log('STATUS: ' + res.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(res.headers));
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
		var stringifiedResult = JSON.stringify(byPopularity,null, 4);
	   res.render('upcoming',{data: byPopularity})
	 }, function failureHandler(error) {
	  //handle
	  res.json(error)
	 });

})

module.exports = router; 
