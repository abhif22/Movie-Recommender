	// RUN : mongoimport --db movie-recommender --collection movies --file /media/abhishek/AC9A1D089A1CD126/4th\ Year\ Project/Temp\ Backend/Movie_Details_Upto_2016.json



	var fs = require('fs')
	var mongoose = require('mongoose');
	var User = require('./models/user.js')
	var shortid = require('shortid')
	var random = require('random-world')

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

	users = fs.readFileSync('userdata.json', {encoding: 'utf8'})
	users = JSON.parse(users)

			var name = [],email=[],city=[],country=[],dob=[];
			for(key in users){
		// console.log(movies[key])
			name.push(random.fullname())
			email.push(random.email())
			city.push(random.city())
			country.push(random.country())
			dob.push(random.date({start:'01/01/1980', end: '01/01/2010'}))
			}

	var i=0;
	process.nextTick(()=>{
		for(key in users){
		// console.log(movies[key])
		var name = random.fullname(),
			email = random.email(),
			city = random.city(),
			country = random.country(),
			dob = random.date({start:'01/01/1980', end: '01/01/2010'});
		process.nextTick(()=>{
		var newUser = new User({
			local: {
					name: name[i] ,
					email: email[i],
					password: 'abc123',
					username: (users[key].UserID).toString(),
					city: city[i],
			        country: country[i],
			        dob: dob[i]
					},
			facebook: {

			}
		})
			newUser.save((err)=>{
				if(err)
					console.log('User with ID: '+users[key].id+'could not be saved')
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
