const express = require('express'),
	app = express(),
	users = require('./user'),
	redis = require('redis'),
	Promise = require('bluebird'),
	client = redis.createClient();

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
app.listen(1234);

var getTodayRubbish = function(chance) {
	var chanceZoom = [];
	return client.getAsync('rubbish:nesting:done').then(reply => {
		users.forEach(user => {
			if (reply === user.name) {
				return;
			}
			let userZoom = new Array(user.weight).fill(user.name);
			chanceZoom = chanceZoom.concat(userZoom);
		});
		chance = Math.floor(chance * chanceZoom.length);
		console.log(chance, chanceZoom);
		return chanceZoom[chance];
	})

}
var delTodayRubbish = function(callback) {
	return client.delAsync('rubbish:nesting')
}
var setTodayRubbish = function() {
	// var user = getTodayRubbish(Math.random());
	return getTodayRubbish(Math.random()).then(user => {
		console.log(`无用户，重置后垃圾人为${user}`);
		client.setAsync('rubbish:nesting:done', user);
		client.setAsync('rubbish:nesting', user)
		return user
	});
}

var addUser = function() {
	//添加用户 {name:'',weight:1} weight default:1,min:1,max:10
}
var updateUser = function() {

}
var delUser = function() {

}

app.delete('/user', (req, res) => {
	delTodayRubbish().then(result => {
		res.send('重置成功')
	})
})

app.get('/*', (req, res) => {
	client.getAsync('rubbish:nesting').then(reply => {
		if (!reply) return setTodayRubbish();
		return reply
	}).then(user => {
		res.send(` ${new Date().toLocaleDateString()} 今日垃圾人:${user} `)
	}).catch(console.log)
})