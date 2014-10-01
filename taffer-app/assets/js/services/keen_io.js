angular.module("taffer.services")
.service("KeenIO", function() {
	
	var keenClient = new Keen({
		projectId: "53c54d1f80a7bd04b2000001",
		writeKey: "87c4d139c4585cad2f16dd3533b8d60f571c0d4c8decaf14c2ba811880370656e83b3b8ca938c199ef3112baa74d9de257c014343051891904a729c33ba58d23419021bce55381e5ac3bc7e56beb566a7afd06d75657f5f8d776f948d924897fca3b3e2e29e3b3d7a8b870254812e8b6",
	})

	return keenClient
	

});
