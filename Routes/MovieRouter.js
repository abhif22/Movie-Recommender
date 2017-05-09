var router = require('express').Router()
var fs = require('fs')

movieDetails = fs.readFileSync('./Movie_Details_Upto_2016.json')
movieDetails = JSON.parse(movieDetails)

router.get('/:movie_id',(req,res)=>{
res.json(movieDetails[req.params.movie_id])
})

module.exports = router;
