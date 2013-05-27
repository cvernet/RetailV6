//Gestion des modèles

//
// Modèle associé aux détails d'un article
//
retail.service('DetailArticleModel', function() {
this.getDetailArticle = function($scope,$routeParams) {
	$scope.descr = 'yep';
return [ {
	"id": $routeParams.id, "descr": $routeParams.descr, "EAN": $routeParams.EAN
        }
	     ];
}});

//
// Modèle associé à la liste des article
//
retail.service('ListeArticlesModel', function() {
this.getListeArticles = function($http) {
	//Lecture du cache à compléter pour gérer le cache par magasin 
//	data = JSON.parse(typeof localStorage['data'] == "undefined" ? null: localStorage['data']);
data = null;
if (data == null ) {
url = 'https://cernum53.cernum.com/sap/bc/zicf/magasins/' + localStorage['mymagasin'] + '?sap-client=300';
var promise = $http.get(url).then(function(response) {
	//mise en cache 
  localStorage['data'] = JSON.stringify(response.data);
	return response.data;
}
	);
}
else {
	promise = data;
}
	return promise;
}});

//
// Modèle associé à la recherche d'un article
//
retail.service('SearchModel', function() {
this.getResultat = function($http, $routeParams) {
//return [ {	"id": $routeParams.id, "description": $routeParams.descr}	];
//url = 'http://cernum53.cernum.com:8000/sap/bc/zicf/magasins/' + localStorage['mymagasin'] + '?sap-client=300';
var promise = $http.get(url).then(function(response) {
	return response.data;
}
	);
	return promise;
}});