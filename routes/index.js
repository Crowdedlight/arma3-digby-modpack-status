var express = require('express');
var router = express.Router();

const query = require("source-server-query");
const utf8 = require('utf8');
var parser = require('../rules_parser');

function getModPack(mods)
{
    var modpack = "Could not determine";
    var mods = mods["mods"];

    // loop to see what modpack
    for (const mod of mods) {
        // MODERN
        if (mod.name.toLowerCase().includes("challenger")) {
            modpack = "Modern";
            break;
        }

        // COLD WAR
        if (mod.name.toLowerCase().includes("spearpoint")) {
            modpack = "Cold War";
            break;
        }

        // WORLD WAR
        if (mod.name.toLowerCase().includes("ifa")) {
            modpack = "World War";
            break;
        }

        // HALO
        if (mod.name.toLowerCase().includes("trebuchet")) {
            modpack = "Sci-fi : HALO";
            break;
        }
        
        // 40K
        if (mod.name.toLowerCase().includes("tiow")) {
            modpack = "Sci-fi : 40K";
            break;
        }

        // STAR WARS
        if (mod.name.toLowerCase().includes("legion studios")) {
            modpack = "Sci-fi : Star Wars";
            break;
        }
    }
    return modpack;
}

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
            // need to parse incoming data per this protocol...
            // https://community.bistudio.com/wiki/Arma_3:_ServerBrowserProtocol3
            var data = parser(mods);
            // console.log(data);
            var modpack = getModPack(data);

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

router.get('/api/status', async function (req, res, next) {

    var response = {
        playerNum: 0,
        playerMax: 0,
        players: [],
        mods: [],
        mapName: "",
        template: "",
        modpack: ""
    };

    // Server Info
    let serverInfo;
    try {
        serverInfo = await query.info("65.108.4.90", 2303, 500);
    } catch (error) {
        console.log(error);
    }

    response["mapName"] = serverInfo.map;
    response["template"] = serverInfo.game;
    response["playerMax"] = serverInfo.max_players;
    response["playerNum"] = serverInfo.players;

    // mods loaded
    let mods_raw;
    try {
        mods_raw = await query.rules("65.108.4.90", 2303, 500);
    } catch (error) {
        console.log(error);
    }

    // need to parse incoming data per this protocol...
    // https://community.bistudio.com/wiki/Arma_3:_ServerBrowserProtocol3
    var mods = parser(mods_raw);
    // console.log(data);
    var modpack = getModPack(mods);

    // save in response
    response["mods"] = mods["mods"];
    response["modpack"] = modpack;

    
    // players connected
    let players_connected;
    try {
        players_connected = await query.players("65.108.4.90", 2303, 500);
    } catch (error) {
        console.log(error);
    }

    for (const val of players_connected) {
        response["players"].push(val.name);
    }

    res.json(response);
});

module.exports = router;
