var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

function verifyDbId(id, callback){
	
	var success;
	
	if(typeof id == 'string' && (id.length == 12 || id.length == 24 ) && checkForHexRegExp.test(id)){
		success = true;
	} else {
		success = false;
	}
	
	callback(success);
}
module.exports.verifyDbId = verifyDbId;
