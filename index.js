const express = require("express");
const app = express();
const fs = require('fs');

genres = {
	"techno" : "0,1,0,0",
	"ambient" : "0,0,1,0",
	"hiphop" : "1,0,0,0",
	"footwork" : "0,0,0,1",
};

//Add cors headers
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/status',(req, res) => {
	var jsonStatus = fs.readFileSync('/home/ubuntu/status.json','utf8');
	res.send(jsonStatus);
});


app.get('/reinforce',(req, res) => {
	state = fs.readFileSync('/home/ubuntu/status.json','utf8');
	jsonStatus = JSON.parse(state);
	date = new Date(); //Now()
	hour = date.getHours();
	fs.appendFileSync('/home/ubuntu/meanderlust-rest/nn_data/data.txt', hour + ',' + genres[jsonStatus.category] + '\n');
	res.send("ok");
});

app.get('/negative-reinforce',(req, res) => {
	state = fs.readFileSync('/home/ubuntu/status.json','utf8');
	jsonStatus = JSON.parse(state);
	date = new Date(); //Now()
	hour = date.getHours();
	for(genre in genres){
		if(genre != jsonStatus.category){
			fs.appendFileSync('/home/ubuntu/meanderlust-rest/nn_data/data.txt', hour + ',' + genres[genre] + '\n');
		}
	}
	res.send("ok");
});


app.listen(3000, () => {
	console.log("El servidor está inicializado en el puerto 3000");
});
