    
    var express = require('express')
    var app = express()
    var path = require('path')
    var cookieParser = require('cookie-parser')
    var bodyParser = require('body-parser')
    var ejs = require('ejs');
    var ejsMate = require('ejs-mate');
    var mongod = require('mongodb')
    var mongoose = require('mongoose')
    var flash = require('connect-flash')
    var session = require('express-session')
    var expressValidator = require('express-validator')
    var passport = require('passport')
    var LocalStrategy =  require('passport-local').Strategy

    var users = require('./Routes/users')
    var routes = require('./Routes/index')
    var movies = require('./Routes/movies.js')
    var facebookLogin = require('./Routes/facebook-route.js')

   

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

    app.use(express.static(__dirname+'/public'));
    app.set('views','./views')
    app.set('view engine', 'ejs')
    app.engine('ejs', ejsMate);

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use(session({
        secret: 'secret12344321',
        saveUninitialized: true,
        resave: true
    }))

    //Passport Initialization
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(expressValidator({
        errorFormatter: (params,msg,value)=>{
            var namespace = params.split('.'),
                root = namespace.shift(),
                formParam = root;

                while(namespace.length){
                    formParam += '['+namespace.shift() + ']'
                }
                return {
                    param: formParam,
                    msg: msg,
                    value: value
                }
        }
    }))
    //Use connect-flash
    app.use(flash())

    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.loggedin = req.user||null
        next()
    })

    app.use('/',routes)
    app.use('/users',users)
    app.use('/',facebookLogin)
    app.use('/explore',movies)

    var port = process.env.PORT || 8080;
    app.set('port', port)
    app.listen(app.get('port'),(err)=>{
        if(err)
            console.log(err)
        else
            console.log('Server listening on '+app.get('port'))
    })