const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
var lineReader = require('line-reader');
var fs = require('fs');

var inputData = [];
var classificationData = [];
var model;

var genres = {
	0 : 'hiphop', //1,0,0,0
	1 : 'techno',  //0,1,0,0
	2 : 'ambient', //0,0,1,0
	3 : 'footwork' //0,0,0,1
}

//tf.loadLayersModel returns a promise so it needs a then and a catch in to order to wait until it resolves
loadedModel = tf.loadLayersModel("file:///home/ubuntu/nn_model/model.json");
loadedModel.then(function(result){
	//If the model already exits compile it and use it
	model = result;
	model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'});
	train();
}).catch(function(error) {
	//In case model does not exist, create it defining its properties (only for first time execution)
	model = tf.sequential();
	model.add(tf.layers.dense({units: 10, activation: 'sigmoid',inputShape: [1]}));
	model.add(tf.layers.dense({units: 4, activation: 'sigmoid',inputShape: [10]}));
	model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'});
	train();
});


async function train() {

	await readData();
	
	//This commented lines are the structure of arrays compatibles with the neural network model used
	//const training_data = tf.tensor2d([[0],[1],[2],[3],[4]]);
	//const target_data = tf.tensor2d([[0,0,0],[0,0,1],[0,1,0],[1,0,0],[1,0,0]]);
	
	const training_data = tf.tensor2d(inputData);
	const target_data = tf.tensor2d(classificationData);

	for (let i = 1; i < 400; ++i) {
		var h = await model.fit(training_data, target_data, {epochs: 30});
		console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);
	}
	//After every training, persist the model with its weigths
	//model.save("file:///home/ubuntu/nn_model");
	predictValuesAndPersist();
	log('\n' + new Date() + ' model training completed.');
}

async function readData(){
	return new Promise((resolve) => {
		lineReader.eachLine('./nn_data/data.txt', function(line_, last) {
			//Fist number is the input
			line = line_.split(",");
			line = line.map(number => number = parseInt(number,10)); //Convert from char to number
			inputData.push([line[0]]);
			//The rest of the numbers are the classification data, 1st remove first element, push the rest of the array
			line.shift();
			classificationRow = line;
			classificationData.push(classificationRow);
			if(last){
				resolve(); //method called when promess executes succesfully
			}
		});
	});
}

async function predictValuesAndPersist(){
	path = '/home/ubuntu/meanderlust-rest/nn_data/prediction.txt';
	fs.unlinkSync(path); //clean file
	predictionValues = [[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[14],[15],[16],[17],[18],[19],[20],[21],[22],[23]];
	result = model.predict(tf.tensor2d(predictionValues));
	result.array().then(array => {
		array.map((row,index) => {
			fs.appendFile(path,index + '-' + genres[getIndexOfMaxValue(row)] + '\n',function(){
			});
			log('\n' + index + '-' + genres[getIndexOfMaxValue(row)]);
		});
	});
}

function getIndexOfMaxValue(array){
	maxIndex = 0;
	maxValue = 0;
	array.map((value,index) => {
		if(value > maxValue){
			maxIndex = index;
			maxValue = value;
		}
	});
	return maxIndex;
}

function log(message){
	fs.appendFile('/home/ubuntu/neural_network.log',message, (err) => {
	});
}
