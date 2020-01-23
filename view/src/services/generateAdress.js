const fs = require("fs");
const path = require('path');
// const _ = require("lodash");
const src = path.join(__dirname + "/location.json");
const dst = path.join(__dirname + "/address.js");
let dstData = [];
fs.readFile(src, function(err, data){
    if(err){
        logger.error(err);
        return;
    }
    let original = data.toString();
    original = JSON.parse(original)
    for(let i in original){
        let province  = original[i].name;
        let provinceChildren = [];
        for(let j in original[i]['cities']){
            let city = original[i]['cities'][j]['name'];
            let cityChildren = [];
            for(let k in original[i]['cities'][j]['districts']){
                cityChildren.push({
                    label: original[i]['cities'][j]['districts'][k],
                    value: `${province}-${city}-${original[i]['cities'][j]['districts'][k]}`
                })
            };
            provinceChildren.push({
                label: city,
                value: `${province}-${city}`,
                children: cityChildren
            });
        }
        dstData.push({
            label: province,
            value: province,
            children: provinceChildren
        })
    };
    // console.log('dstData', dstData);
    // dstData = _.orderBy(dstData, ['label'],  ['asc'])
    fs.writeFileSync(dst, "export const address = " + JSON.stringify(dstData, null, '\t'))
})
