const WIDGET_WIDTH_DESKTOP = "33%";
const WIDGET_HEIGHT_DESKTOP = "100%";

const WIDGET_WIDTH_MOBILE = "100%";
const WIDGET_HEIGHT_MOBILE = "55%";

var app = angular.module("app", ["ngRoute", "ui.dashboard", "btford.markdown","matchMedia"]).config(function($routeProvider) {
			$routeProvider.when("/", {
				templateUrl: "common/malhar-dashboard/template/view.html",
				controller: "DemoCtrl",
				title: "simple",
				description: "This is the GPS Stream demo viewer"
			}).otherwise({
				redirectTo: "/"
			})
		});

		
// Extended disable function
// Disable toggle 
jQuery.fn.extend({
	disable: function(state) {
		return this.each(function() {
			var $this = $(this);
			if($this.is('input, button'))
			  this.disabled = state;
			else
			  $this.toggleClass('disabled', state);
		});
	}
});

// Disabled on all:
$('button').disable(true);

// Enabled on all:
$('button').disable(false);


String.prototype.upperCaseFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

$.mynamespace = {};


 // Add list of widgets by defining name,url,renderId.
 // The function will create the angular app 
 //
function addWidgets(def){

	var widgetDefinitions = [];
	var defaultWidgets = [];
	this.directive = [];
	
	var pos = 0;
	var defaultWidgetsPos = 0;
	
	for (var i=0;i < def.length;i++) {
		var prop = def[i];
		if (prop.hasOwnProperty("name") && prop.hasOwnProperty("url") && prop.hasOwnProperty("renderDivId")) {
			
			var directiveNameSplit = prop.renderDivId.split(/(?=[A-Z])/);
			var directiveName = "";
			
			for(var j = 0; j < directiveNameSplit.length; j++){
				directiveName += directiveNameSplit[j].toLowerCase()+"-";
			}
			
			var style = {
					width : "33%",
					height : "50%"
			};
			
			if(typeof(prop.style) != 'undefined'){
				if(typeof(prop.style.height) != 'undefined'){
					style.height = prop.style.height;
				}
				if(typeof(prop.style.width) != 'undefined'){
					style.width = prop.style.width;
				}
			}
			directiveName += "sensor";
 			widgetDefinitions[pos] = {
				name : prop.renderDivId,
				title : prop.name,
				directive : directiveName,
				source : prop.url,
				size: {
				  width: style.width,
				  height: style.height
				},
				enableVerticalResize : true
				
			}
			
			if(prop.hasOwnProperty("defaultWidget") && prop.defaultWidget){
				defaultWidgets[defaultWidgetsPos++] = {
					name : prop.renderDivId,
					title : prop.name
				}
			} 
			
			this.directive[pos] = {
				templateUrl : prop.url,
				renderDivId : "#"+prop.renderDivId
			}
			pos++;
		}
	}

	//build for each factory + directive
	app.controller("DemoCtrl", function($scope, $interval, $window, widgetDefinitions, defaultWidgets,screenSize) {
		$scope.desktop = screenSize.is('md, lg');
		//$scope.mobile = screenSize.is('xs, sm');
		$.mynamespace.desktop = $scope.desktop;
		
		if(!$scope.desktop){
			$.mynamespace.width = WIDGET_WIDTH_MOBILE;
		}
		
		// Using dynamic method `on`, which will set the variables initially and then update the variable on window resize
		//$scope.desktop = screenSize.on('md, lg', function(match){
		//	$scope.desktop = match;
		//	$.mynamespace.width = WIDGET_WIDTH_DESKTOP;
		//	$.mynamespace.height = WIDGET_HEIGHT_DESKTOP;
		//});
		$scope.mobile = screenSize.on('xs, sm', function(match){
			$scope.mobile = match;
			$.mynamespace.width = WIDGET_WIDTH_MOBILE;
		});

		$scope.dashboardOptions = {
			widgetButtons: !0,
			widgetDefinitions: widgetDefinitions,
			defaultWidgets: defaultWidgets,
			storage: $window.localStorage,
			storageId: "demo"
		}
		
	}).factory("widgetDefinitions", function() {
		return widgetDefinitions;
	}).value("defaultWidgets", defaultWidgets);
	
	for (var i=0;i < this.directive.length;i++) {
		var propDir = this.directive[i];
		$.mynamespace[widgetDefinitions[i].directive] = {
			templateUrl : this.directive[i].templateUrl+"",
			renderId : this.directive[i].renderDivId+""
		}
		
		app.directive(widgetDefinitions[i].name.upperCaseFirstLetter()+"Sensor", function($interval){
			return {
				restrict: "A",
				scope: !0,
				replace: !0,
				templateUrl: function(scope, element, attrs){
					return $.mynamespace[$(scope).get(0).attributes[0].localName].templateUrl;
				},
				link: function(scope,widget) {
					jQuery.cachedScript = function( url, options ) {
 
					  // Allow user to set any option except for dataType, cache, and url
					  options = $.extend( options || {}, {
						dataType: "script",
						cache: true,
						url: url
					  });
					 
					  // Use $.ajax() since it is more flexible than $.getScript
					  // Return the jqXHR object so we can chain callbacks
					  return jQuery.ajax( options );
					};
					
					var divId = $.mynamespace[scope.widget.directive].renderId;
					var scripts = $(divId+"  script");
					var cssStyle = $(divId+"  style");
					var cssLink = $(divId+"  link");
					
					var scriptsToLoad = new Array();
					
					if(!$.mynamespace.cssLoaded) {
						$.mynamespace.cssLoaded = new Array();
					}
					
					for(var i = 0 ; i < cssLink.length; i++){
						var script = cssLink[i];
						
						var id = "css_link_"+divId+"_"+i;
						if($.inArray(id,$.mynamespace.cssLoaded) == -1){
							//check if it exists
							 if(script.href){
								 scriptsToLoad.push({
									 src :script.href,
									 type : 'remoteCss'
								 });
							 }else{
								  scriptsToLoad.push({
									 src : script.innerHTML,
									 type : 'innerCss'
								 });
							 }
							 $.mynamespace.cssLoaded.push(id);
						}
					 }
					
					for(var i = 0 ; i < cssStyle.length; i++){
						var script = cssStyle[i];
						//check if it exists
						var id = "css_style_"+divId+"_"+i;
						if($.inArray(id,$.mynamespace.cssLoaded) == -1){
							 if(script.href){
								 scriptsToLoad.push({
									 src :script.href,
									 type : 'remoteCss'
								 });
							 }else{
								  scriptsToLoad.push({
									 src : script.innerHTML,
									 type : 'innerCss'
								 });
							 }
							 
							 $.mynamespace.cssLoaded.push(id);
						 }
					}
					
					for(var i = 0 ; i < scripts.length; i++){
						var script = scripts[i];
						if(script.id && script.id == 'al'){
							  continue;
						}
						if(script.src){
							scriptsToLoad.push({
								src :script.src,
								type : 'remoteJs'
							});
						 }else{
							  scriptsToLoad.push({
								 src : script.innerHTML,
								 type : 'innerJs'
							 });
						 }
					}
					
					resursiveLoad(scriptsToLoad);					
				}
			};
		});
	}
}

function resursiveLoad(arrayFiles){
	var file = arrayFiles[0];
	arrayFiles.shift();
	if(file != null){
		if(file.type == 'remoteJs'){
			$.cachedScript( file.src ).done(function( script, textStatus ) {
				resursiveLoad(arrayFiles);
			});
		} else if (file.type == 'innerJs'){
			eval(file.src);
			resursiveLoad(arrayFiles);
		} else if(file.type == 'remoteCss'){
			$.get(file.src, function(css) {
			   $('<style type="text/css"></style>')
				  .html(css)
				  .appendTo("head");
				  
				  resursiveLoad(arrayFiles);
			});
		} else if (file.type == ('innerCss')) {
			$('<style type="text/css"></style>')
				  .html(file.src)
				  .appendTo("head");
				  resursiveLoad(arrayFiles);
		}
	}
}