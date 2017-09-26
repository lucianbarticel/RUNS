const fs = require("fs");
const path = require("path");
const Definition = require("./models/Definition");
const MongooseConnection = require('mongoose-connection-promise');

const argv = require('minimist')(process.argv.slice(2));

if(!argv.hasOwnProperty("file")) return console.log("please specify the file --file=YOUR_FILE");

const configs = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./", ".configs"), 'utf8'));
const mongooseConnection = new MongooseConnection(configs.database);

const arrayOfDefinitions = fs.readFileSync(argv.file, 'utf8').split(/\r?\n/)
.filter(d => d)
.map(definition => {
  definition = JSON.parse(definition);
  let defObj = {};
  defObj.name = definition.name;
  defObj.description = definition.description;
  return defObj;
})
.filter(d => d.name)

function* promiseGenerator(array, fn){
  i=0;
  do {
    yield fn(array[i])
    ++i;
  }while(i<array.length)
}

const saveDefinition = (def) => {
  return new Definition(def).save();
}

mongooseConnection.connect()
  .then(connection => Promise.all(promiseGenerator(arrayOfDefinitions, saveDefinition)))
  .then(arrOfResults => console.log(`saved ${arrOfResults.length} definitions`))
  .catch(err => console.log(err))
