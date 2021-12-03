var express = require('express');
var router = express.Router();

const query = require("source-server-query");
const utf8 = require('utf8');

/* GET home page. */
router.get('/', async function (req, res, next) {

    let serverInfo = await query.info("65.108.4.90", 2303, 500);
    let playerInfo = await query.players("65.108.4.90", 2303, 500);

    // console.log(playerInfo);
    // console.log(serverInfo.maxplayers);
    // console.log(serverInfo.playersnum);

    // get query
    query.rules("65.108.4.90", 2303, 500)
        .then(function (mods) {
                var modpack = "Could not determine";

                // loop to see what modpack
                for (const val of mods) {
                    // check if part of modern modpack
                    if (utf8.encode(val.value).includes("unsung")) {
                        modpack = "Historical";
                        break;
                    }

                    // check if part of historical modpack
                    if (utf8.encode(val.value).includes("RHSGREF")) {
                        modpack = "Modern";
                        break;
                    }

                    // check if part of scifi modpack
                    if (utf8.encode(val.value).includes("Operation: TREBUCHET")) {
                        modpack = "Sci-fi";
                        break;
                    }
                }
                // render result
                res.render('index', {title: 'Digby Modpack Status', currentModpack: modpack, playernum: serverInfo.playersnum, maxPlayers: serverInfo.maxplayers, map: serverInfo.map, template: serverInfo.game});
            }
        ).catch(function (error) {
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
