const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getZipFiles, getCsvFiles, parseCsvData, unpackZipFile, updateOuptutFile } = require('./utils/functions');
const { spawn } = require('child_process');

const dataFolder = path.join(__dirname, '../data/');
const outputFile = path.join(__dirname, '../output/output.json');
const biomesFile = path.join(__dirname, './utils/biomes_data.csv');

getZipFiles(dataFolder)
  .then(zipFiles => {
    zipFiles.forEach(zipFile => {
      unpackZipFile(path.join(dataFolder, zipFile))
        .then(files => {
          const output = [];

          files.forEach(file => {
            var data = JSON.parse(file.data.toString());

            data = {id: data.spawns[0].id, source: zipFile, pokemon: data.spawns[0].pokemon, ...data}
            output.push(data);
          });

          updateOuptutFile(outputFile, output)
            .then(response => console.log(`${zipFile} was added to the output!`))
            .catch(e => `[ERR] ${zipFile} had an error being parsed: ${e}`);
        })
    });
  })
  .catch(e => console.log('Could not retrieve the files. Please try again later!'));

getCsvFiles(dataFolder)
  .then(csvFiles => {
    csvFiles.forEach(csvFile => {
      parseCsvData(csvFile, biomesFile)
        .then(data => {
          updateOuptutFile(outputFile, data)
            .then(response => console.log(`${csvFile} was added to the output!`))
            .catch(e => `[ERR] ${zipFile} had an error being parsed: ${e}`);

        })
      .catch(e => {

      })
    })
  })
  .catch(err => console.log(err))