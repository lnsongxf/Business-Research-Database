var express = require('express')

var app = express()
app.set('view engine', 'pug')

app.use("/css",express.static(__dirname + '/css'));

app.use(express.static('sjdb'))

app
  .use('/oc', require('./oc/index'))
  .use('/', require('./os/index'))
.listen(3000);

