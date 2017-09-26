//node main.js ../testcf/PCv4_Images ../testcf/PCv4_Folders
//node main.js origin destination

const fs = require("fs");
const path = require("path");

const copyFile = (source, target)=>{

	return new Promise((resolve, reject)=>{
		let rd = fs.createReadStream(source);

		rd.on("error", (err)=>{ return reject(err); });

		let wr = fs.createWriteStream(target);
		wr.on("error", (err)=>{ return reject(err); });
		wr.on("close", ()=>{
			console.log(`done copying ${target}`)
			resolve(target);
		});
		rd.pipe(wr);
	});
}

const gen = function* gen(f, arr) {
  let i = 0; 

  do {
    yield f(path.resolve(arr[i].origin, arr[i].file), path.resolve(arr[i].dest, arr[i].file));
    ++i;
  } while (i < arr.length);
}


const getFilesToCopyOver = (origin, destination) => {
	const originFiles = fs.readdirSync(origin);
	const suffixes = ["-thumb.png", "-full.png"];


	return fs.readdirSync(destination)
			.filter(f => {
				let fpath = path.resolve(destination, f);
				return fs.lstatSync(fpath).isDirectory() && f!== "ctlfile";
			})
			.reduce((acc, cv) => {
				let kpath = path.resolve(destination, cv); //folder to copy the images	
			 	suffixes.forEach(suffix =>{
			 		let obj = {};
			 		obj.dest = kpath;	
			 		obj.origin = origin;
			 		let fpath = path.resolve(origin, cv+suffix);
					if(fs.existsSync(fpath) && originFiles.includes(cv+suffix)){
						obj.file = cv+suffix;
						acc.push(obj);
					}
			 	})

				return acc;
			}, [])
}

const go = () => {
	const argv = process.argv.slice(2);
	if(!argv[1] || argv[1].length === 0) return console.log("please specify the destination ");
	if(!argv[0] || argv[0].length === 0) return console.log("please specify the origin ");
	return Promise.all(gen(copyFile, getFilesToCopyOver(path.resolve(__dirname, argv[0]), path.resolve(__dirname, argv[1]))))
		.then(()=> console.log(`done`))
		.catch(err => console.log(err))
}

go();