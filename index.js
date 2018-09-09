var moment = require('moment-timezone')
var request = require('request-promise')
var mqtt = require('mqtt')

const regex = /temperature=(\d+\.\d+),humidity=(\d+\.\d+)/

mqtt.connect('http://rancher.compile.ch')
    .subscribe(['dht11'])
    .on('connect', () => {
        console.log("connected!")
    })
    .on('message', (topic, payload) => {
        console.log(topic, payload.toString());
        let matches = regex.exec(payload.toString())

        if (matches) {
            if (matches[1]) {
                console.log('temp is now:', matches[1])
                jsonData.inside.living_room.temperature = parseFloat(matches[1])
            }
    
            if (matches[2]) {
                console.log('humidity is now:', matches[2])
                jsonData.inside.living_room.humidity = parseFloat(matches[2])
            }
    
        } else {
            console.log('no match...')
        }


        
    })
    .on('error', (err) => {
        console.error(err)
    })

setInterval(() => fetchData(), 60000)

let jsonData = {
    inside: {
        living_room: {}
    },
    outside: {}
}

function fetchData() {
    if (process.env.APPID) {
        return request({
            url: 'http://api.openweathermap.org/data/2.5/weather?q=Bolligen,ch&units=metric&APPID=' + process.env.APPID,
            json: true
        }).then(data => {
            jsonData.outside = data.main
            jsonData.sunrise = moment(data.sys.sunrise * 1000).tz("Europe/Zurich").format('HH:mm')
            jsonData.sunset = moment(data.sys.sunset * 1000).tz("Europe/Zurich").format('HH:mm')
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
