var random = require('random-world')
for(i=0;i<20;i++){
console.log('City '+random.city())
console.log('Country '+random.country())
console.log('Date '+random.date({start:'01/01/1980', end: '01/01/2010'}))
console.log('Name '+random.fullname())
console.log('Email '+random.email())
console.log('Sentence '+random.sentence())
}