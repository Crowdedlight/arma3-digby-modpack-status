var express = require('express');
var router = express.Router();

const query = require("source-server-query");
const utf8 = require('utf8');
var parser = require('../rules_parser');

/* GET home page. */
router.get('/', async function (req, res, next) {

    // let playerInfo = await query.players("65.108.4.90", 2303, 500);
    
    // use try/catch to still render page if server is offline, and just catch the returned
    let serverInfo;
    try {
        serverInfo = await query.info("65.108.4.90", 2303, 500);
    } catch (error) {
        console.log(error);
    }

    // get query
    query.rules("65.108.4.90", 2303, 500)
        .then(function (mods) {
            var modpack = "Could not determine";

            // need to parse incoming data per this protocol...
            // https://community.bistudio.com/wiki/Arma_3:_ServerBrowserProtocol3
            var data = parser(mods);
            // console.log(data);

            // loop to see what modpack
            for (const mod of data["mods"]) {
                // check if part of modern modpack
                if (mod.name.toLowerCase().includes("unsung")) {
                    modpack = "Historical";
                    break;
                }

                // check if part of historical modpack
                if (mod.name.toLowerCase().includes("rhs: united states forces")) {
                    modpack = "Modern";
                    break;
                }

                // check if part of scifi modpack
                if (mod.name.toLowerCase().includes("trebuchet")) {
                    modpack = "Sci-fi : HALO";
                    break;
                }

                if (mod.name.toLowerCase().includes("tiow")) {
                    modpack = "Sci-fi : 40K";
                    break;
                }

                if (mod.name.toLowerCase().includes("legion studios")) {
                    modpack = "Sci-fi : Star Wars";
                    break;
                }
            }

            // render result
            res.render('index', {title: 'Digby Modpack Status', currentModpack: modpack, playernum: serverInfo.players, maxPlayers: serverInfo.max_players, map: serverInfo.map, template: serverInfo.game});
        }
        ).catch(function (error) {
            console.log(error)
            var result = `Server is Offline`;
            res.render('index', {title: 'Digby Modpack Status', currentModpack: result, playernum: 0, maxPlayers: 0, map: "n/a", template: "n/a"});
    })
});

/* GET players. */
router.get('/players', async function (req, res, next) {

    // get query
    query.players("65.108.4.90", 2303, 500)
        .then(function (players) {

            let playerString = "";
            for (const val of players) {
                playerString += `${val.name} \n`
            }

            if (players.length <= 0) {
                playerString = "No players connected";
            }

            // render result
            res.render('players', {title: 'Digby Modpack Status', playerList: playerString});
            }
        ).catch(function (error) {
        var result = `Server is Offline`;
        res.render('index', {title: 'Digby Modpack Status', playerList: result});
    })
});

module.exports = router;
