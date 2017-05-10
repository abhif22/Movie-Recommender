	// RUN : mongoimport --db movie-recommender --collection movies --file /media/abhishek/AC9A1D089A1CD126/4th\ Year\ Project/Temp\ Backend/Movie_Details_Upto_2016.json



	var fs = require('fs')
	var mongoose = require('mongoose');
	var Review = require('./models/review.js')

	reviews = fs.readFileSync('reviews.json', {encoding: 'utf8'})
	reviews = JSON.parse(reviews)
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
	process.nextTick(()=>{
		for(key in reviews){
		// console.log(movies[key])
		process.nextTick(()=>{
		var newReview = new Review({
				key: key,
				id: reviews[key].id,
				review_collection: reviews[key].results
			})
			newReview.save((err)=>{
				if(err)
					console.log('Review with ID: '+reviews[key].id+'could not be saved')
				else
					i++;
			})
		})
	}
	})
	process.nextTick(()=>{
		console.log('Saved Total: '+i)
	})


//Find Using db.reviews.findOne({'id':410803})
