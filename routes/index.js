var express = require('express');
var router = express.Router();

const query = require("source-server-query");
const utf8 = require('utf8');

/* GET home page. */
router.get('/', async function (req, res, next) {

    let serverInfo = await query.info("194.147.122.223", 2303, 500);

    // console.log(serverInfo);
    // console.log(serverInfo.maxplayers);
    // console.log(serverInfo.playersnum);

    // get query
    query.rules("194.147.122.223", 2303, 500)
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

module.exports = router;
