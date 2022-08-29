const axios = require('axios');
const fs = require('fs');
const Path = require('path')

function getPokes(i){
    return new Promise((resolve, reject) => {
        axios.get('https://pokeapi.co/api/v2/pokemon/' + i)
            .then(response => {

                let typesTmp = response.data.types
                let typesEnd = []
                let dataPokemon = {}

                typesTmp.forEach(type => {
                    typesEnd.push(type.type.name)
                })

                let moves = []
                response.data.moves.forEach(move => {
                    moves.push({
                        name: move.move.name,
                        level: move.version_group_details[0].level_learned_at,
                        learnMethod: move.version_group_details[0].move_learn_method.name
                    })
                })

                dataPokemon = {
                    id: response.data.id,
                    name: response.data.name,
                    types: typesEnd,
                    stats: {
                        hp: response.data.stats[0].base_stat,
                        attack: response.data.stats[1].base_stat,
                        defense: response.data.stats[2].base_stat,
                        specialAttack: response.data.stats[3].base_stat,
                        specialDefense: response.data.stats[4].base_stat,
                        speed: response.data.stats[5].base_stat
                    },
                    moves: moves
                }
                resolve(dataPokemon);
            })
            .catch(error => {
                console.log(error);
            });
    });
}



async function writeJson(pokeidIni, pokeidEnd){
    let fullLog = []
    for(let x = pokeidIni; x<=pokeidEnd; x++){
        let a = await getPokes(x)
        fullLog.push(a)
    }

    let data = JSON.stringify(fullLog);
    fs.writeFileSync('pokes1.json', data);
}

async function downloadImage (id) {

    // let idStr = id.toString()
    // if(idStr.length == 1) id = '00'+ parseInt(idStr)
    // if(idStr.length == 2) id = '0'+ parseInt(idStr)

    const url = 'https://serebii.net/pokemon/art/'+ id +'.png'
    const path = Path.resolve(__dirname, './', id +'.png')
    const writer = fs.createWriteStream(path)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

function writeImages(pokeidIni, pokeidEnd){
    for(let i = pokeidIni; i<=pokeidEnd; i++){
        downloadImage(i)
    }
}

let pokeidIni = 152
let pokeidEnd = 251

writeJson(pokeidIni, pokeidEnd)
//writeImages(pokeidIni, pokeidEnd)
