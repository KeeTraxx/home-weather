var moment = require('moment-timezone')
var request = require('request-promise')
var mqtt = require('mqtt')

mqtt.connect('http://rancher.compile.ch')
    .subscribe(['living_room_temperature', 'living_room_humidity'])
    .on('message', (topic, payload) => {
        console.log(topic, payload.toString());
        switch (topic) {
            case "living_room_temperature":
                jsonData.inside.living_room.temperature = parseFloat(payload.toString())
                break;
            case "living_room_humidity":
                jsonData.inside.living_room.humidity = parseFloat(payload.toString())
                break;
            default:
                break;
        }
    })

setInterval(() => fetchData(), 60000)

let jsonData = {
    inside: {
        living_room: {}
    },
    outside: {}
}

function fetchData () {
    if (process.env.APPID) {
        return request({
            url: 'http://api.openweathermap.org/data/2.5/weather?q=Bolligen,ch&units=metric&APPID=' + process.env.APPID,
            json: true
        }).then(data => {
            jsonData.outside = data.main
            jsonData.sunrise = moment(data.sys.sunrise*1000).tz("Europe/Zurich").format('HH:mm')
            jsonData.sunset = moment(data.sys.sunset*1000).tz("Europe/Zurich").format('HH:mm')
        })    
    } else {
        console.error("No APPID Env defined. Not fetching weather data.")
    }
}
fetchData()

const express = require('express')
const app = express()
app.get('/', (req, res) => res.send(jsonData))

const server = app.listen(process.env.PORT || 3000, () => console.log("Listening on: ", server.address().port))
