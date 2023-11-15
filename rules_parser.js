function countSetBits(n)
{
  var count = 0;
  while (n)
  {
    count += n & 1;
    n >>= 1;
  }
  return count;
}
// function for parseing rules result
function parse_rules(response) {
    // pack response into one big buffer
    let buffer = new Buffer.from([]);

    // combine to full buffer - TODO should probably use KEY values to ensure chunk order.... but being lazy here and seems to work
    for (const val of response) {
        buffer = Buffer.concat([buffer, val.value]);
    }

    // Handle escape chars
    // to handle escape chars it's easier to run through response and manually push back array, then create buffer and concat from array
    let arr = [];
    for (let i = 0; i < buffer.length; i++) {
        // check for escape, but only if we are not at the last value. As we do lookahead
        // 0x01 0x01 = 0x01
        // 0x01 0x02 = 0x00
        // 0x01 0x03 = 0xFF
        if (buffer[i] == 0x01 && i < (buffer.length-1)) {
            // check what next byte is
            switch (buffer[i+1]) {
                case 0x01:
                    arr.push(0x01);
                    i++; // skip next
                    break;
                case 0x02:
                    arr.push(0x00);
                    i++; // skip next
                    break;
                case 0x03:
                    arr.push(0xFF);
                    i++;
                    break;
                default: // its just a 0x01 value
                    arr.push(buffer[i]);
                    break;
            }
        } else {
            // if not escaping anything we just push current value and continue
            arr.push(buffer[i]);
        }
    }
    // recrate escaped buffer   
    buffer = Buffer.from(arr);

    // time to extract from buffer into return object
    let parsed = {};

    // 1. byte - protocol version
    parsed["version"] = buffer.readUInt8(0);

    // 2. byte - general flags (overflow flags)
    parsed["general_flags"] = buffer.readUInt8(1).toString(2);

    // 3. byte - dlc flags
    parsed["dlc_1"] = buffer.readUInt8(2);
    
    // 4. byte - dlc2 flags
    parsed["dlc_2"] = buffer.readUInt8(3);
    
    // 5. byte - difficulty
    let diff_flags = buffer.readUInt8(4);
    // bitshift to get the flag we want
    parsed["thirdperson"] = (diff_flags >> 7) & 0b1;
    parsed["advanced_flightmodel"] = (diff_flags >> 6) & 0b1;
    // 3 bits each aka. short
    parsed["ai_level"] = (diff_flags >> 3) & 0b00000111;
    parsed["difficulty"] = diff_flags & 0b00000111;

    // 6. byte - weapon cross hair enable
    parsed["crosshair_enabled"] = buffer.readUInt8(5);

    // now the hashes for dlc is coming in 4B sections. But only as many as flags are set in DLC.
    // We don't use hash for anything, so lets figure out how many bytes they consist of and skip it
    let dlc_count = countSetBits(parsed["dlc_1"]);
    dlc_count += countSetBits(parsed["dlc_2"]);
    // console.log('dlc_count: %d', dlc_count);

    // each dlc == 4 byte hash, so we jump index
    let index = 6 + (dlc_count*4);

    // MODS! - First how many mods we have
    parsed["mod_count"] = buffer.readUInt8(index);
    index++;

    // make mod array, which we add to the main object after parseing
    let mods = [];

    // ready to parse mods in loop, we are now at index for first mod section
    for (let i = 0; i < parsed["mod_count"]; i++) {

        // 4B short hash for mod
        let hash = buffer.readUInt32LE(index).toString(16);
        // let hash = buffer.toString('hex', index, index+4);
        index += 4;

        // 1 byte with dlc flag and steam id length
        let mod_flags = buffer.readUInt8(index);
        index++;
        let is_dlc = (mod_flags >> 4) & 0b1;
        let id_length = mod_flags & 0b00001111;
        
        // STEAM ID
        let steam_id = buffer.readUintLE(index, id_length);

        index += id_length;
        // let id_buf = buffer.subarray(index, id_length);

        // mod name length
        let name_length = buffer.readUInt8(index);
        index++;

        // mod name
        let name = buffer.toString('utf8', index, index+name_length);
        index += name_length;

        // debug
        // console.log(name);
        // console.log('id_length: %s', id_length.toString(2));
        // console.log('steam_id: %d', steam_id);
        // console.log('mod_flags: %s', mod_flags.toString(2));


        // save to object
        mods.push({
            'name': name,
            'steamID': steam_id,
            'isDLC': is_dlc,
            'hash': hash
        });
    }
    parsed["mods"] = mods;

    // SIGNATURES
    parsed["signatures_count"] = buffer.readUInt8(index);
    index++;

    let signatures = [];

    for (let i = 0; i < parsed["signatures_count"]; i++) {
        let sig_length = buffer.readUInt8(index);
        index++;

        let sig_name = buffer.toString('utf8', index, index+sig_length);
        index += sig_length;

        signatures.push(sig_name);
    }
    parsed["signatures"] = signatures;

    // return parsed object
    return parsed;
};

module.exports = parse_rules;