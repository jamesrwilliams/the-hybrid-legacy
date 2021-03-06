/*
 * OTS App Javascript Core File
 * 
 * @version		1
 * @package		com.tap-code.hybridcompanion
 * @description	The Hybrid Companion Web Application			
 * @author 		James Williams (@James_RWilliams)
 * @copyright 	Copyright (c) 08/03/2015
 *
 */

var ots_news_array = window.localStorage.getItem("ots_news_array");
var content_array = JSON.parse(ots_news_array);

var news_open = true;
var animation_speed = 300;

var user_latitude, user_longitude;

var map;

var i, player, story, settings, Hammer, device, alert, game_data, google;

	// GEOLOCATION STUFF
	
	function onError(error) {
		
		try { 
		    
		    alert('code: '    + error.code    + '\n' +
		          'message: ' + error.message + '\n');
		          
		}catch(e){}
		
	}
	
	var onSuccess = function(position) {
		
			var park = new google.maps.LatLng(51.887533, -2.088750);
		    
		    user_latitude = position.coords.latitude;
		    user_longitude = position.coords.longitude;
		    
		    var mapOptions = {
			    
			    zoom: 17,
			    center: park,
			    disableDefaultUI: true
			    
			};
			
			map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			
			var whiteCircle = {
			    
			    fillOpacity: 1.0,
			    fillColor: "white",
			    strokeOpacity: 1.0,
			    strokeColor: "white",
			    strokeWeight: 1.0,
			    scale: 1.0
			};
			
			$.each(game_data.beacons, function(index, value){
				
				
				var marker = new google.maps.Marker({
					
					position: new google.maps.LatLng(game_data.beacons[index].x, game_data.beacons[index].y),
					fillColor: game_data.beacons[index].marker.fillColor,
					fillOpacity: game_data.beacons[index].marker.fillOpacity,
					strokeColor: game_data.beacons[index].marker.strokeColor,
					strokeOpacity: game_data.beacons[index].marker.strokeOpacity,
					strokeWeight: game_data.beacons[index].marker.strokeWeight,
					icon: {
					
						path: google.maps.SymbolPath.CIRCLE,
						scale: 20
						
					},
					map: map
				});
			
				
				var options = {
					
					path: google.maps.SymbolPath.CIRCLE,
					strokeColor: game_data.beacons[index].marker.strokeColor,
					strokeOpacity: game_data.beacons[index].marker.strokeOpacity,
					strokeWeight: game_data.beacons[index].marker.strokeWeight,
					fillColor: game_data.beacons[index].marker.fillColor,
					fillOpacity: game_data.beacons[index].marker.fillOpacity,
					map: map,
					center: new google.maps.LatLng(game_data.beacons[index].x, game_data.beacons[index].y),
					radius: parseFloat(game_data.beacons[index].marker.radius)
				};

				// Add the circle for this city to the map.
				var cityCircle = new google.maps.Circle(options);
				
				
			});	
	
	};
	
	/** 
	 *	
	 * 
	 */				
	
	function open_news(news_number){
		
		$("#flyout article").html("");
		
		$("#flyout .header h1").text(content_array[news_number][3]);
		$("#flyout article").html("</div><article><h2>" + content_array[news_number][0] + "</h2>" + content_array[news_number][4] + "</article><div onclick='close_news()' id='close_button'>");
		
		$('#flyout').animate({"right": '0'});
		
		$('body').animate("padding","50px");
		
		news_open = true;
		
	}
	
	/**
	 *	
	 * 
	 */				
	
	function close_news(){
		
		$('#flyout').animate({"right": '-100%'});
		
		news_open = false;
		
	}
	
	/**
	 *	
	 * 
	 */		
	 
	function render_news(){
		
		$(".article_list").html("");
	
		for(i = 0; content_array.length > i; i++){
	
			$(".article_list").append(
			
				"<li data-article_number='" + i + "'><h4>" + content_array[i][0] + "</h4><time class='meta'>" + content_array[i][3] + "</time><p>" + content_array[i][2] + "</p></li>");
	
		}
		
		$(".article_list li").click(function(){
		
			open_news($(this).attr("data-article_number"));
				
		});
	
	}
	
	/**
	 *	
	 *	AJAX Request to get game news from a server then rendering it behind a loader. 	
	 *
	 * 	1. Adds Loader anmation to the list. 
	 *
	 * 	2. AJAX request to the server that returns the xml
	 *
	 *	3. On suscessful AJAX finds the listed elemetns of
	 *	   the feed and saves them to the localstorage string.
	 *
	 * 	4. (Fallback) If the AJAX is unsucessful it loads the perviously loaded content to the list.
	 */			
	
	function getNews(){
		
		/* 1 */
		$(".article_list").html("<div class='loader'>Loading...</div><p id='news_loading_text'></p>");
		content_array.length = 0;
		
		$.ajax({
		    
		    /* 2 */   
	        type: "get",
	        url: "http://wearekiwikiwi.co.uk/feed/",
	        dataType: "xml",
	        success: function(data) {
	            
	            /* 3 */ 
	            $(".article_list").html("");
										
					var $XML = $(data);
					$XML.find("item").each(function() {
					
					var $this = $(this),
					item = {
					    title:       $this.find("title").text(),
					    link:        $this.find("link").text(),
					    description: $this.find("description").text(),
					    pubDate:     $this.find("pubDate").text(),
					    content:	 $this.find("encoded").text(),
					};
					
					var temp_array = [item.title,item.link,item.description,item.pubDate.substring(0, 16),item.content]; 
					
					content_array.push(temp_array);
					
					var temp_string = JSON.stringify(content_array);
					window.localStorage.setItem("ots_news_array",temp_string);
				 				            		        
			    });
	            
	            render_news();
	          
	        },
		    error: function(){ 
			
				/* 4 */
				$(".article_list").html("<div class='loader'>Loading...</div>");
			    $("#news_loading_text").html("Cannot Load News");
			    render_news();
			    
			}    
		});	
		
	}		
	
	/**
	 * Animates the closing of the navigation pane. 	
	 * 
	 */				
	
	function closeNav(){
		
		$('#NAV').animate({"left": '-50%'}, animation_speed);
		$(".page").animate({"margin-left":"0"}, animation_speed);
		$('.RETURN').css("display","none");
		
	}
	
	/**
	 *	Function checks the distance from the device against the beacons in the game world and overlays it on the world map.
	 * 
	 */		
	
	function check_distance(point_x, point_y, beacon_x, beacon_y) {
	
	    var a = Math.abs(point_x - beacon_x);
	    var b = Math.abs(point_y - beacon_y);
	
	    var c = Math.pow(a, 2) + Math.pow(b, 2);
	
		var distance = Math.sqrt(c);
		
	    return distance;
	
	}
	
	/**
	 * Aniamtes the opening of the navigation pane. 	
	 * 
	 */				
	 
	function openNav(){
		
		$('#NAV').animate({"left": '0'}, animation_speed);
		$('.page').animate({"margin-left": "50%"}, animation_speed);
		$('.RETURN').css("display","block");
		
	}
	
	/**
	 * Clears the localstorage element used by the news storage. 	
	 * 
	 */				
	
	function clear_app_data(){
		
		localStorage.removeItem('ots_news_array');
		
	}
	
	/**
	 *	
	 * 
	 */				
	
	function render_user_data(){
		
		$("section.master_nav a:nth-child(1)").text("Player ID: " + player.player_id);
		$("#player nav#header h1").text("Player ID: " + player.player_id);
		
	}
	
	/**
	 *	
	 * 
	 */			

	function get_user_data(){
		
	    $.ajax({
		   
	        'async': false,
	        'global': false,
	        'url': "player_test_data.json",
	        'dataType': "json",
	        'success': function (temp_data) {
	            
	            settings = temp_data.settings;
	            player = temp_data.player;
	            story  = temp_data.story;

	            
	        }
	    });
	    
	    render_user_data();
		
	}
	
	/**
	 *	Take Lore Data from the data object and render it on user display.
	 * 
	 */
	 
	function render_lore_data(){
		 
	
		 
	}
		
		/**
		 *	Pul in local lore test data
		 * 
		 */
	
	function get_lore_data(){
		
		$.ajax({
		   
	        'async': false,
	        'global': false,
	        'url': "assets/game_data.json",
	        'dataType': "json",
	        'success': function (temp_data) {
	            
	            game_data = temp_data;
	            
	        }
	    });
	    
	    render_lore_data();
		
	}		

	/**
	 *	PhoneGap onDevice Ready
	 * 
	 *	Function fires once phonegap has init the application. 
	 */			
	
	function onDeviceReady() {
		
	    $("#device").html("Device: " + device.model);
	    
	
	}
	
	/**
	 *	
	 * 
	 */			
	
	$(document).ready(function(){
		
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		
		document.addEventListener("deviceready", onDeviceReady, false);
		
		var hammertime = new Hammer(document.body);
		
		if(content_array === null){
	
			ots_news_array = [["","","","",""]];
			var str = JSON.stringify(ots_news_array);
			window.localStorage.setItem("ots_news_array",str);
			
		}
		
		// Click Detectors (Non Nav)
		
		$("#RETURN").click(			function(){	closeNav();			});
		$("a#NAVBTN").click(		function(){	openNav();			});
		$("#SYNC").click(			function(){	getNews();			});
		$("#NAV a").click(			function(){	closeNav();			});
		
		$("#close_btn").click(function() { close_news(); });
		
		// Navigation Click Detectors
		
		$("#news_button").click(		function(){window.location.href="#news"; 		closeNav();});
		$("#gameguide_button").click(	function(){window.location.href="#gameguide"; 	closeNav();});
		$("#player_button").click(		function(){window.location.href="#player"; 		closeNav();});
		$("#about_button").click(		function(){window.location.href="#about"; 		closeNav();});
		$("#settings_button").click(	function(){window.location.href="#settings"; 	closeNav();});
		$("#infection_button").click(	function(){window.location.href="#infection";   closeNav();});
		
		// Game Links
		
		$("#button_1").click(function(){
			
			var playerMarker = new google.maps.Marker({
				position: new google.maps.LatLng(user_latitude, user_longitude),
				map: map,
				title: 'Hello World!'
			});

			map.panTo(playerMarker.getPosition());

		});
		
		$("#button_2").click(function(){
		
			// TODO Game logic
					
		});
		
		hammertime.on('swipe', function(ev) {
		    
		    if(ev.direction === 4){
			    
			    // Swipe Left => Right
				if(news_open){
				
					close_news();
				
				}else {
				
					openNav();
				
				}
			    
			    
		    }
		    else if(ev.direction === 2){
			    
			    // Swipe Right => Left
			    closeNav();
			    
		    }
		   
		});
		
		get_lore_data();
		get_user_data();
		getNews();
		
		var guide_active = false;
		var top, bottom;
		
		
		$(".lore ul li").click(function(){	
			
			if(guide_active){
				
				// Close Logic
				
				$(this).find(".content").fadeOut();
				
				$(this).delay(100).animate({
					
					"top":top,
					"bottom": bottom,
					
				}, 500, function (){
					
					// TODO Dynamically Load the content
					
					$(this).toggleClass("content_view");
					$( ".dynm" ).remove();
					
					$(this).delay(300).css({
						
						"position":"static",
						"z-index":"0",				
					
					});	
						
				});
				
				guide_active = false;

		
			} else {
				
				top = $(this).position().top;
				bottom = $(".main").height() - ($(this).height() + $(this).position().top);
				
				$(this).before("<li class='dynm'><h3>Item X</h3></li>");
				
				// Open Logic
				$(this).css({
					
					"position":"absolute",
					"top": top,
					"bottom": bottom,
					"z-index":"90000",				
				
				});
				
				$(this).toggleClass("content_view");
				
				
				
				$(this).delay(100).animate({
					
					"top":0,
					"bottom":0,
					
				}, function (){
					
					$(this).find( ".content" ).html("<h1>Hello World</h1>").hide().fadeIn();
					
					
				});

				guide_active = true;
				
				
			}
			
			
	});
		
	$(".clear_app_data").click(	function(){	
			
		navigator.notification.confirm("Clearing this will delete all localdata", clear_app_data);
			
	});

});