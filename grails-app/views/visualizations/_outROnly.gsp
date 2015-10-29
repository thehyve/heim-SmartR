<!DOCTYPE html>

<img id="imgDIV" src="" />

<script>
	function _arrayBufferToBase64( buffer ) {
	    var binary = '';
	    var bytes = new Uint8Array( buffer );
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode( bytes[ i ] );
	    }
    	return window.btoa( binary );
	}

	document.getElementById("imgDIV").setAttribute('src', "data:image/png;base64," + _arrayBufferToBase64(image));
</script>
