	// RUN : mongoimport --db movie-recommender --collection movies --file /media/abhishek/AC9A1D089A1CD126/4th\ Year\ Project/Temp\ Backend/Movie_Details_Upto_2016.json

	//NOT USING TILL THIS COMMIT

	var fs = require('fs')
	var mongoose = require('mongoose');
	var Movie = require('./models/movie.js')
	var async = require('async')
	var http = require('http')

	movieDetails = fs.readFileSync('movieDetails16Sorted.json', {encoding: 'utf8'})
	movies = JSON.parse(movieDetails)
	mongoose.connect('mongodb://localhost/movie-recommender',(err)=>{
        if(err){
            console.log('Connection to MongoDB Failed!')
            console.log(err)
          }
          else{
            console.log('Connection to MongoDB Successfull!')
          }
    })

    var db = mongoose.connection
	var i=0;


//STARTING WATERFALL

	async.waterfall([(callback)=>{
		var arr = []
		for(key in movies){
			arr.push(movies[key])
		}
		callback(null, arr)
	},(moviesArr, callback)=>{
		for(i=0;i<3;i++)
			console.log(moviesArr[i])
		var newCastList = []
		//Loop for each movie and fetch its cast and crew
		async.each(moviesArr, (movie, cb)=>{
			setTimeout(()=>{
				var data
			http.request(`http://api.themoviedb.org/3/movie/${movie.id}/casts?api_key=068e3f59f93f5c2aa67262e9e9f3db73`, function(result) {
		  result.setEncoding('utf8');
		  result.on('data', function (chunk) {
		    // console.log('BODY: ' + chunk);
		    data+=chunk
		  });
		  result.on('end',()=>{
		  	i++;
		  	
			var cast_and_crew = data.substring(9)
			   // console.log(result)
			cast_and_crew = JSON.parse(cast_and_crew)
			console.log('----------------------------------------------------------------------------------')
			console.log(`http://api.themoviedb.org/3/movie/${movie.id}/casts?api_key=068e3f59f93f5c2aa67262e9e9f3db73`)
			console.log('---------------------')
			console.log('Got cast and crew for movieId '+movie.id + '\t'+i)
			console.log(cast_and_crew)
			console.log('----------------------------------------------------------------------------------')
			newCastList.push({movieId: movie.id, cast_and_crew: cast_and_crew})
		  })
		  result.on('error', (err)=>{
		  	console.log(err)
		  	callback(null,cast_and_crew)
		  })
	}).end();
			cb()
},300)	
	 
	},(err)=>{
		// All cast data has been retrieved till now
		//Call next function
		callback(null,newCastList)
	})

	},(cast_and_crew, callback)=>{
		console.log('Received all Data!')
		fs.writeFileSync('./cast_and_crew.json',JSON.stringify(cast_and_crew))
		callback(null)

	}],(err, result)=>{
		console.log('Over!')
	})