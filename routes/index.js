var express = require('express');
var router = express.Router();

const query = require("source-server-query");
const utf8 = require('utf8');

/* GET home page. */
router.get('/', function (req, res, next) {

    // get query
    query.rules("194.147.122.223", 2303, 2000)
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
                if (utf8.encode(val.value).includes("Operation TREBUCHET")) {
                    modpack = "Sci-fi";
                    break;
                }
            }
            // render result
            var result = `Current Modpack: ${modpack}`;
            res.render('index', {title: 'Digby Modpack Status', currentModpack: result});
        }
        ).catch(console.log);
});

module.exports = router;
