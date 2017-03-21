if( process.argv.length < 4 ){
	console.error('Usage: node replacer.js [json file to be output] [resource file]') ;
	console.error('Example: node replacer.js all_Body.json all_JP.json') ;
	process.exit(-1) ;
}

var fs = require('fs');

var tgt , resrc ;
try {
	tgt = JSON.parse(fs.readFileSync(process.argv[2]).toString()) ;
	resrc = JSON.parse(fs.readFileSync(process.argv[3]).toString()) ;
} catch( e ){
	console.error('Error while reading input file.') ;
	process.exit(-1) ;
}

console.log( JSON.stringify(tgt,(key,val)=>{
	if( typeof val != 'string' || val.charAt(0)!='$' )
		return val ;

	val = val.substring(1) ;
	if( resrc.names[val] != undefined )
		return resrc.names[val] ;
	return val ;
},"\t")) ;
