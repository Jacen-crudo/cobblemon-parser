const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const decompress = require('decompress');

const requiredFolders = [
  path.join(__dirname, '../../data'),
  path.join(__dirname, '../../output')
]

function createRepositories() {
  requiredFolders.forEach(folder => {
    if(fs.existsSync(folder)) {
      console.log(`${folder} exists!`)
    }
    else {
      fs.mkdir(folder, (err) => {
        if (err) return err;
        console.log(`${folder} was created!`)
      })
    }
  })
}

function getZipFiles(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if(err) reject(err);
      const data = files.filter(file => path.extname(file).toLowerCase() === '.zip');
      resolve(data);
    });
  });
}

function unpackZipFile(filePath) {
  return new Promise((resolve, reject) => {
    decompress(filePath, {
      filter: unzippedFile => unzippedFile.path.startsWith('data/cobblemon/spawn_pool_world/') && path.extname(unzippedFile.path).toLowerCase() === '.json'
    })
      .then(files => resolve(files))
      .catch(err => reject(err));
  })
}

function updateOuptutFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'utf-8' }, (err, content) => {
      if(err && err.code === 'ENOENT') {
        fs.writeFile(filePath, JSON.stringify(data), { encoding: 'utf-8' }, (err) => {
          if(err) reject(err);

          resolve();
        });
      }
      else if(err) reject(err);
      else {
        const uniqueIds = [];
        const spawnData = !content ? [] : JSON.parse(content);
        const temp = spawnData.concat(data);
        const filteredOutput = temp.filter(element => {
          const isDuplicate = uniqueIds.includes(element.id);

          if(!isDuplicate) {
            uniqueIds.push(element.id);
            return true;
          }

          return false;
        })

        fs.writeFile(filePath, JSON.stringify(filteredOutput), { encoding: 'utf-8' }, (err) => {
          if(err) reject(err);

          resolve();
        });
      }
    });
  })
}

function getCsvFiles(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if(err) reject(err);
      const data = files.filter(file => path.extname(file).toLowerCase() === '.csv');
      resolve(data);
    });
  });
}

function getBiomes(filePath) {
  return new Promise((resolve, reject) => {
    try{
      const biomes = [];
      var biome, location, creator;

      fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => {
      var key, keys = Object.keys(data);
      var n = keys.length;
      var parsedData = {};
      while(n--) {
        key = keys[n];
        parsedData[key.toLowerCase()] = data[key].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '_');
      }

      if(!biome || (biome !== parsedData.biome && parsedData.biome.length > 0)) biome = parsedData.biome;
      if(!location || (location !== parsedData['qualifying locations'] && parsedData['qualifying locations'].length > 0)) location = parsedData['qualifying locations'];
      if(!creator || (creator !== parsedData['established by'] && parsedData['established by'].length > 0)) creator = parsedData['established by'];

      if(location.includes('all') && creator !== 'cobblemon') return;
      biomes.push({ biome, location, creator });
      })
      .on('end', () => {
        resolve(biomes);
      })

    }
    catch(e) {
      reject(e);
    }
    
  })
}

function parseCsvData(fileName, biomesFile) {
  return new Promise((resolve, reject) => {
    const results = [];
    const idSourceName = fileName.toLowerCase().replace('.csv', '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '_'); 
  
    getBiomes(biomesFile)
      .then(biomes => {
        fs.createReadStream(path.join(__dirname, '../../data/' + fileName))
          .pipe(csv())
          .on('data', data => {
            var key, keys = Object.keys(data);
            var n = keys.length;
            var parsedData = {};
            while(n--) {
              key = keys[n];
              parsedData[key.toLowerCase()] = data[key].toLowerCase();
            }
            const pokeName = parsedData['pokémon'];
            const filteredBiomes = biomes.filter(biome => parsedData.biome === biome.biome || parsedData.biome === biome.location );
            const spawnData = [];
            filteredBiomes.forEach(biome => {
              spawnData.push({
                id: `${idSourceName}-${pokeName}`,
                pokemon: pokeName,
                presets: [ parsedData.preset ],
                type: 'pokemon',
                context: parsedData.context,
                bucket: parsedData.bucket,
                level: `${parsedData['lv. min']}-${parsedData['lv. max']}`,
                weight: parsedData.weight,
                condition: {
                  canSeeSky: parsedData.canseesky,
                  biomes: [ `${biome.creator}:${biome.biome}` ]
                }
              })
            });
            const pokemon = {
              id: `${idSourceName}-${pokeName}`,
              source: idSourceName,
              pokemon: pokeName,
              enabled: true,
              neededInstalledMods: [],
              neededUninstalledMods: [],
              spawns: spawnData
            }
            results.push(pokemon);
          })
          .on('end', () => {
            resolve(results);
          })
      })
      .catch(err => { reject(err) })
  })
}

module.exports = {
    getZipFiles,
    getCsvFiles,
    unpackZipFile,
    updateOuptutFile,
    parseCsvData,
    createRepositories
}