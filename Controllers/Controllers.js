//
// Gestion des controlleurs
//

//
// Gestion de la navigation 
//
var retail = angular.module("retail", ["google-maps"]).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/articles', {templateUrl: 'Views/ArticlesAvecDetails.html',   controller: 'ListeArticlesJSON'}).
      when('/articlesOld', {templateUrl: 'Views/Articles.html',   controller: 'ListeArticlesJSON'}).      
      when('/articles/:id/description/:descr/EAN/:EAN/Mcategory/:Mcategory/McategoryT/:McategoryT/SalesPrice/:SalesPrice/PurchasePrice/:PurchasePrice/spcur/:spcur/stocks/:stocks', {templateUrl: 'Views/DetailsArticles.html', controller: 'DetailArticle'}).      
      when('/search', {templateUrl: 'Views/Search.html'}).      
      when('/search/:id/description/:descr/EAN/:EAN', {templateUrl: 'Views/ArticlesAvecDetails.html' ,   controller: 'Search'}).      
      when('/map', {templateUrl: 'Views/Map.html' ,   controller: 'Map'}).
      when('/barcode', {templateUrl: 'Views/BarCode.html',   controller: 'BarCode'}).
      when('/aide', {templateUrl: 'Views/Aide.html'}).                  
      when('/config', {templateUrl: 'Views/Config.html',   controller: 'Config'}).
      otherwise({templateUrl: 'Views/Accueil.html', controller: 'Accueil'});
}])

;

//
// Décodage d'un bar code 
//
(function(){
    var UPC_SET = {
        "3211": '0',
        "2221": '1',
        "2122": '2',
        "1411": '3',
        "1132": '4',
        "1231": '5',
        "1114": '6',
        "1312": '7',
        "1213": '8',
        "3112": '9'
    };
    
    getBarcodeFromImage = function(imgOrId){
        var doc = document,
            img = "object" == typeof imgOrId ? imgOrId : doc.getElementById(imgOrId),
            canvas = doc.createElement("canvas"),
            width = img.width,
            height = img.height,
            ctx = canvas.getContext("2d"),
            spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
            numLines = spoints.length,
            slineStep = height / (numLines + 1),
            round = Math.round;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        while(numLines--){
            console.log(spoints[numLines]);
            var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2).data,
                sum = [],
                min = 0,
                max = 0;
            for(var row = 0; row < 2; row++){
                for(var col = 0; col < width; col++){
                    var i = ((row * width) + col) * 4,
                        g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
                        s = sum[col];
                    pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
                    sum[col] = g + (undefined == s ? 0 : s);
                }
            }
            for(var i = 0; i < width; i++){
                var s = sum[i] = sum[i] / 2;
                if(s < min){ min = s; }
                if(s > max){ max = s; }
            }
            var pivot = min + ((max - min) / 2),
                bmp = [];
            for(var col = 0; col < width; col++){
                var matches = 0;
                for(var row = 0; row < 2; row++){
                    if(pxLine[((row * width) + col) * 4] > pivot){ matches++; }
                }
                bmp.push(matches > 1);
            }
            var curr = bmp[0],
                count = 1,
                lines = [];
            for(var col = 0; col < width; col++){
                if(bmp[col] == curr){ count++; }
                else{
                    lines.push(count);
                    count = 1;
                    curr = bmp[col];
                }
            }
            var code = '',
                bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
                u = UPC_SET;
            for(var i = 1, l = lines.length; i < l; i++){
                if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
                else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
                var digits = [
                    round(group[0] / bar),
                    round(group[1] / bar),
                    round(group[2] / bar),
                    round(group[3] / bar)
                ];
                code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
                if(12 == code.length){ return code; break; }
            }
            if(-1 == code.indexOf('X')){ return code || false; }
        }
        return false;
    }
})();

//
// Controlleur pour la lecture d'un code barre 
//
retail.controller('BarCode',
function ($scope) {  
var ss;

       
  $('#PhotoPicker').on('change', function(e) {
    e.preventDefault();   
    
    $scope.val = 'en cours';
    $scope.$digest();
    
    if(this.files.length === 0) return;
      var imageFile = this.files[0];
      
//Propriété de l'imae    
    $scope.size = imageFile.size;
    $scope.name = imageFile.name;
    
//OK Lecture et chargement de l'image
// Nécessite de resizer l'image avant transfert au serveur    
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function(e){
//      var Img = new Image();
//      Img.src = e.target.result;
//      Img.width = 320;
//      Img.height = 240;
//      val = getBarcodeFromImage(e.target.result);
        $scope.imgdata = reader.result;
        $scope.width = '20%';
//Appel fonction lecture barcode
        $scope.$digest();
    $scope.val = getBarcodeFromImage(myimg);
            $scope.$digest();
           };
$scope.$digest() 
});
});


//
// Controlleur pour la page de configuration 
//
 retail.controller('Config',
function ($scope, $http, $routeParams) {
 
$scope.limit = localStorage['limit'];
 
$scope.save = function () {
localStorage['limit'] = $scope.limit;
}

});

//
// Controlleur pour les détails de l'article 
//
retail.controller('DetailArticle',
function ($scope, $http, $routeParams, DetailArticleModel) {
 
var article = DetailArticleModel.getDetailArticle($scope, $routeParams);
  //issu du modèle
  $scope.id = article[0].id;
  $scope.descr = article[0].descr;
  
  //directement les paramètres car aucun traitement particulier dans le modèl
  $scope.EAN = $routeParams.EAN;  
  $scope.Mcategory = $routeParams.Mcategory;
  $scope.McategoryT = $routeParams.McategoryT;
  $scope.SalesPrice = $routeParams.SalesPrice;
  $scope.PurchasePrice = $routeParams.PurchasePrice;        
  $scope.spcur = $routeParams.spcur;
  $scope.stocks = $routeParams.stocks;    


  check_input('result', $scope.EAN);
}
);

//Auto Complete
retail.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    };
});


//
// Controlleur pour la page d'accueil
//
retail.controller('Accueil',
function ($scope, $http) {
  
$http.get('https://cernum53.cernum.com/sap/bc/zicf/magasins?sap-client=300').success(function(data) {
	$scope.magasins = data;
	$scope.mymagasin = localStorage['mymagasin'];
});

$scope.save = function () {
localStorage['mymagasin'] = $scope.mymagasin;
}

});

//
// Controlleur pour la liste des articles 
//
retail.controller('ListeArticlesJSON',
function ($scope, $http, ListeArticlesModel) {
  $scope.limit = typeof(localStorage['limit'])=='undefined' ? 10 : localStorage['limit']; 
  $scope.articles = ListeArticlesModel.getListeArticles($http);

// pour l'autocomplete  
  $scope.listcategories = [
  "Fashion",
"Women",
"Basic",
"Shirts&T-shirts",
"Intimates",
  ];

  
  $scope.upd = function (id, description, Mcategory, McategoryT, EAN, stocks, SalesPrice, PurchasePrice, spcur) {
    $scope.id = id;
    $scope.description = description;
    $scope.Mcategory = Mcategory;
    $scope.McategoryT = McategoryT;
    $scope.EAN = EAN;
    $scope.stocks = stocks;
    $scope.SalesPrice = SalesPrice;
    $scope.PurchasePrice = PurchasePrice;
    $scope.spcur = spcur;
  }

}
);

//
// Controlleur pour le plan 
//
retail.controller('Map',
function ($scope) {  
       
angular.extend($scope, {

		/** the initial center of the map */
		center: {
			lat: 48.859294,
			lng: 2.352396
		},

		/** the initial zoom level of the map */
		zoomProperty: 12,
// These 2 properties will be set when clicking on the map
//		clickedLatitudeProperty: null,	
//		clickedLongitudeProperty: null,
	});

  $scope.findMe = function () {
navigator.geolocation.getCurrentPosition(function(position)
  {
$scope.center.lat = position.coords.latitude
$scope.center.lng = position.coords.longitude

//Ajout d'un marqueur
$scope.markers = [{latitude:position.coords.latitude, longitude:position.coords.longitude}];
$scope.$digest() 			
})
}});

//
// Controlleur pour la gestion de la recherche 
//
retail.controller('Search',
function ($scope, $http, $routeParams, SearchModel) {
  
  $scope.limit = typeof(localStorage['limit'])=='undefined' ? 10 : localStorage['limit'];
  $scope.articles = SearchModel.getResultat($http, $routeParams);

//ok
//    $scope.isSearch = $routeParams.descr;

  $scope.isSearch = function(article){
  if (article.description.match($routeParams.descr) && article.id.match($routeParams.id) && article.EAN.match($routeParams.EAN)) 
  {return article};
  }});

