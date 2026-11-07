/*!
 * mBank, scripts.js :: 05/02/2013 @ pp
 * Copyright (C) QUERCUS, https://qrqs.eu
 * ICApps :: object to store and initialize functions to control UI (uses jQuery)
 */
/*
 * v. 1.3.3 @ pp: zakomentowanie dodawania ciastka 'nolajt'
 * v. 1.4.0 @ mpd: SKCZDEV-394
 * v. 1.6.1 @ pp (04/07/19): poprawki w funkcji 'initSmartBanner' (SKCZDEV-426)
 * v. 1.6.2 @ fs (13/06/19): infobox-grid lifting (SKCZDEV-419)
 * v. 1.6.3 @ mpd: (24/07/19): wyłaczenie opcji automatycznego skrolowanie do otwartego tabs-a na stronie (SKCZDEV-432)
 * v. 1.6.4 @ mj (30/07/19): dodanie nowej funkcji w 'initSmartBanner' (SKCZDEV-436)
 * v. 1.6.5 @ fs (20/12/19): dodany timeout w 'initUsualTabs', zmiany w 'initTabsHash' (SKCZDEV-462)
 * v. 1.7.0 @ fs (28/11/19): zmiany w 'loadStyles' (SKCZDEV-446)
 * v. 1.8.0 @ pp (13/12/19): odblokowanie oraz modyfikacja funkcji inicjalizujacej kalendarz (initDatePicker), modyfikacja ustawien lokalnych (dpLocal) (SKCZDEV-440)
 * v. 1.9.0 @ pp (19/12/19): dodanie funkcji dodajacych margines pod portletem infobox-grid z placeholderami: 'resizeAreaPromoBar', resizeAreaPromoBarActivate', 'initPromoBar' (SKCZDEV-443)
 * v. 1.10.0 @ fs (20/09/19): przebudowa nawigacji - trzeci poziom, zmiany w 'initMainMenu', dodanie 'setItemHeight' (SKCZDEV-441)
 * v. 1.11.0 @ fs (30/07/19): main nav third level, dodanie metody 'addHeight': ustawianie pozycji 'top' glownego menu dla iOS (SKCZDEV-441)
 * v. 1.11.1 @ pp (11/02/20): poprawki w 'initMainMenu', 'rwdAddMenu', 'addHeight' (SKCZDEV-441)
 * v. 1.11.2 @ pp (20/03/20): dodanie w kalendarzu mozliwosci wyboru dni z innych miesiecy (SKCZDEV-477)
 * v. 1.11.3 @ pp (01/06/20): poprawki dla mobile w funkcji 'initUsualTabs' w przypadku wiecej niz jednego portletu z zakladkami na stronie (SKCZDEV-479)
 * v. 1.12.0 @ fs (21/08/20): text-block-image portlet (SKCZDEV-494)
 * v. 1.12.1 @ fs (26/10/20): popup on click (SKCZDEV-508)
 * v. 1.12.2 @ fs (09/11/20): fancybox with youtube video (SKCZDEV-512)
 * v. 1.12.3 @ fs (27/11/20): 'ifScrolledTop' fix (SKCZDEV-515)
 * v. 1.12.4 @ fs (12/05/21): popup styles fix (SKCZDEV-547)
 * v. 1.12.5 @ pp (27/07/21): modyfikacje funkcji 'loadStyles' - dodanie opcji 'cache:false' do wywolania funkcji AJAX (SKCZDEV-541)
 * v. 1.13.0 @ mf (10/08/21): dodanie funckji zmieniajacej tekst nieaktywnej zakladki 'initTitleChange' (SKCZDEV-551)
 * v. 1.13.1 @ mk (01/12/21): modyfikacja funkcji 'hideAppButtons' - zmiany: mechanizmu oraz jezyka, linkow oraz obrazkow do pobierania aplikacji na urzadzenia mobilne (SKCZDEV-574)
 * v. 1.14.0 @ pp (28/03/22): zablokowanie tworzenia ciasteczek w funkcji 'referrerCookie'; dodanie funkcji do usuwania ciastek 'eraseCookies' (SKCZDEV-596)
 * v. 1.14.1 @ pp (21/04/22): umozliwienie zakladania ciastka w 'referrerCookie' po sprawdzeniu czy mozna; zablokowanie paska z informacja o ciasteczkach;
							  poprawki funkcji 'eraseCookies'; dodanie metody 'consentChanged' (SKCZDEV-603)
 * v. 1.14.2 @ pp (28/03/24): poprawki zwiazane z aktualizacja biblioteki jQuery (MBANKITDEV-21)
 * v. 1.15.0 @ pp (20/03/25): dodanie w funkcji sterujacej menu 'initMainMenu' obslugi WCAG ('keyEvents', nota prawna w .offer-box: 'toggleSub'), dodanie w 'showHiddenMenu' dodawania klasy
							  dla mobile podczas zamykania menu mobilnego + dodanie obslugi stanu 'focus' linkow, dodanie funkcji 'initFooter' dla obslugi WCAG,
							  dodanie metod: 'addDocClicks' oraz 'setStorage' do rejestrowania i sprawdzania klikniec; dodane zdarzenie 'click' do blokowania odswiezania strony (SKCZDEV-784)
 * v. 1.15.1 @ vlk (08/05/25): poprawka dla 'initExpandables', 'showHiddenList', 'showEdgeMenu' aria-expanded dla wcag (SKCZDEV-803, SKCZDEV-802, SKCZDEV-801)
 * v. 1.16.0 @ pp (27/05/25): usuniecie funkcji 'showEdgeMenu' i przeniesienie jej do pliku app/edge-menu.js; poprawka w metodzie 'actionOnClick': objecie funkcji wykonywanej w warunek
							  try {} catch {} (SKCZDEV-801)
 * v. 1.16.1 @ pp (28/05/25): dodanie w metodzie 'consentChanged' blokowania zdarzenia 'click' (preventDefault) oraz jego propagacji (stopPropagation) (SKCZDEV-787)
 */
var ICApps = new function() {

	var self = this;
	var version = 'v. 1.16.1 CZ (1.63.1 PL) :: r. 28/05/25 @ pp';
	var inited = false;
	var scriptType = 'dev';
	var de = null;	//debug variable is set after Debugger object is defined
	var offline = typeof __offline__ == 'boolean' ? __offline__ : false;
	
	this.offline = Utils.offline;	//resource export status
	this.device = Utils.device;	//used device type (desktop, mobile, tablet)
	this.ios = Utils.ios;	//if used device has iOS system
	this.lang = null;	//language version property (pl / en / other) set in 'initLang' function
	this.autoInit = true;	//automatical initialization on DOMContentLoaded
	this.windowWidth = null;	//window width property is set and updated in 'updateWindowWidth' function
	this.smartbanner = false;	//if smartbanner is displayed (boolean) on mobiles

	this.getVersion = function() {
		
		return version;
	};
	
	this.Cnts = {
		CSS			: {
			active		: 'active',
			opened		: 'opened',
			current		: 'current',
			hidden		: 'hidden',
			shown		: 'show',
			mobile		: 'hidden-920',
			under		: 'z-index-0',
			top			: 'at-top',
			over		: 'z-index-1001',
			overflow	: 'overflow-hidd',
			inbetween	: 'z-index-999'
		},
		SCREEN			: {
			rwd		: 920,
			tab1	: 768,
			tab2	: 640,
			tab3	: 569,
			mob1	: 480
		},
		CONTENT		: {
			id			: 'page-content'
		},
		DATEPICK	: {
			id			: 'datepicker',
			icon		: '/.templates/img/icCal.png'
		},
		LABEL		: {
			expand		: {
				cs			: {'collapse' : 'sbalit', 'more' : 'více'},
				sk			: {'collapse' : 'zbaliť', 'more' : 'viac'}
			},
			nav			: {
				cs			: {'change' : 'změňte', 'back' : 'zpět'},
				sk			: {'change' : 'zmeniť', 'back' : 'späť'}
			}
		},
		UITABS		: {
			wrapper		: 'div.tabs-wrapper'
		},
		PRELOAD		: {
			id			: 'preloader'
		},
		COOKIE		: {
			info		: '__mcz-ci',
			infoAlert	: '__mcz-ab',
			referrer	: '__mcz-last-site',
			login		: '__mcz-lg',
			loginType	: '__mcz-lgt',
			consent		: '__mcz-consent'
		},
		INVESTMENTS	:	{
			maxFav		: 6,
			maxBasket	: 15
		},
		FAQ			: {
			cssClass	: 'question'
		},
		COMMUNIQUE	: {
			url		: '/.elements/communique.html',
			param	: 'browser=old'
		}
	};
	
	/*
	 * simple debugger
	 */
	var Debugger = {
		debug	: true,
		silent	: true,
		log		: function(m) {
			this.bug(m);
		},
		bug		: function(m) {
			if (scriptType == 'dev') {
				if (this.debug) {
					try {
						console.log(m);
					}
					catch (e) {
						if (!this.silent)
							alert(m);
					}
				}
			}
		}
	};
	this.de = Debugger;
	de = Debugger;
	
	//jquery effects (mostly slide animation) speed parameter
	this.animSpeed = 200;
	
	// options for NiceScroll, wywołanie: $(...).nicescroll(ICApps.scrollBar);
	//parameters object for mdiscounts
	this.scrollBar = {
		horizrailenabled: false,
		cursorborderradius: '5px', 
		cursorwidth: '3px',
		cursorborder: '1px solid #000',
		railalign: 'right',
		cursoropacitymin: 0.2, 
		cursoropacitymax: 0.6,
		railoffset : {'left': -10},
		railmargin : {top : 10, bottom : 12}
	};
	//parameters object for legal notes
	this.scrollBarLegalNote = { 
		horizrailenabled: false, 
		background: '#999',
		cursorcolor: '#f5f5f5',
		cursorwidth: '3px', 
		cursorborder: 'none',
		cursorborderradius: '0', 
		railalign: 'right', 
		autohidemode: false
	}; 
	
	/* language version property initialization */
	var initLang = function() {
		
		if ((t = $('html'))[0])
			self.lang = t.attr('lang');
	}();
	
	/* adds statisticon object as child of ICApps if exists */
	var addStatsObj = function() {
	
		if (typeof ICStats == 'object')
			self.STATS = ICStats;
	}();
	
	/* old browers communique popup window initialization (IB redirect to www.mbank.pl?browser=old) */
	var checkRedirection = function() {

		if (!$('body').hasClass('hp'))
			return;
		var h = location.href, q = location.search;
		
		if (q.indexOf(self.Cnts['COMMUNIQUE']['param']) > -1) {
			q = q.replace(new RegExp(self.Cnts['COMMUNIQUE']['param'] + "&?"), '');
			var newUrl = h.substring(0, h.indexOf('?')) + (q.length > 1 ? q : '');
			
			$.ajax({
				url		: self.Cnts['COMMUNIQUE']['url'] + '?ajax=true',
				cache	: false,
				success	: function(res) {
					
					$('body').append('<div id="overlay"></div><div id="communique">' + res + '<a class="button close" title="Zavřít" href="#"><span>&nbsp;</span></a></div>');

					var c = $('#communique'), w = $(window).width(), h = $(window).height(), cw = c.outerWidth(), ch = c.outerHeight(), posx = Math.round((w - cw) / 2), posy = Math.round((h - ch) / 2);
					
					if (posx < 0) 
						posx = 0;
					if (posy < 0)
						posy = 0;
					c
						.css({top: posy + 'px', left: posx + 'px'})
						.children('a.button.close').on('click.mcz.communique', function(e) {
							
							e.preventDefault();
							
							if (history.pushState) {
								history.pushState({page: 'mBank'}, 'mBank', newUrl);
								$(this).parent().fadeOut(200);
								$('#overlay').fadeOut(200);
							}
							else {
								window.location = newUrl;
							}
						});
				}
			});
		}
	};
	
	/* function saves referrer cookie for redirection (if to redirect to last visited service section) */
	var referrerCookie = (function() {
		
		var href = window.location.href, pathname = window.location.pathname, uri = pathname.substring(1), res = uri.split('/'), ref = document.referrer;

		if (res.length == 1 && ref.indexOf(href) != -1) {
			Utils.saveCookie(self.Cnts['COOKIE']['referrer'], '', -1);	//removing cookie
		}
		else if (res.length > 1) {
			var allowed = ['osobni', 'firemni', 'premium'];
			
			for (var i = 0; i < allowed.length; i++) {
				if (allowed[i].indexOf(res[0]) >= 0) {
					Utils.verifyCookie(self.Cnts['COOKIE']['referrer'], res[0], 14, 'marketing analytics', true);	//set after verification of consent
					//Utils.saveCookie(self.Cnts['COOKIE']['referrer'], res[0], 14);
					break;
				}
			}
		}
	})();
	
	/* adds client/nonclient class to <body> */
	var userRecognition = function() {
		
		var //ref = Utils.readCookie(self.Cnts['COOKIE']['referrer']),
			lgc = Utils.readCookie(self.Cnts['COOKIE']['login']),
			//lgtc = Utils.readCookie(self.Cnts['COOKIE']['loginType']),
			cssClass = 'nonclient';
		
		if (lgc) {
			/*if (ref == 'osobni') {
				if (!lgtc || lgtc == 'u' || lgtc == 't') {
					cssClass = 'client';
				}
			}
			else if (ref == 'firemni') {
				if (lgtc == 'f') {
					cssClass = 'client';
				}
			}
			else if (!ref) {*/
				cssClass = 'client';
			//}
		}
		$(function() {
			$('body').addClass(cssClass);
			var logoLink = $('#logotype a').attr('href');
			$('#other-option a.home').attr('href', logoLink);
		});
		self.client = cssClass == 'client';
	}();
	
	this.cookie = false;	//if to check cookie information box
	
	/* information about cookies */
	var initCookieInfo = function() {
		
		//if ($('body').hasClass('hp'))
			//Utils.saveCookie('nolajt', 1, 0.04);

		if (self.cookie) {
			var c = Utils.readCookie(self.Cnts['COOKIE']['info']), info = null;
			
			if ((info = $('#cookie-info'))[0]) {
				if (c) {
					if (offline)
						info.hide();
					else
						info.remove();
				}
				else {
					info.addClass('active').hide().fadeIn(self.animSpeed, function() {
						
						$(this).find('a.button.close').on('click.mcz.cookie keydown.mcz.cookie', function(e) {
							
							if (e.type === 'keydown' && e.keyCode !== 13) return; // WCAG keyboard accessibility 07012016 @fs
							
							self.saveCookieInfo();
							
							info.removeClass('active').fadeOut(self.animSpeed, function() {
								
								if (offline)
									$(this).hide();
								else
									$(this).remove();
								ICApps.ALL.updateCalc();	//must recalculate document's height and set footer position
							});
							return false;
						});	
					});
				}
			}
		}
	};
	
	this.saveCookieInfo = function() {
		
		Utils.saveCookie(self.Cnts['COOKIE']['info'], 1, 365);
	};
	
	this.alert = true;	//if to check alert information box
	
	/* information about alert box */
	var initAlertInfo = function() {

		if (self.alert) {
			var ac = Utils.readCookie(self.Cnts['COOKIE']['infoAlert']), infoAlert = null;

			if ((infoAlert = $('section.alert'))[0]) {
				if (ac) {
					if (offline)
						infoAlert.hide();
					else
						infoAlert.remove();
				}
				else {
					infoAlert.addClass('active').hide().fadeIn(self.animSpeed, function() {
						$(this).find('span.close').on('click.mcz.alert keydown.mcz.alert', function(e) {
							if (e.type === 'keydown' && e.keyCode !== 13) return;
							self.saveAlertInfo();
							infoAlert.removeClass('active').fadeOut(self.animSpeed, function() {
								if (offline)
									$(this).hide();
								else
									$(this).remove();
								ICApps.ALL.updateCalc();	//must recalculate document's height and set footer position
							});
							return false;
						});
					});
				}
			}
		}
	};
	
	this.saveAlertInfo = function() {
		
		Utils.saveCookie(self.Cnts['COOKIE']['infoAlert'], 1, 1);
	};
	
	this.datepickerKeyboard = function() {
		
		if (typeof(__tablet__) == 'undefined' && typeof(__mobile__) == 'undefined') {
			$('.datepicker').attr('readonly', false);
		}
	};
	
    var updateWindowWidth = function() {
		
		$(window).on('resize.mcz.width', function() {

			self.windowWidth = window.visualViewport && window.visualViewport.width || window.innerWidth;	//$(window).width();	//viewport width with scrollbars (= media queries), updated due to mobile chrome behavior
		});
		$(document).trigger('resize.mcz.width');
	}();
	
	this.placeholder = false;	//indicate if browser supports placeholder attribute
	
	var placeholderIsSupported = function() {
		
		var test = document.createElement('input');
		self.placeholder = ('placeholder' in test);
	}();
	
	//functions to manage jquery-ui calendar
	//initDatePicker - calendar initialization
	//readDate - read user input (date) and sends to calendar
	//updateDate - updates date field with new date chosen from calendar
	//dpLocal - polish localization to datepicker
	
	this.initDatePicker = function (sel, opts) {
		
		if (!sel)
			sel = 'input[class*=' + self.Cnts['DATEPICK']['id'] + ']';
		
		var dpObj = {
			alignment: 'bottomRight', 
			showOn: 'both',	
			buttonImage: self.Cnts['DATEPICK']['icon'],
			buttonImageOnly: true,
			beforeShow: function (input, inst) {self.readDate(input, inst);},
			onSelect: function (date, inst) {self.updateDate(date, this, inst)}
		};
		if (typeof opts === 'object') {
			$.extend(dpObj, opts);
		}
		var dps = $(sel);
		
		if (dps[0]) {
			dps.datepicker(dpObj);
			$(sel + ':disabled').datepicker('disable');
			self.dpLocal();
		};
	};
	
	this.readDate = function (elm, cal) {
		
		var arr = [], date = new Date(), val, day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear();
		if (val = $(elm).val()) {
			arr = val.split('-');
		}
		if (arr.length > 1 && !isNaN(arr[0])) {
			year = parseInt(arr[2], 10);
			month = parseInt(arr[1], 10);
			day = arr[2] ? parseInt(arr[0], 10) : 1;
		}
		return {defaultDate: new Date(month + ',' + day + ',' + year)};
	};
	
	this.updateDate = function (date, elm) {
		
		$(elm)
			.val(date)
			.trigger('change')
			.trigger('blur');
	};
	
	this.dpLocal = function () {
		
		(function ($) {
			$.datepicker.regional['cs'] = {
				prevText: '', nextText: '',
				closeText: 'Cerrar', currentText: 'Hoy',
				monthNames: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
				monthNamesShort: ['Le', 'Ún', 'Bř', 'Du', 'Kv', 'Čn', 'Čc', 'Sr', 'Zá', 'Ří', 'Li', 'Pr'],
				dayNames: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
				dayNamesShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'], dayNamesMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
				weekHeader: 'Sm', dateFormat: 'dd-mm-yy', 
				showOn: 'both', firstDay: 1, isRTL: false, showMonthAfterYear: true, showOtherMonths: true, selectOtherMonths: true, hideIfNoPrevNext: true, yearSuffix: ''
			};
		})(jQuery);
		$.datepicker.setDefaults($.datepicker.regional['cs']);
	};
	
	//init multiple jquery ui tabs
	var initMultiTabs = function() {
		
		var h = document.location.hash,
			t = $(self.Cnts['UITABS']['wrapper']);

		if (t[0]) {
			var i = 0;
			t.each(function() {
				var selectedTab = 0,
					index = i,
					tab;

				this.index = index;

				if ((tab = h.indexOf('t' + index)) != -1) {
					selectedTab = parseInt(h.substr(tab + 3, 1), 10); //tab number for this list
				}

				$(this).tabs({
					beforeLoad: function(event, ui) {
						
						$('div.tabsContainer').prepend('<div id="preloader"></div>');
					},
					activate: function(event, ui) {
						
						ui.oldPanel.empty();
					},
					load: function(event, ui) {
						
						$(ui.panel.attr('id'))
							.hide()
							.fadeIn(self.animSpeed);
						$('div.tabsContainer #preloader').remove();
						self.ajaxCall('#' + ui.panel.attr('id'));	//initialize effects on ajax elements

						if (typeof ICApps.HP == 'object')	//calculating doc height once again
							ICApps.HP.setHeight();
					},
					active: selectedTab
				});
				++i;
			})
			.find('ul.tabs > li a')
				.click(function() {//dokleja hashe z numerami list i zakladek
					
					var h = document.location.hash;
					var p = $(this).parents(self.Cnts['UITABS']['wrapper'])[0];
					var currList = p.index; //numer listy
					var currTab = $(this).parent('li').index(); //numer zakladki
					
					if (!h) {
						document.location.hash = 't' + currList + '=' + currTab + ';';
					}
					else {
						if ((tabs = h.indexOf('t' + currList)) == -1) {
							document.location.hash = h + 't' + currList + '=' + currTab + ';';
						}
						else {
							var oldTab = h.substr(tabs, 4);
							var newTab = 't' + currList + '=' + currTab;
							var newHash = document.location.hash.replace(oldTab, newTab);
							document.location.hash = newHash;
						}
					}
				});	
		}
	};
	
	this.ajaxCall = function(elm) {
		
		self.initExpandables(elm);
		self.initSelects(elm);
		self.initTooltip(elm);
		fancyGallery();
	};
	
	this.initSelects = function(elm) {
		
		elm = elm ? elm + ' ' : '';

		if ((s = $(elm + 'select.ui'))[0])
			s.each(function() {
				
				var params = {
						//showEffect: 'slideDown',
						//hideEffect: 'slideUp',
						//showEffectSpeed: self.animSpeed,
						//hideEffectSpeed: self.animSpeed
					};

				if ($(this).hasClass('go')) {
					params['aggresiveChange'] = true;
				}
				$(this).selectBoxIt(params);
			});
	};
	
	this.initTooltip = function(elm, params) {

		if (params && typeof params != 'object') {
			return;
		}
		elm = elm ? elm + ' ' : '';

		if ((t = $(elm + 'a.poznamka, ' + elm + 'img.poznamka, ' + elm + 'span.poznamka'))[0]) {

			function convertNewLines(txt) {
				return txt = txt.replace(new RegExp("\n", 'g'), '<br>');
			}
			t.each(function() {
				var txt = $(this).attr('data-txt');

				if (!txt) {
					txt = $(this).attr('title') || $(this).attr('alt');

					if (txt) {
						txt = convertNewLines(txt);

						$(this)
							.attr('data-txt', txt)
							.removeAttr('title');
					}
				}
				else {
					$(this).attr('data-txt', convertNewLines(txt));
				}
			})
			.tooltip(params);
		}
	};
	
	// expandable elements
	this.initExpandables = function(elm) {
	
		elm = elm ? elm + ' ' : '';
		
		$(elm + '.expandable .switch:not(.active)')
			.on('click.mcz.expand keypress.mcz.expand', function(e) { // changed due to WCAG keyboard accessibility 05012016 @fs
				
				var a = this, exp = $(this).closest('div:not(.switch), li'), w = $(this).attr('data-width') ? $(this).attr('data-width') : self.windowWidth;
				//ICApps.HP.resetHeight();
				
				if (e.type === 'keypress' && e.keyCode !== 13) return; // added due to WCAG keyboard accessibility 05012016 @fs
				
				if (self.windowWidth <= w) {
					exp
						.toggleClass('opened', !a.speed ? false : exp.hasClass('opened') ? false : true)
						.children('div:not(.switch)').slideToggle(a.speed || 0, function() {
							
							a.speed = ICApps.animSpeed;
							ICApps.ALL.updateCalc();
						});

					if (exp.hasClass('clean')) {
						var label = self.Cnts['LABEL']['expand'][self.lang], txt = exp.hasClass('opened') ? label['collapse'] : label['more'];
						$(this).text(txt + ' &rsaquo;');
					}
				}
				$(this).attr('aria-expanded', exp.hasClass('opened'));
			})
			.addClass('active')
			.each(function() {
				
				var w = $(this).attr('data-width') ? $(this).attr('data-width') : self.windowWidth;
				if (self.windowWidth <= w) {
					
					if (!$(this).closest('div, li').hasClass('opened')) {
						$(this).trigger('click.mcz.expand');
					}
					else {
						this.speed = ICApps.animSpeed;
					}
				}
				$(this).attr('aria-expanded', $(this).parent().hasClass('opened'));
			});
			
	}; // end expandable elements
	
	//for indoor (CMS) use only
	this.correctPath = function(s) {
		
		if (s)
			$(s).each(function() {
				var i = $(this).css('background-image');
				i = i.replace('/images', '/images');
				$(this).css('background-image', i);
			});
	};
	
	this.initGloss = function() {
		
		$('#response p.switch a')
			.click(function(e) {
				
				e.preventDefault();
				$(this)
					.toggle()
					.parent().next().fadeToggle(this.animSpeed);
			})
			.parent().next().hide();
	};
	
	this.initInputs = function(sel) {
		
		var inputvalues = [];
		sel = (sel ? sel + ' ' : '') + 'input'; 
		$(sel).on({
			click: function() {
				
				var n = $(this).attr('name');
				if (!inputvalues[n])
					inputvalues[n] = $(this).val();

				if ($(this).val() == inputvalues[n])
					$(this).val('');
			},
			blur: function() {
				
				if ($(this).val() == '')
					$(this).val(inputvalues[$(this).attr('name')]);
			}
		});
	};
	
	/* this function remembers original scroll position and moves back to this after closing legal note or menu (opening one of these two causes scrolling to top) */
	this.moveToScroll = function() {
		
		var attr = 'data-scroll', s = $('body').attr(attr);
		
		if (typeof s != 'undefined') {
			$('body').removeAttr(attr);
			
			if (s) {
				$(window).scrollTop(parseInt(s, 10));	//moving back to original scroll position
			}
		}
		else {
			$('body').attr(attr, $(window).scrollTop());	//adding original scroll position to <body> as 'data-scroll' attribute
		}
	};
	
	/* function to add additional submenu */
	var rwdAddMenu = function() {
		
		var addMenu = $('li.rwd-add-menu');
		
		$('body:not(.nav-file) #head nav ul.menu > li.active > ul.submenu').append(addMenu);	//cannot add this item in file navigation (this item is added there in 'initMainMenu')
	};
	
	/* function to iniitialize main menu with submenus behaviour */
	var initMainMenu = function() {
		
		var head = $('#head > div'),	//div in the header with main menu
			menu = head.find('ul.menu'),	//main menu
			toggleBtn = $('#main-nav-toggle'),	//button to choose client section (on mobile)
			elems = menu.find('> li > .menu-item-wrapper'),	//divs at root level menu
			items = menu.find('> li > ul.submenu > li'),	//items (li) at second level menu
			boxes = items.find('> ul.submenu'),	//submenus (ul) at third level
			topBtn = $('#banner-content .content p.button-top, #main-banner-carousel .container .button-top'),
			navToggle = $('#nav-toggle'),	//mobile button to toggle mobile submenu
			actions = $('ul.actions'),
			ctaLink = $('#cta-button a:visible'),	//CTA button visible href
			logInLink = $('#log-in a:visible'),	//login button visible href (A)
			//rating = null,	//mobile rating button; commented out cause rating button was removed from header
			activeMenuItem = null;	//root level active's menu item href (chosen client section; set in 'findActive')
		
		if (!menu.length) {	//on pages without main menu executing below script is unnecessary
			return;
		}
		$(window).on('resize.mcz.toggle-sub', function() {
		
			findActive();	//finding if there are already set active menu items
			//findRating();	//finding if there is already added mobile rating button; commented out cause rating button was removed from header
			
			function setActivity() {	//have to set active items in memu (based on URL)
				
				function checkEn(arr) {	//function to determine if we are in english page (check if first index in array is 'en' folder)
					
					if (arr[0] == 'en') {	//if we are on english page have to substract first index from array
						arr.shift();
					}
					return arr;
				}
				
				function remove(str) {	//function to remove multiple slashes and 'index.html' ending given string (leaving only folder path)
					
					return str.replace(/\/{2,}/g, '/').replace(/index\.html$/, '');
				}
				
				function correctHref(link) {	//function to remove port number from given link
					
 					link = link.replace(/\/\?.*?$/, '/');
					
					if (self.offline) {
						link = link.replace(/:\d{4}/, '');
					}
					return link;
				}
				
				var uri = location.protocol + '//' + location.hostname + remove(location.pathname),
					res = '',
					root = '',	//root path
					active = menu.children('li[data-active]');	//root item checked by user as active on www
				
				if (active[0]) {	//if some root item should be active then we add activity class to that item instead automatic item activation
					active.addClass(self.Cnts['CSS']['active']);
				}
				else {	//if there's no activated item by user then have to set activity automatically from all root items
					elems.each(function() {
						
						var link = correctHref($(this).children('a')[0].href);	//offline port number has to be removed from it
						
						if (uri.search(link) == 0) {	//if item's link first resource and URI are equal from beginning up to first level
							var current = uri === link ? 'page' : 'true';
							$(this).children('a').eq(0).attr('aria-current', current);	//setting aria current attribute (WCAG)
							$(this).parent().addClass(self.Cnts['CSS']['active']);
						}
					});
				}
				items.each(function() {
					
					var link = $(this).find('a'),
						href = correctHref(link[0].href);
					
					link.addClass('nmp');	//added nmp class to prevent mobile preloading (preloadLinks function)

					if (uri.search(href) == 0) {	//if item's link first resource and URI are equal from beginning up to second level
						var current = uri === link ? 'page' : 'true';
						$(this).find('a').eq(0).attr('aria-current', current);	//setting aria current attribute (WCAG)
						$(this).addClass(self.Cnts['CSS']['active']);
					}
				});
				boxes.find('> li'/*'> li:not(.offer-box)'*/).each(function() {
					
					var link = correctHref($(this).find('a')[0].href);
					
					if (uri.search(link) == 0) {	//if item's link first resource and URI are equal from beginning up to third level
						var current = uri === link ? 'page' : 'true';
						$(this).find('a').eq(0).attr('aria-current', current);	//setting aria current attribute (WCAG)
						$(this).addClass(self.Cnts['CSS']['active']);
					}
				});
			}
			
			if (!activeMenuItem[0]) {	//if page has gen-nav portlet (it generates activity)
				setActivity();	//in included file navigation have to set activity
				
				elems.each(function() {	//removing submenu elements (second levels) from root items that aren't active
					
					var li = $(this).parent();	//root item
					
					if (!li.hasClass(self.Cnts['CSS']['active'])) {
						li.children('ul.submenu').remove();
					}
				});
				findActive();	//finding active menu items
			}
			
			function findActive() {
				
				activeMenuItem = menu.find('> li.' + self.Cnts['CSS']['active'] + ' > div > .menu-item-href');
			}
			
			function findRating() {
				
				rating = $('li.rwd-add-menu.rating');
			}
			
			function toggleSub(elm, action, fs) {	//opening/closing menu actions
				
				if (elm.hasClass('dropdown')) {	//toggling actions have to be done only if item has class 'dropdown' (third level menu exists)
					self.setStorage('nav', true);	//marking that menu item was clicked to not close dropdown
					
					if (action == 'open') {
						self.closeSub(elm.siblings());	//have to close all other opened submenus
						elm
							.addClass(self.Cnts['CSS']['opened'])
							.find('> div > a').attr('aria-expanded', true);	//at opening dropdown menu have to change aria attribute state (WCAG)
						
						elm.children('ul').slideDown(self.animSpeed, function() {		//sliding down (opening) submenu
							
							var ul = $(this), offer = ul.children('.offer-box'), legal = null;	//if it has 'offer-box' item
							
							if (offer) {	//after unfolding submenu have to strech it if it has 'offer-box' higher than list
								var sh = ul.outerHeight(), oh = offer.outerHeight();
								
								if (oh > sh) {	//have to equalize both boxes' (li.offer-box and its parant list (submenu)) heights
									ul.outerHeight(oh);
								}
								else {
									offer.outerHeight(sh);
								}
								offer.css('visibility', 'visible');	//after sliding down dropdown menu can display offer-box
							}
							if ((legal = ul.find('.legal-note')).length) {	//if offer-box has legal note have to add/remove special attribute to parent list (submenu) on opening/closing legal note
								legal.children('.legal-label')
									.off('click.mcz.toggle-sub keydown.mcz.toggle-sub')
									.on('click.mcz.toggle-sub keydown.mcz.toggle-sub', function(e) {
										
										if (e.which !== 27) {	//ESC
											ul.attr('legal', true);
											self.setStorage('nav', true);	//marking document click as 'nav' to prevent closing dropdown menu
										}
										else {
											var c = $(this).next('.legal-text').find('.close');
											c
												.trigger('click.mcz.toggle-sub')	//removing attribute to close legal note
												.trigger('click.mcz.hidden');	//closing dropdown
											sessionStorage.removeItem('nav');	//removing item to close menu (COMMONS -> addDocClick)
										}
									})
									.parent().find('.close')
										.off('click.mcz.toggle-sub')
										.on('click.mcz.toggle-sub', function() {
											
											ul.removeAttr('legal');
										});
							}
							if (fs) {	//if fs parameter = true then have to set focus on href (WCAG)
								ul.find('li:first-child > div > a')[0].focus();
							}
						});
					}
					else {
						var u = elm.children('ul');
						
						if (!u.attr('legal')) {	//if legal note in offer-box is open cannot close dropdown list
							setTimeout(function() {	//looking for CSS class in submenu
								
								var a = u.prop(self.Cnts['CSS']['active']);
								
								if (!u.hasClass(self.Cnts['CSS']['opened']) && (!a || a == 0)) {	//if submenu has CSS class or is not active (mouse hover event)
									self.closeSub(u, fs);	//close submenu
								}
							}, 0);	//has to be timeout for asynchronous execution
						}
					}
				}
			}
			
			self.closeSub = function(elm, fs) {	//function to close submenu
				
				if (!elm.length) {	//passed element has to exist
					return;
				}
				if (elm[0].nodeName != 'UL') {	//this function can be engaged by different objects: LI or UL so have to check and set UL
					elm = elm.children('ul');
				}
				elm.parent('li')
					.removeClass(self.Cnts['CSS']['opened'])	//removing 'opened' CSS class from item (LI) (only if UL engaged this function)
					.find('> div > a').attr('aria-expanded', false);	//changing aria attribute state (WCAG)
				
				elm.each(function() {	//have to check all lists for opened legal note and close it
				
					if ($(this).attr('legal') === 'true') {	//if list has 'legal' attribute then legal note is opened and have to close it
						$(this).removeAttr('legal');
						$(this).find('.legal-text .close').trigger('click.mcz.hidden');	//closing legal note
					}
				});
				elm.children('.offer-box').css('visibility', 'hidden');	//before sliding up dropdown menu have to hide the offer-box
				elm
					.removeClass(self.Cnts['CSS']['opened'])	//removing
					.slideUp(self.animSpeed, function() {
						
						if (fs) {	//if fs parameter = true then have to set focus on href (WCAG)
							elm.parent().find('> div > a')[0].focus();
						}
					});	//closing submenu
			};
			
			function isSub(elm) {
				
				return elm.hasClass('dropdown');	//if LI element has 'dropdown' CSS class (submenu exists)
			}
			
			var event = self.device !== 'desktop' ? 'click' : menu.attr('data-event'),	//if used device isn't desktop (i.e. iPad) menu have to operate on click event since there is no mouse event
				hrefs = items.find('> .menu-item-wrapper > a'),	//links (A) in submenu
				subMenu = activeMenuItem.parent().siblings('ul.submenu');	//second level menu of active root item
			
			//function to add keboard events for WCAG
			function keyEvents(elms) {
				
				var rwd = self.windowWidth <= self.Cnts['SCREEN']['rwd'];
				
				elms
					.off('focus.mcz.toggle-sub blur.mcz.toggle-sub custom.mcz.toggle-sub.open keydown.mcz.toggle-sub')
					.on('focus.mcz.toggle-sub blur.mcz.toggle-sub', function(e, param) {	//focus event listener is added for keyboard navigation (WCAG)
						
						if (!rwd) {
							var l = $(this).closest('li');
							
							if (e.type === 'blur' && l.attr('data-level') == 2) {
								setTimeout(function() {
									
									if (!l.find('> ul > li:first-child a').is(':focus')) {	//only if next item (first href in dropdown menu) doesn't have focus dropdown can be closed
										items.trigger('mouseleave.mcz.toggle-sub', [l]);	//triggering mouseleave event (closing the menu)
									}
								}, 50);
							}
						}
					})
					.on('custom.mcz.toggle-sub.open', function(e, l) {	//after pressing ENTER key opening dropdown menu
						
						if (!rwd) {
							l.prop(self.Cnts['CSS']['active'], 0);	//setting activity flag for LI element to false
							toggleSub(l, 'open', true);	//third parameter means that focus event should be triggered
						}
						else {
							l.find('> div > a').trigger('click.mcz.toggle-sub', [true]);	//executing click event with passed argument (enter key was pressed)
						}
					})
					.on('keydown.mcz.toggle-sub', function(e) {	//after pressing defined keys magic happens :)
						
						if (e.type === 'keydown') {
							//functions below are to calculate which item to select after pressing key: ARROW DOWN, ARROW LEFT, ARROW RIGHT, ARROW UP, ESCAPE
							function left() {
								
								return lvl == 3 ? ((l = l.parent().parent('li')).is('[data-first]') ? l.siblings('[data-last]') : l.prev()) : (l.is('[data-first]') ? l.siblings('[data-last]') : l.prev());
							}
							
							function right() {
								
								if (!rwd && lvl == 3) {
									l = l.parent().parent('li');
								}
								return l.is('[data-last]') ? l.siblings('[data-first]') : l.next();
							}
							
							function up() {
								
								//de.bug('lvl: ' + lvl + ' fst: ' + fst);
								return lvl > 1 ? (lvl == 3 ? (fst ? l.siblings('[data-last]') : l.prev()) : l.parent().parent('li')) : left(l);
							}
							
							function down() {
								
								//de.bug('lvl: ' + lvl + ' l: ' + l.is('[class~=dropdown]') + ' ' + l.find('li:first-child a')[0]);
								return (rwd && toggleBtn.is(':focus') ? null : lvl < 3 ? (d ? (lvl == 2 ? 2 : l.find('li:first-child')) : null) : (lst ? l.siblings('[data-first]') : l.next()));
							}
							
							var l = $(this).closest('li'),
								lvl = l.attr('data-level'),
								d = l.hasClass('dropdown'),
								a = l.attr('data-active'),
								fst = l.is('[data-first]'),
								lst = l.is('[data-last]:not(.offer-box)'),
								n;	//item to select (add focus to it) or boolean or null
							
							switch(e.keyCode) {
								case 37/*left*/		: n = !rwd ? left(l) : false; break;
								case 39/*right*/	: n = !rwd ? right(l) : false; break;
								case 38/*up*/		: n = (!rwd || (rwd && lvl == 3) ? up(l) : left(l)); break;
								case 40/*down*/		: n = (!rwd || (rwd && lvl == 3) ? down(l) : right(l)); break;
								case 27/*ESC*/		: n = lvl == 3 ? 3 : (rwd ? 4 : null); break;	//pressing this key causes dropdown menu (level 3) to close
								case 13/*ENTER*/	: n = lvl != 1 && d ? 2 : (a ? false : true); break;	//open third level dropdown or link
								case 9/*TAB*/		: n = lvl == 3 ? ((!rwd && fst && e.shiftKey) || (!rwd && lst && !e.shiftKey) ? 3 : true) : true; break;	//
								case 16/*SHIFT*/	: n = true; break;	//
							}
							//de.bug('keyCode: ' + e.keyCode + ' which: ' + e.which + ' n: ' + n + ' lvl: ' + lvl);
							if (typeof n === 'object') {
								if (n) {
									n.find('a[data-item]').eq(0).trigger('focus.mcz.toggle-sub', [true]);
								}
							}
							else {
								if (n) {
									if (!rwd && n === -1) {	//moving before menu (logo)
										l.closest('div#nav').prevAll('#logotype').children('a').eq(0)[0].focus();
									}
									else if (!rwd && n === 1) {	//moving after menu (searchengine, contact, ATMs or login, depends on link visibility)
										l.parent().next('ul').find('li:first-child:visible a')[0].focus();
									}
									else if (n === 2) {	//opening dropdown menu after pressing arrow down key or enter key
										l.find('> div > a').eq(0).trigger('custom.mcz.toggle-sub.open', [l]);
									}
									else if (n === 3) {	//closing dropdown menu after pressing escape key
										if (!rwd) {
											toggleSub(l.parent().parent(), 'close', true);
										}
										else {
											l.siblings('li.back').trigger('click.mcz.toggle-sub', [true]);	//executing click event with passed argument (escape key was pressed)
										}
									}
									else if (n === 4) {	//on mobiles pressing Escape switches from second to first level
										if (rwd) {
											if (lvl == 1) {	//we're in section menu
												toggleBtn[0].focus();
												toggleBtn.trigger('keydown.mcz.toggle-main-nav', [-3]);
											}
											else if (lvl == 2) {	//hiding submenu
												navToggle.trigger('click.mcz.show-hidden');
											}
										}
									}
									else if (n === true) {	//if any (and not defined) key was pressed do normal stuff
										self.setStorage('nav', true);	//marking event (that one of 'nav' links was pressed)
										
										if (rwd) {
											if (e.keyCode === 9) {
												if (lvl == 1 && (fst && e.shiftKey || lst && !e.shiftKey)) {	//TAB was pressed and have to close section menu
													toggleBtn.trigger('keydown.mcz.toggle-main-nav', [-3]);
												}
												else if ((lvl == 2 || lvl == 3) && lst && !e.shiftKey) {
													actions.attr('data-tabbed-from', l.attr('id'));
													actions.find('[data-index="1"]')[0].focus();
													return false;
												}
											}
										}
										return true;
									}
								}
						}
						return false;
					}
				});
			}
			
			if (self.windowWidth > self.Cnts['SCREEN']['rwd']) {	//screen resolution bigger than mobile menu styles (> 920px) - desktop view
				if (navToggle.hasClass(self.Cnts['CSS']['active'])) {	//it means mobile menu is on
					//var eventType = $('html').attr('data-input') === 'key' ? 'keydown' : 'click';
					navToggle.trigger('click.mcz.show-hidden');	//closing mobile menu ('showHiddenMenu' function)
				}
				//if (rating[0]) {	//if mobile rating button exists have to remove it and added footer box item
					//rating.next('.added-box').remove();
					//rating.remove();
				//}
				items
					.removeClass(self.Cnts['CSS']['opened'])
					.removeAttr('style')
					.removeProp(self.Cnts['CSS']['active']);	//have to remove possibly added styles (display: block) and 'active' property to second level items in mobile view
				items.parent()
					.removeAttr('style');	//have to remove possibly added height to second level menu in mobile view
				items.find('> div > a').attr('tabindex', 0)	//have to set this attribute as submenu is visible all the time
				menu
					//.attr('tabindex', 0)	//have to set this cause in mobile view menu is hidden
					.attr('role', 'menubar');	//adding possibly removed in mobile view ARIA attribute
				menu.children('.' + self.Cnts['CSS']['active']).removeAttr('style');	//have to remove possibly added height to active root item in mobile view
				//menu.find('> li.' + self.Cnts['CSS']['active'] + ' > ul.submenu > li.added-box').remove();	//removing possibly added footer box item to this submenu
				
				elems.parent().children('ul.submenu').attr('role', 'menubar');	//adding possibly removed in mobile view ARIA attribute
				actions.off('keydown.mcz.toggle-actions');	//removing key event from icons in actions menu possibly added in mobile view
				
				/* observing width of an element: if no width then Lola font isn't loaded yet
				   '#agencies a' element has special font AdobeBlank which has no dimmensions
				 */
				var intv = setInterval(function() {
					
					var origMenuWidth = menu.width();
					
					if (origMenuWidth) {
						clearInterval(intv);
						menu.attr('data-loaded', true);	//setting loaded attribute for CSS (fonts)
						/* setting submenu width */
						var dum = subMenu.children('li.dummy');	//added empty submenu item
						var maxWidth = head.outerWidth();	//maximum width of submenu (second level)
						
						subMenu.removeAttr('style');	//have to remove width possibly added to submenu
						
						if (!dum[0]) {	//if there's no dummy item have to add one
							dum = $('<li class="dummy" role="none" />');
							subMenu.append(dum);
						}
						dum.removeAttr('style');	//removing possibly added earlier inline styles
						
						if (subMenu.outerWidth() > maxWidth) {	//if second lavel menu is wider than maximum added item has to gain width
							dum.css('width', '50%');
						}
					}
				}, 50);
				
				if (event) {	//if attribute exists (precaution)
					if (event === 'click') {	//set submenu displayed on click event
						hrefs
							.off()	//have to remove all attached events because of possibility of earlier attach
							.on('click.mcz.toggle-sub', function(e) {
								
								var li = $(this).closest('li');	//parent LI element
								
								if (!isSub(li)) {	//if parent LI element has 'dropdown' CSS class (submenu exists)
									return;
								}
								e.preventDefault();	//intercepted default behaviour
								toggleSub(li, (!li.hasClass(self.Cnts['CSS']['opened']) ? 'open' : 'close'));
							});	//if submenu is visible (has class 'opened') have to close it otherwise we should open it
					}
					else {	//submenu displayed on hover
						hrefs	//ul.submenu > li > div > a
							.off()	//have to remove all attached events because of possibility of earlier attach
							.on('mouseenter.mcz.toggle-sub'/* focus.mcz.toggle-sub'*/, function(e) {	//focus event listener is added for keyboard navigation (WCAG)
								
								var l = $(this).closest('li');
								l.prop(self.Cnts['CSS']['active'], 1);	//adding activity flag to parent LI element (mouse over href)
								toggleSub(l, 'open');
							});
						items	//ul.submenu > li
							.off()
							.on('mouseleave.mcz.toggle-sub', function(e, l) {
								
								if (!l) {
									l = $(this);
								}
								l.prop(self.Cnts['CSS']['active'], 0);	//removing activity flag from LI element on mouse leaving it
								toggleSub(l, 'close');
							});
					}
					keyEvents(elems.children('a'));
					keyEvents(hrefs);
					keyEvents(boxes.find('> li > div > a, > li > a'));
				}
				boxes	//ul.submenu > li > ul.submenu
					.each(function() {
						
						var ul = $(this);
						
						ul.css('visibility', 'hidden').show().removeClass('wide');	//after resizing (or for the first time) have to remove possibly added CSS class as we do not know if window has shrunk or widen
						ul.removeClass(self.Cnts['CSS']['opened']).removeAttr('legal');	//have to remove 'opened' CSS class as well as 'legal' attribute (possibly added if there is offer-box item in the list)
						ul.find('.legal-text .close').trigger('click.mcz.hidden');	//closing possible legal notes (in offer-box)
						
						if (ul.hasClass('back')) {	//if user clicked this submenu on mobile has to remove back item and back CSS class
							ul
								.removeClass('back')
								.children('li.back').remove();
						}
						if (ul.hasClass('offer')) {	//if submenu list has offer-box item inside then have to add it's width to list width
							ul.css('width', 'auto');	//have to reset possibly updated width
							ul.css('width', ul.outerWidth() + ul.children('.offer-box').children('.text-box').outerWidth());
							var last = ul.find('[data-last]');	//maybe more than one cause on rwd offer-box is hidden and we have to make previous item last
							
							last.each(function(i, elm) {
								
								if (!$(elm).hasClass('offer-box')) {	//if li have this attribute but it's not offer-box have to remove it
									$(elm).removeAttr('data-last');
								}
							});
						}
						if (!ul.hasClass('wide') && (ul.offset().left + ul.outerWidth() > window.innerWidth)) {	//if list doesn't fit on scrren (it's too wide) but hasn't been corrected yet (hasn't got 'wide' CSS class) we can correct its position
							ul.addClass('wide');
						}
					})
					.off()	//have to remove all attached events because of possibility of earlier attach
					.on('mouseenter.mcz.toggle-sub', function() {
						
						var t = $(this);
						t.prop(self.Cnts['CSS']['active'], 1);	//adding activity flag (mouse over event)
						$(this).addClass(self.Cnts['CSS']['opened']);	//only adding CSS class
					})
					.on('mouseleave.mcz.toggle-sub', function() {
						
						var t = $(this);
						t.prop(self.Cnts['CSS']['active'], 0);	//removing activity flag (mouse over event)
						$(this).removeClass(self.Cnts['CSS']['opened']);	//only adding CSS class
						
						if (!t.attr('legal')) {	//checking if possible legal note inside this (in offer-box item) isn't open
							setTimeout(function() {
								
								if (t.parent('li').prop(self.Cnts['CSS']['active']) == 0) {	//if parent element isn't active (mouse over event)
									self.closeSub(t);	//have to close submenu and remove CSS class
								}
							}, 200);
						}
					});
				boxes.css({'display' : 'none', 'visibility' : 'visible'});	//have to correct CSS to be able to show this
			}
			else {	//mobile view (< 920)
				elems.parent().children('ul.submenu').attr('role', 'menu');	//submenu in this view is hidden and toggled with 'toggleBtn' button
				boxes
					.removeAttr('style')
					.each(function() {
						
						$(this).find('.offer-box').each(function() {	//in rwd offer-boxes are hidden so have to previous item (LI) make last one
							
							if ($(this).attr('data-last')) {
								$(this).prev().attr('data-last', '');
							}
						});
					});
				
				menu
					.attr('role', 'menu')	//removing role=menubar
					//.attr('aria-orientation', 'vertical')	//in mobile view second level items are listed vertically
					.attr('data-loaded', true);	//setting loaded attribute for CSS (fonts)
				
				if (activeMenuItem.length) {	//setting label on toggle menu
					toggleBtn	//adding ARIA attributes for WCAG
						.attr('aria-label', activeMenuItem.attr('aria-label') + ' - ' + self.Cnts['LABEL']['nav'][self.lang]['change'])
						.attr('role', 'button')
						.attr('aria-current', 'true')
						.find('span').html(activeMenuItem.html());
					
				}
				//have to toggle WCAG elements visibility
				var hideMenu = !toggleBtn.hasClass(self.Cnts['CSS']['opened']) ? -1 : 0;	//-1 -> hide, 0 -> show
				menu.attr('tabindex', hideMenu);
				items.find('> div > a').attr('tabindex', hideMenu);
				//if (!rating[0]) {	//if rating button exists we don't add one
					//items.parent()	//parent list (second level menu: ul.submenu)
						//.append('<li class="rwd-add-menu rating"><a class="button red" href="#" role="menuitem">Oceń stronę</a></li>');	//adding rating button
				//}
				hrefs
					.off()	//have to remove all attached events because of possibility of earlier attach
					.on('click.mcz.toggle-sub', function(e, enter) {	//on mobiles have to use click event (no mouse events)
						
						var li = $(this).closest('li');	//parent LI element
						
						if (!isSub(li)) {	//if parent LI element has 'dropdown' CSS class (submenu exists)
							return;
						}
						e.preventDefault();
						var parent = $(this).closest('ul'),	//submenu (second level)
							rootItem = parent.closest('li'),	//root item
							sub = $(this).parent().siblings('ul');	//submenu (third level)
						
						if (sub[0]) {	//these actions have to be done only if third level menu exists (item has class 'dropdown')
							if (sub.is(':hidden')) {
								sub.removeAttr('style');
							}
							if (!sub.hasClass('back')) {	//if there is no back item have to add one
								var label = self.Cnts['LABEL']['nav'][self.lang]['back'];
								sub
									.prepend('<li class="back"><div class="menu-item-wrapper hidden-920"><a href="#" tabindex="-1" aria-hidden="true">' + label + '</a></div></li>')
									.addClass('back');	//adding class to list with back button
							}
							if (enter) {
								setTimeout(function() {
									
									li.find('li:not(.back) > div > a').eq(0)[0].focus();
								}, 200);	//without timeout focus doesn't work
							}
							sub
								.off()	//have to detach all possibly attached mouse events (>= 1024)
								.children('li.back')
									.off()	//have to remove all attached events because of possibility of earlier attach
									.on('click.mcz.toggle-sub', function(e, esc) {	//set click event for back item
										
										e.preventDefault();
										
										var t = $(this);
										
										parent.removeClass(self.Cnts['CSS']['opened']);	//moving submenu back right
										t.closest('ul').parent('li').siblings().show();	//displaying other second level items
										setItemHeight(parent);	//have to set item height equal to second level menu height
										
										if (!self.ios) {
											setItemHeight(rootItem, null, true, [parent, rootItem]);	//have to set item height equal to second level menu height
										}
										if (esc) {
											setTimeout(function() {
												
												t.closest('ul').parent('li').find(' > div > a')[0].focus();
											}, 200);
										}
									});
							if (!self.ios) {
								setItemHeight(rootItem, sub, true, [parent, rootItem]);	//setting item height equal to third level menu height
							}
							setItemHeight(parent, sub, true);	//setting item height equal to third level menu height
							parent.toggleClass(self.Cnts['CSS']['opened']);	//moving submenu left into view
							$(this).closest('li').siblings().hide();	//hiding other second level items
						}
					});
				items.off();	//have to remove all attached events because of possibility of earlier attach (in desktop view)
				keyEvents(hrefs);
				keyEvents(boxes.find('> li > div > a'));
			}
			setTimeout(function() {	//adding click event to some hrefs to block page refreshing
				
				menu.find('li.' + self.Cnts['CSS']['active'] + ' > div > a')
					.off('click.mcz.refresh')
					.on('click.mcz.refresh', function(e) {
						
						e.preventDefault();
						var address = $(this).attr('href'), li = $(this).closest('li'), level = parseInt(li.attr('data-level'), 10);
						
						if (level === 2 && isSub(li) && event === 'click') {	//if it's submenu item & has submenu & event = click have to block page redicection as click opens third level menu items
							return false;
						}
						if (address !== location.pathname) {	//if href != current location (address) that means we can redirect
							location = address;
						}
						else {
							return false;
						}
					});
			}, 0);
			if (activeMenuItem.length) {
				toggleBtn.find('span').html(activeMenuItem.html());
			}		
			toggleBtn	//button to switch client section
				.removeClass(self.Cnts['CSS']['hidden'])
				.off()
				.on('click.mcz.toggle-main-nav keydown.mcz.toggle-main-nav', function(e, param) {
					
					//de.bug('param: ' + param + ' e.key: ' + e.key);
					e.preventDefault();
					var ret = 0;
					
					if (self.windowWidth <= self.Cnts['SCREEN']['rwd']) {	//<= 920
						var opened = $(this).hasClass(self.Cnts['CSS']['opened']);	//if section menu is opened
						var toggle = false;	//if to change CSS class of this button
						
						if (e.type === 'click') {
							ret = !opened ? 1 : -3;
						}
						if (e.type === 'keydown') {
							ret = 2;
							
							if (param) {
								ret = param;
							}
							switch (e.key) {
								case 'Enter'	: ret = opened ? -3 : 1; break;
								case 'Tab'		: ret = 0; break;
								case 'ArrowDown': ret = -1; break;
								case 'Escape'	: ret = -2; break;
								//case undefined	: items.filter('[data-first]').find('> div > a')[0].focus(); break;
							}
							if (ret > 1) {
								return true;
							}
						}
						//de.bug('key: ' + e.key + ' ret: ' + ret);
						if (ret === 1) {	//opening
							if (topBtn.hasClass(self.Cnts['CSS']['top'])) {
								topBtn.addClass(self.Cnts['CSS']['under']);
							}
							menu.css('display', 'none');
							elems.removeClass(self.Cnts['CSS']['mobile']);
							menu.slideDown(self.animSpeed);
							ret = -1;
							toggle = true;
						}
						if (ret === 0) {	//navigating thru the page elements
							var nextElm = !e.shiftKey ? (ctaLink.length ? ctaLink : logInLink) : navToggle;
							//de.bug(nextElm);
							nextElm[0].focus();
							ret = -3;	//closing possibly opened menu
						}
						if (ret === -1) {
							if (!opened) {
								//de.bug(elems.eq(0).find('a'));
								elems.eq(0).find('a')[0].focus();
							}
						}
						if (ret === -3) {	//closing
							if (opened) {
								toggle = true;
							}
							menu.slideUp(self.animSpeed, function() {
								
								menu.css('display', 'block');
								elems.addClass(self.Cnts['CSS']['mobile']);
								topBtn.removeClass(self.Cnts['CSS']['under']);
							});
						}
						if (toggle) {
							toggleBtn
								.toggleClass(self.Cnts['CSS']['opened'])
								.attr('aria-expanded', !opened);
							return false;
						}
					}
				});
				var sections = elems.children('.menu-item-href');
				sections.off();
				keyEvents(sections);
				
				actions.find('[data-index]')
					.off('keydown.mcz.toggle-actions')
					.on('keydown.mcz.toggle-actions', function(e) {
						
						if (self.windowWidth <= self.Cnts['SCREEN']['rwd']) {//<=920
							if (e.keyCode === 9) {	//TAB was pressed
								e.preventDefault();
								
								var thisIndex = parseInt($(this).attr('data-index'), 10);
								var nextIndex = thisIndex + (e.shiftKey ? -1 : 1);
								
								if (nextIndex < 1) {
									$('#' + actions.attr('data-tabbed-from') + ' > div > a')[0].focus();
								}
								else if (nextIndex > 3) {
									actions.removeAttr('data-tabbed-from');
									navToggle.trigger('click.mcz.show-hidden');
								}
								else {
									actions.find('[data-index="' + nextIndex + '"]')[0].focus();
								}
							}
							if (e.keyCode === 27) {
								navToggle.trigger('click.mcz.show-hidden');
							}
						}
					});
		});
		$(window).trigger('resize.mcz.toggle-sub');	//have to trigger window resize event because everything is done in this event
		
	};
	
	self.navFile = true;	//now navigation always should be treated as new	//$('body').hasClass('nav-file');	//detecting if we have new navigation on current page
	self.chrome = $('html').hasClass('chrome');	//if we're on Chrome
	
	/* function to set root item height when submenu is opened (on mobiles) */
	var setItemHeight = function(item, ul, action, actualize) {	//action - opening/closing = true/false, 'actualize' could be an array of root item (li) and it's child list or undefined
		
		function setMaxHeight(elem) {
			
			return window.innerHeight + $(window).scrollTop() - elem.offset().top;	//return maximum available item height
		}
		
		if (self.navFile) {	//setting height only if we have new navigation on current page
			var height = ul ? 0 : item.attr('data-height'),	//if 'ul' parameter exists then height = 0 if not we use 'data-height' item attribute
				maxHeight = setMaxHeight(item),	//maxHeight - maximum available item height
				origHeight = item.attr('orig-height');	//height of chuld list (submenu)

			if (height) {
				height = parseInt(height, 10);
			}
			else {
				height = action ? ul.outerHeight() : 'auto';	//on opening (action = true) 'height' has to be equal to submenu height
			}
			if (item[0].nodeName === 'LI') {	//only root item (LI) should has maximum screen height
				//if (height > maxHeight) {	//if height exceeds screen then have to reduce it to max. available height
					if (height > maxHeight || (origHeight && origHeight > maxHeight)) {
						height = maxHeight;
					}
				//}
			}
			if (!origHeight) {
				item.attr('orig-height', (ul ? ul.outerHeight() : 0));	//if child list (submenu) exists orig-height atribute has to keep that dimension
			}
			item
				.attr('data-height', item.outerHeight())	//save original item height
				.outerHeight(height)	//set new height
				.css('min-height', 'unset');
			
			if (self.chrome && actualize) {	//if we on Chrome browser (problem with submenu height appears only in this browser) and 'actualize' array exists
				if (action === false) {	//if we're closing the submenu should detach attached resize event
					$(window).off('resize.mpl.height');
				}
				else {	//attach the event to actualize submenu height when address bar hides/appears
					$(window).on('resize.mpl.height', function() {
						
						var maxHeight = setMaxHeight(item), origHeight = item.attr('orig-height');
						
						if ($(actualize[0]).hasClass('opened')) {	//if we in third level menu we should set its height
							origHeight = $(actualize[0]).outerHeight();
						}
						if (origHeight > maxHeight) {
							for (var i = 0; i < actualize.length; i++) {	//'actualize' is an array of root item (li) and it's child list (ul)
								actualize[i].css('min-height', maxHeight);
							}
						}
					});
				}
			}
		}
	};
	
	/* public function to add heights of page top elements */
	this.addHeight = function() {
		
		var t = 58, h = 0;	//navigation bar height
		
		$('#smartbanner:visible, #top-border:visible, #alert-box').each(function() {	//have to add these elements height
			
			h += $(this).outerHeight();
		});
		if (h && $(window).scrollTop() >= h) {	//shoudn't add height when page is scrolled down more than alert bars and smartbanner height
			h = 0;
		}
		return t + h;
	};
	
	self.vwSupport = (function() { // test vw units browser support
		
		var testEl, testVar1, testVar2;
		
		testEl = document.createElement('div');
		document.body.appendChild(testEl);	//have to append new element to DOM
		testEl.style.width = '100vw';
		testVar1 = parseInt((window.getComputedStyle ? getComputedStyle(testEl) : testEl.currentStyle).width, 10);
		testEl.style.width = self.windowWidth;
		testVar2 = parseInt((window.getComputedStyle ? getComputedStyle(testEl) : testEl.currentStyle).width, 10);
		document.body.removeChild(testEl);	//removing tested and unnecessary element
		return testVar1 === testVar2 && !$('html').hasClass('ie');
	})();
	
	/* sets submenu width when viewport units are not supported */
	var resizeSubmenu = function(submenu) {

		var width = 0, navToggle = $('#nav-toggle');

		if (self.windowWidth <= self.Cnts['SCREEN']['rwd']) {	//<= 920
			width = self.windowWidth;
			submenu.css('width', width + 'px');

			if (!navToggle.hasClass(self.Cnts['CSS']['active']))
				submenu.css('left', !navToggle.hasClass(self.Cnts['CSS']['active']) ? -width : 0 + 'px');
		}
		else {
			submenu.removeAttr('style');
		}
	};
	
	/* function to set header items props on showing/hiding submenu in mobile view (< 920) */
	var showHiddenMenu = function() {
		
		var pageHead = $('#page-head'),
			pageContent = $('#page-content'),
			mainNavToggle = $('#main-nav-toggle'),
			nav = pageHead.find('nav'),
			logotype = $('#logotype'),
			skipLink = logotype.prev('.skip-links').find('li:last-child > a'),	//last link in skip-links' list
			navToggle = $('#nav-toggle'),
			mainMenu = pageHead.find('.menu'),	//menu list (ul.menu)
			navLi = mainMenu.children('li'),	//first level items in menu list
			navLiActive = navLi.filter('.' + self.Cnts['CSS']['active']),	//active (current) first level item 
			submenu = navLi.children('.submenu'),	//active submenu list (submenu in active item)
			pmLink = $('#push-message'),	//push-message item
			otherLink = $('#other-option');	//other-option item
		
		function subFocus(focus) {
			
			submenu.find('li:not(.offer-box) > div > a').attr('tabindex', focus ? 0 : -1);
		}
		
		$(window)
			.off('resize.mcz.resize-submenu')
			.on('resize.mcz.resize-submenu', function() {
			
				if (!self.vwSupport) {
					resizeSubmenu(submenu);
					
					if (self.windowWidth <= self.Cnts['SCREEN']['rwd']) {	//<= 920
						submenu.css('left', -self.windowWidth);
					}
				}
				var ariaHidden = true, tabindex = -1, desktop = self.windowWidth > self.Cnts['SCREEN']['rwd'];	//> 920
				
				if (!desktop) {	//actualizing ARIA attributes
					ariaHidden = false;
					tabindex = 0;
				}
				//subFocus(desktop);	//links in second and third level of menu (on mobile there are hidden, on desktop - visible as menubar)
				navToggle.add(mainNavToggle)
					.attr('aria-hidden', ariaHidden)	//setting nav-toggle's WCAG attributes on desktop and mobile
					.attr('tabindex', tabindex);
			});
		$(window).trigger('resize.mcz.resize-submenu');
		
		function navAction() {
			
			logotype.toggleClass(self.Cnts['CSS']['active']);
			navToggle.toggleClass(self.Cnts['CSS']['active']);
			nav.toggleClass(self.Cnts['CSS']['active']);
			
			var navActive = navToggle.hasClass(self.Cnts['CSS']['active']);
			var pmLinkIcon = self.ios ? pmLink.find('span') : null;	//in iOS this icon needs to add/remove special CSS class (count2) for continuous animation
			
			if (navActive) {	//submenu is visible (only if screen resolution is < 920px)
				self.moveToScroll();	//on opening submenu remembering original scroll position
				
				if (!navLiActive.find('span.overlay')[0]) {	//have to add overlay element if there is none
					navLiActive.append($('<span class="overlay" />').css('top', self.addHeight() + 6));
				}
			}
			$('html, body').toggleClass(self.Cnts['CSS']['overflow']);
			navLiActive.toggleClass(self.Cnts['CSS']['shown'])	//hiding second level submenu's items
				.children('ul').removeClass(self.Cnts['CSS']['opened'])	//hiding third level submenu (removing 'opened' CSS class from second level submenu)
					.children('li').show();	//displaying possible hidden earlier items
			
			setItemHeight(navLiActive, navLiActive.children('ul'), navActive, [navLiActive.children('ul'), navLiActive]);	//active root item has to have the same height as submenu or zero if it's not active
			
			if (!navActive) {
				self.moveToScroll();	//on closing moving back to original scroll position
				
				if (self.navFile && self.ios) {	//on ios devices have to remove added styles
					mainMenu.removeAttr('style');
				}
			}
			if (self.windowWidth <= self.Cnts['SCREEN']['rwd'] || !navActive) {	//screen width is smaller than limiting width (mobile view) or menu toggle button (navToggle) is not active (mobile menu has to be closed when switching view on tablets; 'initMainMenu' function)
				if (!self.vwSupport) {
					submenu.css('left', (!navActive ? -self.windowWidth : 0));
				}
				if (!navActive) {	//deactivating items (hiding links)
					//subFocus(false);	//links in second and third level of menu
					navLiActive	//when closing menu have to remove set height and data-height attribute from active root item and its child list
						.removeAttr('data-height')
						.removeAttr('style')
						.children('ul')
							.removeAttr('data-height')
							.removeAttr('style')
								.find('li > div > a').attr('tabindex', -1);
					pmLink.removeClass(self.Cnts['CSS']['active']);
					otherLink.removeClass(self.Cnts['CSS']['active']);
					
					if (self.ios) {	//removing added in iOS special CSS class
						pmLinkIcon.removeClass('count2');
					}
					navToggle
						.attr('aria-pressed', false)
						.attr('aria-expanded', false);	//updating ARIA attributes state
					navToggle[0].focus();	//focusing on element
				}
				else {	//activating items (displaying links) after timeout (submenu slides in)
					timeout = setTimeout(function() {
						
						submenu.find('li > div > a').attr('tabindex', 0);
						pmLink.addClass(self.Cnts['CSS']['active']);
						otherLink.addClass(self.Cnts['CSS']['active']);
						clearTimeout(timeout);
						
						if (self.ios) {	//have to add special CSS class for continuous animation in iOS
							pmLinkIcon.addClass('count2');
						}
						navToggle
							.attr('aria-pressed', true)
							.attr('aria-expanded', true);	//updating ARIA attributes state
						//subFocus(true);	//links in second and third level of menu
						//mainNavToggle[0].focus();
						
						if (submenu.find('> li a').length) {
							submenu.children('li').eq(0).find(' > div > a')[0].focus();
						}
						else {
							otherLink.find('[data-index="1"]')[0].focus();
						}
						return false;
					}, 300);
				}
			}
			pageContent.toggleClass(self.Cnts['CSS']['inbetween']);
			pageHead.toggleClass(self.Cnts['CSS']['over']);
		}
		
		navToggle.on('click.mcz.show-hidden keydown.mcz.show-hidden', function(e) {
			
			e.preventDefault();
			
			if (self.windowWidth <= self.Cnts['SCREEN']['rwd']) {	//if it's mobile view (<= 920)
				var ret = 0, opened = $(this).hasClass(self.Cnts['CSS']['active']) ? true : false;
				
				if (e.type === 'click') {
					ret = opened ? 1 : 2;
				}
				if (e.type === 'keydown') {	//key is pressed
					switch (e.key) {
						case 'Enter'	: ret = opened ? 1 : 2; break;
						case 'Escape'	: ret = opened ? 2 : 0; break;
						case 'Tab'		: ret = 3; break;
						case 'ArrowDown': ret = !opened ? 1 : 0; break;
					}
				}
				if (ret === 0) {	//if other key is pressed than allow to execute it's function
					return true;
				}
				if (ret < 3 || (ret === 3 && opened)) {	//closing & opening
					if (!self.vwSupport) {
						resizeSubmenu(submenu);
					}
					if (mainNavToggle.hasClass(self.Cnts['CSS']['opened'])) {	//root menu is opened
						navLi
						.addClass(self.Cnts['CSS']['mobile'])
						.children('div').addClass(self.Cnts['CSS']['mobile']);	//hiding possibly opened menu first level items
						mainNavToggle.removeClass(self.Cnts['CSS']['opened']);
					}
					navAction();
					return false;
				}
				if (ret === 3) {	//navigating
					var nextElm = !e.shiftKey ? mainNavToggle : skipLink;
					nextElm.trigger('focus');
				}
			}
		});
		
		pageContent.on('click.mcz.show-hidden keydown.mcz.show-hidden', function() {
			
			if (pageContent.hasClass(self.Cnts['CSS']['inbetween'])) {
				navToggle.trigger('click.mcz.show-hidden');	//closing submenu
			}
		});
	};
	
	//function to initialize nice scroll bar in legal note windows
	var initLegalScrolls = function() {
	
		var s = $('.legal-text .row');

		if (s[0]) {
			s.niceScroll(self.scrollBarLegalNote);
		}
	};
	
	//function to toggle WCAG attrbutes in footer headings
	var initFooter = function() {
		
		var cells = $('#footer .column td'),	//footer table cells that contains content that can slide (accordeon)
			headings = cells.find('p.heading');
		
		$(window).on('resize.mcz.footer', function(e, cell) {
			
			if (self.windowWidth < self.Cnts['SCREEN']['tab1']) {//< 768
				headings
					.attr('tabindex', 0)
					.attr('role', 'button')
					.attr('aria-haspopup', true)
					.attr('aria-expanded', false);
			}
			else {
				headings
					.attr('tabindex', -1)
					.attr('role', 'heading')
					.removeAttr('aria-haspopup')
					.removeAttr('aria-expanded');
			}
		});
		$(window).trigger('resize.mcz.footer');
	}
	
	//function to control various elements 
	var showHiddenText = function(event, ui) {
		
		/* controlling footer cells */
		
		//function to expand/wrap given element's content (child node)
		function toggle(elm, sel, cssClass, otherElm) {
		
			if (elm.hasClass(cssClass)) {	//if element's content is displayed have to fold it
				close(elm, elm.children(sel), cssClass);
			}
			else {
				if (otherElm) {	//if to close other elements (possibly opened)
					close(otherElm, otherElm.children(sel), cssClass);	//when element content expands, other elements' content has to be closed
				}
				elm.addClass(cssClass);
				elm.children(sel).slideDown(self.animSpeed);
			}
		}
		
		//function to fold up given element's content
		function close(elm, anim, cssClass) {
			
			elm.each(function() {
				
				$(this).removeClass(cssClass);
				anim.slideUp(self.animSpeed);
			});
		}
		
		var cells = $('#footer .column td');	//footer table cells that contains content that can slide (accordeon)

		cells.on('click.mcz.hidden keydown.mcz.hidden', function(e) {	//adding click event to cells
			
			if (self.windowWidth < self.Cnts['SCREEN']['tab1']) {	//on tablet screen (< 768) content can fold up/down
				if ($(e.target).closest('a').length > 0) {
                    return;
                }
                var cell = $(this), closing = false;
				
				if (e.type === 'click' || (e.type === 'keydown' && e.keyCode === 13/*ENTER*/)) {
					toggle(cell, 'ul', self.Cnts['CSS']['shown'], cells.not(cell));
					
					if (cell.hasClass(self.Cnts['CSS']['shown'])) {	//if list is expanded
						cell.find('p.heading').attr('aria-expanded', true);	//changing ARIA state
						cell.find('ul > li:first-child > a')[0].focus();	//focus on first item in the list
					}
					else {
						closing = true;	//have to close this expanded list
					}
					return false;
				}
				if (closing || (e.type === 'keydown' && e.keyCode === 27/*ESC*/)) {
					toggle(cell, 'ul', self.Cnts['CSS']['shown'], cells.not(cell));
					//updating ARIA state & focusing on heading
					cell.find('p.heading')
						.attr('aria-expanded', false)
						[0].focus();
					return false;
				}
			}
		});
		
		$(window).on('resize.mcz.hidden', function() {	//when screen is wide enough (>= 768) all hidden (folded up) content should be visible
			
			if (self.windowWidth >= self.Cnts['SCREEN']['tab1']) {	//when screen resolution is wide enough (>= 768, i.e. rotating device can has two resulotions) all cells content has to be revealed
				cells.removeClass(self.Cnts['CSS']['shown']).children('ul').removeAttr('style');
				$(window).trigger('resize.mcz.footer', [$(this)]);	//have to set/update ARIA attributes
			}
		});
		
		/* controlling text-block small text */
		
		if (self.windowWidth < self.Cnts['SCREEN']['tab3']) {	//< 569
			$('.text-block-standard .after-text.small-text').each(function() {
				
				if ($(this).text().length > 300) {
					$(this).append('<span class="link-name more">' + self.Cnts['LABEL']['expand'][self.lang]['more'] + '</span>');
					//$('.text-block-standard .after-text.small-text').append('<span class="dots">...</span>');
					$(this).find('.link-name.more').on('click.mcz.hidden', function() {
						
						$(this).parent().addClass(self.Cnts['CSS']['shown']);
						$(this).remove();
					});
				}
				else {
					$('.text-block-standard .after-text.small-text').addClass(self.Cnts['CSS']['shown']);
				}
			});
		}
		
		/* controlling multitile-block (FAQ style) child text */
		
		$('.multitile-block.faq-style .text-box').on('click.mcz.hidden', function() {
			
			toggle($(this), '.text', self.Cnts['CSS']['shown']);
		});
		
		/* controlling legal-notes functionality */
		
		var toggleClasses = function(elm, action) {	//adding/removing CSS classes from various elements + setting window scroll (screen < 641)
		
			if (self.windowWidth < self.Cnts['SCREEN']['tab2'] + 1) {	//< 641
				var attr = 'data-scroll', s;
				
				if (action) {
					self.moveToScroll();	//remembering original scroll position
				}
				if (!elm.closest('.message').length) {	//if this is not message we can remove CSS class from <body>
					$('html, body').toggleClass(self.Cnts['CSS']['overflow'], action);
				}
				$('#page-content, #page-foot').toggleClass('note-999', action);
				$('#top-banner').toggleClass('note-ban-999', action);
				
				if (!action) {
					self.moveToScroll();	//moving back to original scroll position
				}
			}
		};
		
		var closeLegal = function(elm, remove, toggle) {	//have to remove cloned element (legal note)

			elm
				.slideUp(self.animSpeed, function() {
					
					if (elm.closest('#carousel-banner').length) { // if carousel banner
						var selector = elm.hasClass('legal-text') ? 'legal' : 'service-list';
						elm = $('#carousel-banner ul .' + selector + '-label[index=' + elm.attr('index') + ']');
					}
					elm.parent().removeClass(self.Cnts['CSS']['shown']);
					
					if (remove && elm.hasClass('cloned')) {
						elm.remove();
					}
					if (!remove && (typeof toggle === 'undefined' || toggle)) {	//execute this function only when it's original legal-note (multitile-block)
						toggleClasses(elm, false);	//removing classes needed for legal in various page elements
					}
				})
				.removeClass('visible');
		};
		self.closeLegal = closeLegal; // public function

		var activateScroll = function(elm) {

			var ns = elm.find('.nicescroll-rails');
			
			if (ns.height() > 200 && ns.is(':hidden')) {	//some (old?) mobile devices need this action
				ns.show();	//nicescroll element have to be displayed avowedly (on some mobile devices (i.e. iPhone 4S) scroll sometimes is hidden after its initialization)
			}
		};
		self.activateScroll = activateScroll; // public function
		
		var findLegalText = function(elm) {

			if (elm.closest('#carousel-banner').length) { // if carousel banner
				var selector = elm.hasClass('legal-label') ? 'legal' : 'service-list';
				elm = $('#carousel-banner .' + selector + '-text[index=' + elm.attr('index') + ']');
			}
			else {
				elm = elm.siblings('.legal-text, .service-list-text');
			}
			return elm;
		};
		
		var legalNoteActions = function(label, wideScreen) {

			function calcLeftPos() {
				
				return legal.position().left + parRow.position().left - (self.windowWidth > self.Cnts['SCREEN']['mob1'] ? 0 : 20);	//> 480
			}

			var legal = label.parent(), portlet = label.closest('section');

			if (portlet.hasClass('multitile-block')) { //if portlet is multitile-block have to take special action for its legal note
				var parRow = label.closest('.wrapper'), legalText = legal.children('.legal-text');
				
				legal.addClass(self.Cnts['CSS']['shown']);	//adding 'show' CSS class to hovered legal note
				var clonedText = legalText	//have to clone legal-text inside slot and add it outside of the row
					.clone()
					.insertAfter(legalText.closest('.container > .row, .container > .inner'))
					.addClass('cloned')
					.hide()	//have to hide it to toggle display by jQuery
					.slideDown(self.animSpeed, function() {	//sliding down and adding 'visible' CSS class
					
						if (ICApps.scrollBarLegalNote['doc']) {
							delete ICApps.scrollBarLegalNote['doc'];
						}
						$(this).children('.row').niceScroll(ICApps.scrollBarLegalNote);	//have to set scroll once again

						if (!wideScreen) {
							activateScroll($(this));	//some (old?) mobile devices need this action
						}
					})
					.addClass('visible');
				
				var cloned = clonedText, orig = legal.children('.legal-text');
				
				$('.legal-text').not(clonedText).each(function() {	//find all legal-texts beside cloned one
					
					closeLegal($(this), true, false);	//close all other opened legal texts and remove cloned legal notes
					closeLegal(parRow.find('.show .legal-text'), false, false);	//close all other opened original legal texts
				});
				portlet.find('.container > .row, .container > .inner').on('scroll.mcz.hidden', function(e) {
					
					$('.legal-text.cloned').css('left', calcLeftPos());	//actualizing legal text position
				});
				clonedText.find('.close').on('click.mcz.hidden keypress.mcz.hidden', function(e) {
					
					closeLegal(cloned, true);	//close legal text and remove cloned legal note
					closeLegal(orig);	//close original legal text
				});
				portlet.on('keypress.mcz.hidden', function(e) {
					
					closeLegal(cloned, true);	//close legal text and remove cloned legal note
					closeLegal(orig);	//close original legal text
				});
				
				var cssObj = {}, topPos, leftPos, rightPos = 'auto', transform = 'none';

				if (wideScreen) {
					/*portlet.on('touchmove.mcz.hidden', function(e) {
						
						closeLegal(cloned, true);	//close legal text and remove cloned legal note
						closeLegal(orig, false);	//close original legal text
					});*/

					var legalOffset = legal.offset(), portletOffset = portlet.offset(), legalPadding, legalParent = legal.parent(), legalParentOffset = legalParent.offset();

					if ($('body').hasClass('logout'))
						legalPadding = parseInt(legalText.css('padding-left')) + parseInt(legalText.css('padding-right')) + parseInt(legal.find('.row p').css('padding-right'));
					else
						legalPadding = parseInt(legalText.css('padding-left')) + parseInt(legalText.css('padding-right'));

					topPos = ((legalOffset.top - portletOffset.top) + 16);

					if (ICApps.windowWidth >= 1176) {
						leftPos = legalParentOffset.left - (ICApps.windowWidth - portlet.width()) / 2 + legalPadding / (ICApps.device === 'desktop' ? 2 : 4);
					}
					else if (ICApps.windowWidth > self.Cnts['SCREEN']['tab1']) {	//> 768
						var index = portlet.find('.slot').index(legalParent);

						if (index === 0) {
							leftPos = legalParent.css('margin-left');
						}
						if (index === 1) {
							leftPos = ICApps.windowWidth / 2;
							transform = 'translate(-50%, 0)';
						}
						if (index === 2) {
							leftPos = 'auto';
							rightPos = legalParent.css('margin-right');
						}
					}
					else {
						leftPos = ICApps.windowWidth / 2;
						transform = 'translate(-50%, 0)';
					}
				}
				else {
					topPos = 0;
					leftPos = calcLeftPos();
				}
				cssObj = {'top': topPos, 'left': leftPos, 'right': rightPos, 'transform': transform};
				cssObj['visibility'] = 'visible';	//have to add CSS visibility property
				clonedText.css(cssObj); //copy legal text, its position and add it after .wrapper
			}
			else {
				var changeElm = findLegalText(label);	//legal-text
				
				legal.addClass(self.Cnts['CSS']['shown']);	//legal-note
				changeElm
					.css('visibility', 'visible')	//hidden by default so have to make visible
					.hide()	//have to hide it to toggle display by jQuery
					.slideDown(self.animSpeed, function() {
						
						$(this).children('.row').getNiceScroll().resize();	//have to recalculate nice scroll height after animation
					})
					.addClass('visible');
	
				$('.legal-text, .service-list-text').not(changeElm).each(function() {
					
					closeLegal($(this), false, false);	//close all other opened legal texts
				});
			}
		};
		
		$('.legal-label, .service-list-label')
			.on('click.mcz.hidden keypress.mcz.hidden', function(e) {
				
				if (e.type === 'click' || e.keyCode !== 13) {
					if ($(this).parent().hasClass(self.Cnts['CSS']['shown']))
						return;
					if ($(this).closest('#carousel-banner').length)
						ICApps.CAROUSEL_BANNER.stopped = true;
					
					if (typeof gemius_event === 'function') {
						gemius_event('_action_', '', 'legal=view_note');
					}
					// controlling edge-menu
					var edgeMenu = $('.edge-menu');
					
					if (!edgeMenu.hasClass('covered'))
						edgeMenu.addClass('covered');
					
					if (self.windowWidth < self.Cnts['SCREEN']['tab2'] + 1) {	//< 641
						toggleClasses($(this), true);	//adding classes needed for legal in various page elements
						legalNoteActions($(this), false);
					}
					else {
						legalNoteActions($(this), true);
					}
					if ($(this).closest('#carousel-banner').length) {	//in carousel banner have to add focuses on elements for WCAG compatibility
						if (e.keyCode === 9 && !e.shiftKey) {
							var cb = $('#carousel-banner'), lt = cb.find('.legal-text.visible, .service-list-text.visible');
							
							if (lt) {
								e.preventDefault();
								lt.find('.close').focus();
							}
						}
						if (e.keyCode === 9 && e.shiftKey) {
							cb.find('.current a.button').focus();
						}
					}
				}
			})
			.each(function(i) { // legal labels in carousel of banners

				$(this).attr('index', i);	//adding index attribute corresponding to the same attribute in legal-texts
			});

		$('.legal-text .close, .service-list-text .close').on('click.mcz.hidden keypress.mcz.hidden', function(e) {
			
			var slides = $(this).parents().find('#carousel-banner > ul > li');
			var current = $('li.current');
			var index = slides.index(current);
			
			if (e.type === 'click' || e.keyCode === 13) {
				closeLegal($(this).parent());	//close legal text
				
				if ($(this).closest('#carousel-banner').length) {
					ICApps.CAROUSEL_BANNER.animateNavBtn($('circle').eq(index));
					ICApps.CAROUSEL_BANNER.stopped = false;
					ICApps.CAROUSEL_BANNER.countTimeout(1);
					ICApps.CAROUSEL_BANNER.animationLoop(index); 
				}
			}
			if (e.keyCode === 9 && !e.shiftKey) {
				e.preventDefault();
				$(this).parent().find('.row').focus();
			}
		});
		$('.legal-text, .service-list-text').each(function(i) {
			
			$(this).attr('index', i)	//adding index attribute corresponding to the same attribute in legal-labels (only in carousel of banners)
		});
		$('.legal-text .row, .service-list-text .row').on('keypress.mcz.hidden', function(e) {
			
			if (e.keyCode === 9 && e.shiftKey) {
				e.preventDefault();
				$(this).parent().find('.close').focus();
			}
			if (e.keyCode === 9 && !e.shiftKey) {
				closeLegal($(this).parent());	//close legal text

				if ($(this).closest('#carousel-banner').length) {
					$('.nav-btn').eq(0).focus();
				}
			}
		});
	};
	
	this.ifScrolledTop = function() {

		$(window).on('scroll.mcz.banner-content', function() {
			var scrollTop = $(this).scrollTop();
			var c = $('#banner-content div.content');

			if (c.hasClass('be') && c.find('p.usual-button, a.button.big').length) { /*button exist*/
				if (c[0]) {
					var topDistance = $('p.usual-button, a.button.big', c[0]).offset().top, toggle = true;
		
					if ((topDistance - 20) >= scrollTop) {
						toggle = false;
					}
					$('p.button-top', c[0]).toggleClass('at-top', toggle);
					$('p.usual-button', c[0]).css('visibility', toggle ? 'hidden': 'visible');
				}
			}
		});
	};
	
	/* scrolling element into view */
	this.ifScrolledDown = function(event, ui) {

		if (self.windowWidth > 569) {
			var $blocks = $('#main section, #middle-left section, #middle-right section');

			$blocks.each(function(i, elem) {
				isScrolledIntoView($blocks, $(this), false);
			});
			$(window).on('scroll.mcz.scrolled', function(e) {

				$blocks.each(function(i, elem) {

					var viewed = false;

					if ($(this).hasClass('viewed')) {
						viewed = true;
						//return;
					}
					isScrolledIntoView($blocks, $(this), viewed);
				});
			});
		}
	};
	
	this.scrolled = false;
	
	function isScrolledIntoView($blocks, elem, viewed) {
		
		function ifAnimElemAction() {

			var animElemsLeft = $blocks.filter(':not(.viewed)').length;	// original blocks have to be filtered by 'viewed' CSS class

			if (animElemsLeft == 0) {
				// with no animated elements left debind the scroll event
				$(window).off('scroll.mcz.scrolled');

				setTimeout(function() {
					self.scrolled = true;
				}, 500);
			}
		}
		if (!viewed) {	// if this element was animated
			var docViewTop = $(window).scrollTop();
			var docViewBottom = docViewTop + $(window).height();
			var elemOffset = 0;

			if (elem.data('offset') != undefined) {
				elemOffset = elem.data('offset');
			}
			var elemTop = $(elem).offset().top;
			var elemBottom = elemTop - 150;
			
			if (elemOffset != 0) { // custom offset is updated based on scrolling direction
				if (docViewTop - elemTop >= 0) {
					// scrolling up from bottom
					elemTop = $(elem).offset().top + elemOffset;
				}
				else {
					// scrolling down from top
					elemBottom = elemTop + 100 - elemOffset
				}
			}
			if ((elemBottom <= docViewBottom) && (docViewTop > 0 || elemTop >= docViewTop)) {
				// once an element is visible exchange the classes
				$(elem).addClass('viewed');
				// have to check how many elements haven't been animated yet
				ifAnimElemAction();
			}
		}
		else {
			// is there elements to animate
			ifAnimElemAction();
		}
	};
	
	var initUsualTabs = function(event, ui) {
		
		var tabs = $('.usual-tabs');
		
		function insert(html) {
			
			return '<div class="tab-content"><div class="inner-tab">' + html + '</div></div>';
		}
		
		if (tabs[0]) {
			var och = true;	//variable set to true on loading and orientationchange event
			
			if (self.device !== 'desktop') {
				window.onorientationchange = function() { 
					
					och = true;
				};
			}
			$(window).on('resize.mcz.tabs', function() {
				
				var active = false;
				
				tabs.each(function() {	//for all tabs on page
					
					var nav = $('ul.nav-tabs li', $(this));	//tabs navigation buttons
					
					if (nav.hasClass('active')) {
						active = true;
					}
					nav.children('.tab-link')
						.off('keydown.mcz.tabs')
						.on('keydown.mcz.tabs', function(e) {
							
							self.clickTab(e, this);
						});
				});
				if (!active) {
					tabs.find('ul.nav-tabs li').eq(0).addClass('active');	//activating first tab
				}
				ICApps.ALL.updateCalc();	//updating document's height and footer
				var selects = $('.nav-tabs-select option');
				
				selects
					.off('click.mcz.tabs')
					.on('click.mcz.tabs', function() {
						
						var whichOne = selects.index(this);
						$(this).parent().siblings('ul').find('li').eq(whichOne).click();
					});
				
				var timeout = setTimeout(function() {

					var tabs = $('.tabs-elements .faq-tabs li');
					
					if (self.windowWidth < 569) {
						if (och) {	//if orientation has changed
							och = false;	//resetting variable value
							
							tabs.each(function() {	//inserting content into active tab
								
								if($(this).hasClass('active')) {
									$(this).append(insert($(this).parent('ul.nav-tabs').siblings('.tab-content').find('.active').html()));
								}
							});
						}
					}
					else {
						tabs.each(function() {
							
							$(this).find('.tab-content').remove();	//removing content from tab possibly added for mobile view
						});
					}
					tabs.find(' > .tab-link')
						.off('click.mcz.tabs')
						.on('click.mcz.tabs', function() {
							
							var tabs = $(this).parent('li').closest('.tabs-elements');

							if (self.windowWidth < 569) {
								//$('html, body').animate({
								//	scrollTop: $(this).parent().offset().top
								//}, 500);
								setTimeout(function() {
									tabs.find('.faq-tabs li .tab-content').remove();
									tabs.find('.faq-tabs .nav-tabs li.active').append(insert(tabs.find('.faq-tabs .tab-content .active').html()));
								}, 10);
							}
						});
					clearTimeout(timeout);
				}, 500);
			});
			$(window).trigger('resize.mcz.tabs');
		}
	};
	
	this.clickTab = function(e, elm) {

		e.preventDefault();
		
		if (e.type === 'keydown' && e.keyCode !== 13)
			return;
		var link = $(elm),
			tab = link.parent(),
			nav = link.closest('ul.nav-tabs').children('li'),	//tabs navigation buttons
			pane = $('.tab-pane', nav.parent().siblings('div.tab-content')),	//tabs panes for all nav buttons
			whichOne = parseInt(link.attr('data-index'), 10) - 1;	//number of clicked tab
		
		if (self.windowWidth < 569 && tab.hasClass('active')) {
			tab.removeClass('active');
			pane.eq(whichOne).removeClass('active');
		}
		else {
			setTimeout(function() {
                nav.removeClass('active');    //deactivating all nav buttons
                nav.attr('aria-selected', 'false');
                tab.addClass('active');    //activating only clicked nav button
                pane.removeClass('active');//deactivating all tabs panes
                pane.eq(whichOne).addClass('active');//activating pane only for clicked nav button
                tab.attr('aria-selected', 'true');
            }, 10);
		}
		ICApps.ALL.updateCalc();	//updating document's height and footer
	};
	
	var showHiddenList = function() {
		
		$('.headline-title.show-list').on('click.mcz.show-list keypress.mcz.show-list', function(e) {
			
			if (e.type === 'keypress' && e.keyCode !== 13) return; // WCAG keyboard accessibility 072016 @fs
			var addClass = $(this).parent();
			var changesOnList = $(this).parent().children('.list-box');

			if ((addClass).hasClass('on')) {
				$(addClass).removeClass('on');
				$(changesOnList).slideUp();
				$(this).attr('aria-expanded', false);
			}
			else {
				$(addClass).addClass('on');
				$(changesOnList).slideDown();
				$(this).attr('aria-expanded', true);
			}
		});
	};
	
    var addSubmenuDefault = function() {

		//if (!$('body').hasClass('nav-file')) {	//if there's page lifting CSS class (for navigation) in <body> we shouldn't add empty last item in menu
			var menu = $('#head nav ul.menu'), item = menu.children('li.dropdown');	//main navigation menu and item with submenu present

			if (item.hasClass(self.Cnts['CSS']['active'])) {	//if item is active then we look for submenu but only in desktop view (> 920)
				if (self.windowWidth > self.Cnts['SCREEN']['RWD']) {
					item.filter('.' + self.Cnts['CSS']['active']).children('ul.submenu').append('<li role="presentation" id="submenu-item-added" />');	//adding item to submenu
				}
			}
			else {
				if (!menu.children('li.' + self.Cnts['CSS']['active']).length) {	//if no active item in menu have to add submenu
					menu.append('<li role="presentation" id="menu-item-added" class="dropdown ' + self.Cnts['CSS']['active'] + ' ' + self.Cnts['CSS']['shown'] + '"><ul class="submenu" role="none" /></li>');	//adding item with dummy submenu
				}
			}
		//}
    };
	
	//preloader :: v. 1.4.1 r. 07/07/2017 @ pp
	this.preloader = function(show, elm) {
		
		var pid = self.Cnts['PRELOAD']['id'];
		var ifid = pid + 'Iframe';
		var preload = $('.' + pid + '[parent=' + elm + ']');

		if (show && preload[0])
			return;

		var IE = Utils.UA.IE;

		if (!show) {
			preload.fadeOut(self.animSpeed, function() {
				
				if (IE == 6) {
					preload.children('.' + ifid).remove();
				}
				$(this).remove();
			});
			return;
		}
		var c = typeof elm == 'object' ? $(elm) : $('#' + elm), coords = {top: 0, left: 0};
		
		coords = c.offset();
		var cssObj = {
			'top' : coords['top'] + 'px',
			'left' : coords['left'] + 'px',
			'width' : c.outerWidth() + 'px',
			'height' : c.outerHeight() + 'px'
			//'width' : 100 + 'px',
			//'height' : 100 + 'px'
		};
		if (IE == 6) {
			$(c)
				.append($('<iframe />')
					.attr({
						'class': ifid,
						'frameborder': '0',
						'scrolling': 'no'
					})
					.css(cssObj)
					.css('filter', 'alpha(opacity=0)')
			);
		}
		$('body')
			.append($('<div>')
				.attr('class', pid)
				.attr('parent', c.attr('id'))
				.css(cssObj));

		if (IE && IE <= 7)
			preload.css('filter', 'alpha(opacity=60)');
	};
	
	//changes height of the preloader after response (sets new height of parent)
	var setLoaderHeight = function() {
		
		var pid = self.Cnts['PRELOAD']['id'], ifid = pid + 'Iframe', preload = $('.' + pid + '[parent=' + elm + ']'), i;
		
		if (preload[0]) {
			var h = $('#' + preload.attr('parent')).outerHeight();
			var cssObj = {'height' : h};
			preload.css(cssObj);
			
			if ((i = preload.children('.' + ifid))[0]) {
				i.css(cssObj);
			}
		}
	};
	
	//var keeps number of currenty open ajax requests
	this.XmlHttpRequests = 0;
	
	//ajax query with optional preloader :: v. 1.3.3 r. 22/07/2016 @ pp
	this.send = function(args) {
		
		var argsObj = {
			success: function(res) {
				
				if (args.success)
					args.success(res);
				if (args.preload)
					setLoaderHeight();
			},
			beforeSend: function() {
				
				if (!self.XmlHttpRequests)
					if (args.preload)
						self.preloader(true, args.preload);
					else
						self.preloader(false, args.preload);
				++self.XmlHttpRequests;

				if (args.beforeSend)
					args.beforeSend();
			},
			complete: function() {
				
				--self.XmlHttpRequests;
				if (!self.XmlHttpRequests)
					self.preloader(false, args.preload);

				if (args.complete)
					args.complete();
			}
		};

		for (var i in args) {
			if (i == 'beforeSend' || i == 'success' || i == 'complete' || i == 'preload') {
				tmp = null;
			}
			else
				var tmp = args[i];
			
			if (tmp)
				argsObj[i] = tmp;
		}

		$.ajax(argsObj);
	};
	
	/*this.protectMail() {
		var elms = $(CONST['mail']);
		if (elms[0]) {
			
		}
	};*/
	
	//various events
	var initUIEvents = function() {
		
		//initialiaze FB Like button with like box & G+ button & twitter button
		var uri = encodeURIComponent(document.location.href) + '&amp;send=false&amp;layout=button_count&amp;width=120&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21&amp;locale=cs_CZ';
		$('div.fb-like-button-block')
			.html('<iframe src="//www.facebook.com/plugins/like.php?href=' + uri + '" scrolling="no" frameborder="0"\
					style="border: none; width: 122px; height: 21px; overflow: hidden;" allowTransparency="true"></iframe>');

		//google plus button
		/*window.___gcfg = {lang: self.lang};
		var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/plusone.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);*/
	};
	
	//fancy gallery initialization
	var fancyGallery = function() {//checking if fancy elements exists (must have attribute rel="fancyGallery")
		
		if ((gal = $('a[rel^="fancyGallery"]'))[0]) {
			gal.fancybox({
			'transitionIn'		: 'none',
			'transitionOut'		: 'none',
			'titlePosition' 	: 'over',
			'titleFormat'		: function (title, currentArray, currentIndex, currentOpts) {
									
									if (title.length)
										return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
								}
			});
		}
	};
	
	/* swipe utility
	 * detects direction of movement, course of movement to prevent action, movement's amplitude
	 * and fires action
	 * @param {obj} el - DOM element or jQuery object to set event on
	 * @param {obj} config - configuration object. Properties:
	 * 		direction: 'left' | 'right' | 'up' | 'down'
	 * 		prevDirection: 'horizontal' | 'vertical'
	 * 		amplitude: number
	 * @param {function} handler - function to fire on event
	 */
	this.swipe = function(el, config, handler) {

		var direction = config.direction,
			prevDirection = config.prevDirection,
			amplitude = config.amplitude,
			startX,
			startY,
			endX,
			endY,
			tObj,
			dir,
			prevDir,
			distX,
			distY;

		if (el instanceof jQuery || jQuery.prototype.isPrototypeOf(el))
			el = el[0]; // if el is jQuery object, pull out real DOM element

		el.addEventListener('touchstart', function(e) { // touchstart

			tObj = e.touches[0];
			startX = tObj.pageX;
			startY = tObj.pageY;
		}, false);

		el.addEventListener('touchmove', function(e) { // touchmove

			tObj = e.changedTouches[0];
			endX = tObj.pageX;
			endY = tObj.pageY;
			distX = endX - startX;
			distY = endY - startY;

			if (distX < 0 && Math.abs(distX) > Math.abs(distY)) {
				dir = 'left';
				prevDir = 'horizontal';
			} else if (distX > 0 && Math.abs(distX) > Math.abs(distY)) {
				dir = 'right';
				prevDir = 'horizontal';
			} else if (distY < 0 && Math.abs(distX) < Math.abs(distY)) {
				dir ='up';
				prevDir = 'vertical';
			} else if (distY > 0 && Math.abs(distX) < Math.abs(distY)) {
				dir = 'down';
				prevDir = 'vertical';
			}

			if (prevDir === prevDirection) {
				e.preventDefault();
			}
		}, false);

		el.addEventListener('touchend', function(e) { // touchend

			tObj = e.changedTouches[0]; // recalculate distances
			endX = tObj.pageX;
			endY = tObj.pageY;
			distX = endX - startX;
			distY = endY - startY;

			if (dir === direction &&
				((Math.abs(distX) > amplitude && prevDirection == 'horizontal') ||
				(Math.abs(distY) > amplitude && prevDirection == 'vertical')))
						handler();

		}, false);
	}; // end swipe
	
	// function to hide title attribute in cats menu link on hover :: v. 2.1.0 r. 27112015 @ pp
	var hideTitleAttr = function() {
	
		var m;
		
		if ((m = $('.third-level'))[0]) {
			m.find('li > a').on('mouseenter.mcz.hide-title', function() {
			
				if ($(this).attr('title')) {
					$(this).removeAttr('title');
				}
			});
		}
	};
	
	// hide and show appropriate mobile app download buttons depending on platform :: 30122015 @fs
	function hideAppButtons() {
	
		var gBtn = $('#google-play-download-btn'),
			hBtn = $('#app-gallery-download-btn'),
			iBtn = $('#app-store-download-btn'),
			wpBtn = $('#windows-phone-download-btn'),
			wBtn = $('#windows-download-btn'),
			aBtns = $('.all-download-btn'),
			btns = [gBtn, hBtn, iBtn, wpBtn, wBtn],
			os;
		
		var detectApp = function() { // detect platform
			
			var ua = navigator.userAgent.toLowerCase(), sys = 'desktop';
			
			if (ua.indexOf('windows phone') == -1) {
				if (ua.indexOf('android') > -1) {
					sys = 'android';
				}
				if (ua.indexOf('iphone') > -1 || ua.indexOf('ipod') > -1 || ua.indexOf('ipad') > -1) {
					sys = 'ios';
				}
			}
			else {
				sys = 'wp';
			}
			return sys;
		};

		function toggleBtns(btn) { // hide and show buttons
			
			if (btn) { // if button was specified
				btns.forEach(function(el) { // hiding all buttons
					
					el.hide();	// hide button
					el.parent('p').next().hide();	// hide button's description
					el.parents('.inner').hide();	// hide button's container
				});
				btn.forEach(function(el) {
					
					el.show();	// display required button
					el.parent('p').next().show();	// display required button's description
					el.parents('.inner').css('cssText', 'width: 100% !important; display: block; margin-top: 1rem;');	// display and position button's container
				});
			}
			else { // if button was not specified
				btns.forEach(function(el) {	// show all buttons
					
					el.show();
				});
			}
		}
		
		function modifyBtn(os) {
			
			var href, html, title;

			if (os === 'ios') {
				href = 'https://apps.apple.com/cz/app/mbank-cz/id468058234 ';
				html = '<img src="/images/mob-app/app-store-badge_czech.svg" />';
				title = 'Stáhněte si aplikaci pro iOS z App Store';
			} else if (os === 'android') {
				if (navigator.userAgent.toLowerCase().match(/huawei/)) {
					href = 'https://appgallery.huawei.com/#/app/C103155261 ';
					html = '<img style="max-width:135px; max-height:40px" src="/images/mob-app/huawei-ag-badge_czech.png" alt="" />'; 
					title = 'Stáhněte si aplikaci pro telefony Huawei z AppGallery';
				}
				else {
					href = 'https://play.google.com/store/apps/details?id=cz.mbank ';
					html = '<img style="max-width:135px; max-height:40px" src="/images/mob-app/google-play-badge_czech.png" />'; 
					title = 'Stáhněte si aplikaci pro Android z Google Play';
				}
			} else { // desktop
				// __offline__ ? html = 'startweb/cms/aplikacja-mobilna/' : html = '/aplikacja-mobilna/';
				// html = 'Pobierz aplikację';
				// title = 'pobierz aplikację mobilną';
				// aBtn.addClass('button red big');
			}
			if (os !== 'desktop') { // show button, if not desktop
				aBtns
					.attr('href', href)
					.html(html)
					.attr('title', title);
			} else {
				aBtns.each(function() {
					
					var btn = $(this);

					btn.css('display', 'none');

					if (!btn.parents('#main-banner-carousel').length) {
						btn
							.parent()
							.css('display', 'none');
					}
				});
			}
		}
		os = detectApp();
		
		if (gBtn.length || hBtn.length || iBtn.length || wpBtn.length || wBtn.length) {
			if (os === 'wp') {
				toggleBtns([wpBtn]);
			}
			else if (os === 'ios') {
				toggleBtns([iBtn]);
			}
			else if (os === 'android') {
				toggleBtns([gBtn, hBtn]);
			}
			else { // desktop
				toggleBtns(null);
			}
		}
		if (aBtns.length) {
			aBtns.each(function() {
				
				$(this)
					.parent()
					.addClass('button-wrapper');
			});
			modifyBtn(os);
		}
	}
	// end hideAppButtons
	
	function toggleSkipLinks() {
		
		$('ul.skip-links').find('a')
			.on('focusin.mcz.skiplinks focusout.mcz.skiplinks', function() {
				
				$(this).toggleClass('offscreen onscreen');
			})
			.on('click.mcz.skiplinks keydown.mcz.skiplinks', function(e) {
				
				if (e.type === 'click' || (e.type === 'keydown' && e.which === 13)) {
					var t = $(e.target.href.replace(/.+?#/, '#'));
					
					if (t = t.children('a:visible')[0]) {
						setTimeout(function() {
							
								t.focus();
						}, 100);
						
						return false;
					}
				}
			});
	}
	
	//function to delay href action to be able to run onclick action on current page before href action runs (ie. gemius_event stats)
	this.actionOnClick = function(e, fn) {
		
		e.preventDefault();
		var elm = e.target;
		var h = elm.href;
		
		try {
			fn();
		}
		catch(e) {}
		
		if (h && h.slice(-1) != '#') {
			setTimeout(function() {
				
				if (elm.target == '_blank') {
					window.open(h);
				}
				else {
					window.location = h;
				}
			}, 50);
		}
	};
	
	function fancyOpen() {
		
		$('#page-content a:not([rel^="fancyGallery"], .expert, #you-tube)').on('click.mcz.fancy', function() {
			
			var h = this.href;
		
			if (h.indexOf('youtube.') > -1) {
				if (typeof YT === 'undefined') {
					var s = document.getElementsByTagName('script')[0];
					var yt = document.createElement('script');
					yt.src = "https://www.youtube.com/iframe_api";
					s.parentNode.insertBefore(yt, s);
				}
				$.fancybox({
					'centerOnScroll'	: true,
					'showCloseButton'	: true,
					'padding'		: 0,
					'autoScale'		: false,
					'transitionIn'	: 'none',
					'transitionOut'	: 'none',
					'title'			: this.title,
					'href'			: h.replace(new RegExp("watch\\?v=", "i"), 'v/') + '&autoplay=1',
					'type'			: 'swf',
					'helpers' : {
						'media' : {},
						'overlay': {
							lock: false
						}
					},
					'swf'			: {
						'wmode'				: 'transparent',
						'allowfullscreen'	: 'true'
					},
					'beforeShow': function() {

						var id = $.fancybox.inner.find('iframe').attr('id'),
							player = new YT.Player(id, { // create new youtube player to get access to API
								events: {
									onStateChange: onPlayerStateChange
								}
							});

						function onPlayerStateChange(e) {

							if (e.data === 0) {
								$.fancybox.inner.css('display', 'none'); // to avoid blinks on close
								$.fancybox.close();
							}
						}
					}
				});
				return false;
			}
			if ((this.href.indexOf('.jpg') > -1) || (this.href.indexOf('.png') > -1)) {
				$.fancybox({
					'centerOnScroll'	: true,
					'showCloseButton'	: true,
					'padding'		: 0,
					'max-width'		: '100%',
					'max-height'	: '100%',
					'transitionIn'	: 'none',
					'transitionOut'	: 'none',
					'title'			: this.title,
					'type'			: 'image',
					'href'			: h,
					'helpers' : {
						'media' : {}
					}
				});
				return false;
			}
			if ((this.href.indexOf('fancy.html.i') > -1)) {
				$.fancybox({
					'title'			: this.title,
					'href'			: h,
					'helpers' : {
						'media' : {}
					}
				});
				return false;
			}
		});
	};
	
	function changeAttr() {
		
		var aData = $('a[data-onclick]');
		aData.each(function() {
			var t = $(this),
				addOnClick = t.attr('data-onclick');
			t
				.attr('onclick', addOnClick)
				.removeAttr('data-onclick');
		});
	}
	
	function anchorLinks() {
	
		var links = $('#page-content a:not(.offscreen, .expert, .poznamka, .tab-link, .no-anchor)').filter(function() {
			
			var h = this.href;

			if (h && h.indexOf('#') > 0) {
				return true;
			}
		});
		if (links.length > 0) {
			var anchors = $('#page-wrapper a[id]:empty').not(function() {return this.href ? true : false;});	//select all anchors in page-content
	
			links.on('click.mcz.hash', function(e) {
				
				e.preventDefault();
				
				var flag = false;
				
				if (anchors.length) {
					var hash = this.href.substring(this.href.indexOf('#') + 1);
	
					anchors.each(function() {
						var id = this.id;
	
						if (id.substring(id.indexOf('#')) == hash) {
							//at first scroll sections enters the screen (300px), so we must deduct this distance (but only if screen width is above 569px)
							var offset = $(this).offset().top - (!self.offline && self.windowWidth > 569 ? ($(this).closest('section.viewed').size() ? 0 : 380) : 0);
							ICApps.ALL.animateScroll(null, 0, offset);
							flag = true;
	
							if (history.pushState) {
								history.pushState({page: (new Date()).getTime()}, '', location.pathname + '#' + hash);
							}
							return false;
						}
					});
				}
				if (!flag) {
					var h = this.href;

					if (h && h.slice(-1) != '#') {
						location = h;
					}
				}
			});
		}
		$('#page-content a.reload').on('click.mcz.reload', function() {
			
			location.reload();
		});
	}
	
	//function to initialize smartbanner on mobile devices
	function initSmartBanner() {

		var m = self.device === 'mobile' ? true : false;
		var c = Utils.readCookie('sb-closed');	//if smartbanner has been closed by the user this cookie should be present
		var cl = Utils.readCookie(self.Cnts['COOKIE']['login']);	//if user is a client
		var uri = '/.config/smartbanner-' + (cl ? '': 'non-') + 'client.txt';
		
		if (m && $('body').hasClass('smartbanner')) {
			
			$.ajax({
				url		: uri,
				cache	: false,
				success : function(res) {
				
					var s = res;
					s = s.replace(/([\n\t]*)/mg, '').replace(/\/\*.*\*\//g, '').replace(/'/g, "\"");
                    var smartSystem = !self.ios ? 'android_' : 'ios_';
                    var smartUser = cl ? '_klient' : '';
                    var gaValueInstall = 'smartbanner_' + smartSystem + 'download_' + __sben__ + smartUser;
                    var gaValueClose = 'smartbanner_' + smartSystem + 'close_' + __sben__ + smartUser;
					
					if (s) {
						var obj = JSON.parse(s), clickActionParams = obj['clickActionParams'].replace(/ /g, '').split(','), exitActionParams = obj['exitActionParams'].replace(/ /g, '').split(','), loc = location.toString();
						
						//console.log(s)
						//console.log(obj);
						
						$('head').prepend('<meta name="apple-itunes-app" content="app-id=468058234"><meta name="google-play-app" content="app-id=cz.mbank">');	//adding mobile app meta-tags for smartbanner install link
						
						if (obj['clickActionParams']) {
							clickActionParams.push(gaValueInstall);	//adding current page parameter on installing smartbanner (eventLabel)
							
							obj['onInstall'] = function(e) {	//if there are clickActionParams we have to have to add install function with GA

								ga('send', {
									'hitType': clickActionParams[1],
									'eventCategory': clickActionParams[2],
									'eventAction': clickActionParams[3],
									'eventLabel': clickActionParams[4]
								});
								
								dataLayer.push({
									'eventCategory': clickActionParams[2], 
									'eventAction': clickActionParams[3],
									'eventLabel': clickActionParams[4],
									'event': 'gaEvent'
								});
							};
						}
						obj['onClose'] = function(e) {
							
							self.smartbanner = false;	//banner is closed
						}
						if (obj['exitActionParams']) {
							exitActionParams.push(gaValueClose);	//adding current page parameter on closing smartbanner (eventLabel)
							
							obj['onClose'] = function(e) {	//if there are exitActionParams we have to have to add close function with GA
								
								ga('send', {
									'hitType': exitActionParams[1],
									'eventCategory': exitActionParams[2],
									'eventAction': exitActionParams[3],
									'eventLabel': exitActionParams[4]
								});
								
								dataLayer.push({
									'eventCategory': exitActionParams[2], 
									'eventAction': exitActionParams[3],
									'eventLabel': exitActionParams[4],
									'event': 'gaEvent'
								});
								
								self.smartbanner = false;	//banner is closed
							}
						}
						$.smartbanner(obj);
						self.smartbanner = c ? false : true;	//if there is cookie present then smartbanner is closed otherwise its visible
						
						$(window).trigger('resize.mcz.all.screen'); //event in all.js to actualize ICApps.smartbanner and header position
					}
				}
			});
		}
	}
	
	//function to initialize step slider :: 05/04/16 @ md
	function initStepSlider() {
		
		lock = false;
		
		$('.step-slider li > span').on('click.mcz.stepslider', function() {
			
			if (!lock || !$(this).parent().hasClass('active')) {
				lock = true;
				var parent = $(this).parents('.container');
				var old = parent.find('.tab-pane.active');
				var idx = $(this).parent().find('.step').attr('data-idx');

				$(this).parent().addClass('active').siblings().removeClass('active');
				old.addClass('old');
				parent.find('.tab-v2 > .img-wrapper').eq(idx - 1).addClass('active').siblings().removeClass('active');
				parent.find('.tab-pane').eq(idx - 1).addClass('active').siblings().removeClass('active');
				$('.steps > .step').removeClass('active').eq(idx - 1).addClass('active');

				old.animate({left: '0', right: 'unset', width: '0'}, {duration: 1000, complete: function() {
					
					old.css({left: '', right: '', width: ''});
					old.removeClass('old');
					lock = false;
				}});
			}
		});
		
		$('.step-slider .steps > .step').on('click.mcz.stepslidersteps', function() {
			
			var idx = $(this).attr('data-idx');
			$(this).parents('.container').find('.nav-tabs li').eq(idx - 1).find('span:eq(0)').click();
		});
	}
	
	//function to initialize switch compare :: 14/04/16 @ md
	function initSwitchCompare() {
		
		lock = false;
		
		$('.switch-compare .switch').on('click.mcz.switchcompare', function() {
			
			if (!lock) {
				lock = true;
				$(this).toggleClass('pos-right');
				$(this).parents('.switch-compare').find('.column').toggleClass('active');
				$(this).parents('.switch-compare').find('.middle img').toggleClass('active');
				$(this).parents('.switch-compare').find('.switch .title').toggleClass('active');
				$(this).parents('.switch-compare').find('.switch span').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
					
					lock = false;
				});
			}
		});
	}
	
	function initTabsHash() {

		var tabs = $('ul.nav-tabs');
		
		if (tabs[0]) {
			tabs.find('.tab-link').on('click.mcz.tabs', function(e) {
				
				e.preventDefault();	
				var dhash = $(this).attr('data-hash');
				
				if (dhash) {
					location.hash = dhash;
					if (!$(this).parent().hasClass('active')) {
						$(this).trigger('keydown.mcz.tabs');
					}
				}
			});
			var hash = location.hash.substr(1);
			
			if (hash.length > 0) {
				var tabLink = $('.tab-link[data-hash="' + decodeURIComponent(hash) + '"]');
				
				if (tabLink[0]) {
					self.removeTabActivity = false;

					if (!tabLink.parent().hasClass('active')) {
						tabLink.trigger('click.mcz.tabs');
					}
					
					$('#page-content').imagesLoaded(function() {
						
						var offset = tabLink.closest('section').offset().top - (!self.offline && self.windowWidth > 569 ? (tabLink.closest('section.viewed').size() ? 0 : 380) : 0);
						var callback = null;
						
						if (self.windowWidth < 569) {
							callback = function() {
								
								if (!tabLink.parent().hasClass('active')) {
									tabLink.trigger('click.mcz.tabs');
								}
							};
						}
						ICApps.ALL.animateScroll(null, 0, offset, null, callback);
					});
				}
			}
			else {
				hash = tabs.find('li.active > .tab-link').attr('data-hash');
				
				if (hash) {
					location.hash = hash;
					//tabs.find('li.active > .tab-link').trigger('click.mcz.tabs');
				}
			}
		}
	}
	
	/* -- set color theme for android browser --*/
	var addThemeColor = function(event, ui) {
		
		function addMetaColor(color) {
		
			return '<!-- Chrome, Firefox OS and Opera --><meta name="theme-color" content="' + color + '"><!-- Windows Phone --><meta name="msapplication-navbutton-color" content="' + color + '"><!-- iOS Safari --><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">';
		}
		if (self.windowWidth < 768) {
			var meta;
			
			if ($('body').hasClass('ind')) {
				meta = addMetaColor('#e31818');
				$('head')
					.prepend(meta)
					.append(meta);
			}
			else if ($('body').hasClass('biz')) {
				meta = addMetaColor('#7aad1f');
				$('head').prepend(meta);
			}
		}
	};
	
	//portlets' validation by dates (from, to - set in portlet)
	var validate = function() {

		if ((s = $('section[date-from][date-to]'))[0]) {
			s.each(function() {
				
				var dateFrom = new Date($(this).attr('date-from')),
					dateTo = new Date($(this).attr('date-to')),
					today = new Date(__currDate__);
					
				if (dateFrom > today || dateTo < today) {
					if (offline) {
						s.prepend('<div style="position: absolute; top: 0; left: 0; z-index: 10000; width: 100%; background: rgba(0, 0, 0, 0.5); color: #fff; text-align: center;">This portlet is not valid, so it is hidden on www!</div>');
					}
					else {
						$(this).hide();
					}
				}
			});
		}
	};
	
	//function to load app specyfic styles (i.e. questionnaire)
	this.loadStyles = function(filename, folder) {

		if (!filename)
			return
		var css = filename.replace('.', '-');
		
		if ($('link#' + css)[0]) {
			return
		}
		else {
			$('head').append('<link id="' + css + '" rel="stylesheet" type="text/css" />');
		}
		filename = '/.templates/css/' + (folder !== undefined ? folder + (folder !== '' ? '/' : '') : 'app/') + filename;
		
		function stylesheet(filename, data) {
		
			$('#' + css).attr('href', filename + (!data ? '' : '?' + data));
		}
		if (!self.offline) {	//if we're online then need to load hash file first
			$.ajax({
				url: '/.hash/' + filename,
				cache: false,
				success: function(data) {
					
					stylesheet(filename, data);	//add stylesheet with hash
				},
				error: function(a, b, c) {
					
					debug.log(a + '\n' + b + '\n' + c);
					$('#' + css).remove();	//have to remove earlier added link
				}
			});
		}
		else {
			stylesheet(filename);
		}
	};
	
	function noSubmenu () {
		
		if (($('nav li.active ul.submenu li[id^=submenu-item-]').length == 0) && (!$('body').hasClass('community'))) {
			$('div.proper-head').addClass('no-submenu');
		}
	}
	
	var submenuResize = function () {
		
		var width = self.windowWidth;
		//console.log(width + 'w');
		var height = $(window).height();
		//console.log(height + 'h');
		var submenu = $('#page-head nav ul li.active ul.submenu');
		var liHeight = $('ul.submenu li').height();
		var numberOfLi = $('nav li.active ul.submenu li[id^=submenu-item-]').length;
		var submenuHeightAfterCalculate = liHeight * numberOfLi;
		
		if (submenuHeightAfterCalculate > (height - 50)) {
			submenu.css('height', height - 100 + 'px');
			//console.log(height - 100 + 'px');
		} else {
			submenu.css('height', 'auto');
		}
	};
	
	var onSubmenuResize = function () {
		
		$(window).on('resize.mcz.width', function () {
			
			submenuResize();
		});
	};
	
	function resizeAreaPromoBar () {
		
		var info = $('.infobox-grid .slot.promoted-bar');
		var topB = $('#top-banner .promoted-bar');
		
		if (self.windowWidth < self.Cnts['SCREEN']['tab1']) {	//< 768
			info.each(function () {
				
				var bar = $(this),
					divPromoBar = bar.find('.item'),
					promoBar = divPromoBar.find('span p'),
					lenghtBar = promoBar.height();

				if (lenghtBar > 40) { //max height text in colorbar (one line in mobile)
					divPromoBar.addClass('long-promoted-bar');
				} else {
					divPromoBar.removeClass('long-promoted-bar');
				}
			});
			
			var bar2 = topB,
				promoBar = bar2.find('.color-bar'),
				thisHeight = promoBar.innerHeight();
			
			if (bar2.hasClass('without-tr-text')) {
				bar2.css("margin-bottom", thisHeight);
			}
		}
	}
	
	function resizeAreaPromoBarActivate () {
		
		if ($('#top-banner .promoted-bar').length > 0) {
			resizeAreaPromoBar();
			
			$(window).on('resize.mcz.promo-bar', function () {
				
				resizeAreaPromoBar();
			});
		}
	}
	
	//function to mark clicks (i.e. in th dropdown menu or searchengine)
	this.setStorage = function(key, val) {
		
		if (typeof val !== 'undefined') {
			sessionStorage.setItem(key, val);
			
			setTimeout(function() {
				
				sessionStorage.removeItem(key);
			}, 100);
		}
		else {
			return sessionStorage.getItem(key);
		}
	};
	
	//attaching events to document to track when searchbox or dropdown is opened and close it
	var addDocClicks = function() {
		
		$(document)
			.off('click.mcz.all keydown.mcz.all')
			.on('click.mcz.all keydown.mcz.all' , function(e) {
				
				if (e.type === 'click' || (e.type === 'keydown' && (e.which === 9/*tab*/ || e.which === 27/*esc*/))) {
					var n = self.setStorage('nav'), s = self.setStorage('search'), elm;
					//de.bug('nav: ' + n + ' search: ' + s);
					if (n || (!n && !s)) {	//user clicks in dropdown menu or elsewhere (but not in searchengine icon)
						if ((elm = $('#search-form')).hasClass('active')) {	//search form is visible and have to close it
							elm.find('button.close').trigger('click.mcz.search.hide');	//closing searchengine form
						}
					}
					if (s || (!n && !s)) {	//user clicks in searchengine icon or elsewhere (but not in dropdown menu)
						if ((elm = $('ul.menu > li > ul.submenu > li.dropdown')).hasClass('opened')) {	//dropdown is opened and have to close it
							self.closeSub(elm);	//closing dropdown menu
						}
					}
				}
				//de.bug(e.type);
				//adding/actualizing 'data-input' attribute in <html> tag which holds information abuot used interface (mouse/keyboard)
				$('html').attr('data-input', (e.type === 'click' ? 'mouse' : 'key'));
				$('#page-wrapper').on('mousemove.mcz.all', function() {
					//de.bug('mousemove');
					$('html').attr('data-input', 'mouse');
				});
				return;
			});
	};
	
	this.initPromoBar = function(boxes) {	//the function is still in use due to margins in rows, where promo bars appear
		
		var colorBars = boxes.find('div[class^=color-bar]'),
			randomNumber = Math.round(Math.random() * (colorBars.length - 1)), // number of randomly shown promo bar
			rows = [[]], // array of rows to show margins in all elements in a row with promo bar
			rowIndex = 0;

		function calculateRows() {
			
			boxes.each(function() { // put each box in an appropiate row

				var box = $(this);

				if (!rows[rowIndex][0]) { // if no boxes in a row, put current box in a row
					 rows[rowIndex].push(box);
				} else {

					if (box.offset().top !== rows[rowIndex][rows[rowIndex].length - 1].offset().top) { // if current box offset diferent form last in a row, create next row
						rowIndex++;
						rows.push([]);
					}
					rows[rowIndex].push(box);
				}
			});

			rows.forEach(function(row) {
				
				var index = rows.indexOf(row),
					promotedRow = row.filter(function(el) { // find if current row has a promo bar
						
						return el.find('div[class^=color-bar]').length;	//&& el.find('div[class^=color-bar]')[0] === colorBars.eq(randomNumber)[0];	- commented out due to dropping idea of randomly shown promo-bar
					});

				if (promotedRow[0]) {
					rows[index].forEach(function(el) {
						
						el.parent().addClass('promoted-bar'); // add margins to all slots in a row with promo bar
					});
				}
				else {
					rows[index].forEach(function(el) {
						
						el.parent().removeClass('promoted-bar'); // add margins to all slots in a row with promo bar
					});
				}
			});
		}
		colorBars.eq(randomNumber).removeClass('hidden');
		calculateRows();
		
		$(window).on('resize.mcz.infobox-promo', function() {

			var timeout = setTimeout(function() {
				
				calculateRows();
				clearTimeout(timeout);
			}, 500);
		});
	};
	
	function initTextBlockImage() {
		
		var textBlocks = $('.text-block-image'),
			blockAlign = 'img-left',
			firstTextBlockAlign,
			index = 0;
		
		if (textBlocks.length) {
		
			firstTextBlockAlign = textBlocks.eq(0).attr('data-img');
			textBlocks.each(function(i, el) {
				
				if ($(el).attr('data-break-pattern') == 'true') {
					firstTextBlockAlign = $(el).attr('data-img');
					index = 0;
				}
				
				if (index % 2 == 0) {
					
					if (firstTextBlockAlign == 'img-left') {
						$(el).addClass('img-left');
					}
					else {
						$(el).addClass('img-right');
					}
				}
				else {
					
					if (firstTextBlockAlign == 'img-left') {
						$(el).addClass('img-right');
					}
					else {
						$(el).addClass('img-left');
					}
				}
				
				index++;
			});
		}
	}
	
	/* change title on inactive window tab */
	var initTitleChange = function() {

		var origTitle = $('title').text(), altTitle, pm = 0;    //if push-message is on the page
	
		if (!origTitle) {
			return;
		}
		var changeTitle = function() {
	
			$(window)
				.on('focus.mcz.title', function() {
	
					if (origTitle) {
						document.title = origTitle;
					}
				}).on('blur.mcz.title', function() {
	
					var title = $('title').text();
	
					if (title != altTitle) {
						origTitle = title;
					}
					if (pm) {
						pm = self.PM.numberOfMessages;    //pm = true only if there are some unread messages
					}
					document.title = (pm ? '(' + pm + ') ' : '') + altTitle;
				});
		};
		if (typeof self.PM == 'object') {    //if PM script was downloaded so push-message is on this web page (pm = true)
			pm = 1;
		}
		$.ajax({
			url: '/.elements/alternative-title.html.i',
			dataType: 'text',
			async: true,
			success: function(msg) {
	
				if (msg) {
					altTitle = msg;
					changeTitle();
				}
			}
		});
	};
	
	function initPopupOnClick() {

		var btns = $('.popup-on-click');
		var indexes = [];
		var popups = [];
		var overlay;
		var body = $('body');

		body.append('<div id="overlay" class="hidden"></div>');
		overlay = $('#overlay');

		btns.each(function() {

			var btn = $(this);
			var index = parseInt(btn.attr('class').split('-')[btn.attr('class').split('-').length - 1]);
			var popup;

			if (!indexes.includes(index)) { //popup was not used on current site
				indexes.push(index);
				$.ajax({
					url: '/.elements/click-popup/click-popup' + index + '.html',
					success	: function(res) {

						var html = '\
							<div class="message-box click-popup popup-' + index + '" style="display: none; position: fixed;">\
								<div class="bg">&nbsp;</div>\
								<a class="popup close" href="#">&nbsp;</a>\
								<div class="inner-message">\
									' + res + '\
								</div>\
							</div>';

						body.append(html);

						popup = $('.click-popup.popup-' + index);

						var closeBtn = popup.find('.close');

						popups.push(popup);
						
						closeBtn.on('click.mcz.close', function() {

							overlay.addClass('hidden');
							popup.css('display', 'none');
							$('body, html').css('overflow', 'auto');
						});
					}
				});
			}
			else {
				var interval = setInterval(function() {
					
					popup = $('.click-popup.popup-' + index);
					
					if (popup && popup.length) {
						clearInterval(interval);
					}
				}, 100);
			}

			btn.on('click.mcz.popup', function() {

				var scrollBarPopup = { 
					horizrailenabled: false, 
					background: '#f0f0f0',
					cursorcolor: '#d0d0d0',
					cursorwidth: '3px', 
					cursorborder: 'none',
					cursorborderradius: '0', 
					railalign: 'right', 
					autohidemode: false
				}; 

				overlay.removeClass('hidden');
				popup.css('display', 'block');
				popup.find('.inner-message').niceScroll(scrollBarPopup);
				$('body, html').css('overflow', 'hidden');
			});
		});

		overlay.on('click', function() {
			
			popups.filter(function(popup) {
				
				return popup.css('display') == 'block';
			})[0]
			.css('display', 'none');
			overlay.addClass('hidden');
			$('body, html').css('overflow', 'auto');
		});
	}
	
	var eraseCookies = function() {
		
		if (!Utils.readCookie(self.Cnts['COOKIE']['consent'])) {
			Utils.verifyConsent();	//if there's no consent cookie means have to varify mBiscuit consents
			
			var cookies = document.cookie.split(';');
			var mConsent = window['__marketing_Consent__'];
			var aConsent = window['__analytics_Consent__'];
			
			if (!aConsent || !mConsent) {
				var mbc = [
					[self.Cnts['COOKIE']['info'], (mConsent && aConsent)],
					[self.Cnts['COOKIE']['referrer'], (mConsent && aConsent)],
					[self.Cnts['COOKIE']['login'], (mConsent && aConsent)],
					[self.Cnts['COOKIE']['loginType'], (mConsent && aConsent)],
					['sfi_fav', mConsent],
					['__mcz-pmd', (mConsent && aConsent)],
					['__mcz-npd', (mConsent && aConsent)],
					['__mcz-stats-', (mConsent && aConsent)],
					//cookies to remove
					['__mcz-view', false],
					['abuseData', false],
					['__mpl-abx', false],
					['nc_fav', false],
					['nc_comp', false],
					['ufk_fav', false],
					['ufk_comp', false]
				];
				for (var i = 0; i < cookies.length; i++) {
					for (var j = 0; j < mbc.length; j++) {
						var cookie = cookies[i].trim();
						
						if (!mbc[j][1]) {
							if (cookie.indexOf(mbc[j][0]) === 0) {
								Utils.saveCookie(cookie.split('=')[0], '', -1);	//removing possibly existing cookie
							}
						}
					}
				}
			}
		}
		Utils.saveCookie(self.Cnts['COOKIE']['consent'], true, 365);
	}
	
	/* function executed when user clicks on mBiscuit consents change link in footer */
	this.consentChanged = function(e) {
		
		e.preventDefault();
		e.stopPropagation();
		Utils.saveCookie(self.Cnts['COOKIE']['consent'], '', -1);	//removing tehnical cookie set by 'eraseCookies' function
		mbiscuit.open();	//popup to change user consents
	};
	
	function init() {

		if (inited)
			return;

		inited = true;
		validate();
		addThemeColor();
		initCookieInfo();
		initAlertInfo();
		checkRedirection();
		initSmartBanner();
		initMainMenu();
		addSubmenuDefault();
		showHiddenMenu();
		rwdAddMenu();
		self.initExpandables();
		self.initSelects();
		self.initTooltip(null, {scrollProps: self.scrollBarLegalNote});
		//self.initInputs('#nlFooterForm');
		initMultiTabs();
		self.initDatePicker();
		fancyGallery();
		initUIEvents();
		initLegalScrolls();
		showHiddenText();
		showHiddenList();
		self.ifScrolledTop();
		//self.ifScrolledDown();
		initUsualTabs();
		//initFilters();
		//posFAQ();
		hideTitleAttr();
		//self.datepickerKeyboard();
		hideAppButtons();
		toggleSkipLinks();
		changeAttr();
		initStepSlider();
		initSwitchCompare();
		anchorLinks();
		fancyOpen();
		initTabsHash();
		noSubmenu();
		submenuResize();
		onSubmenuResize();
		resizeAreaPromoBarActivate();
		self.initPromoBar($('#page-wrapper .infobox-grid .item'));
		initTextBlockImage();
		initPopupOnClick();
		initTitleChange();
		eraseCookies();
		addDocClicks();
		initFooter();
	}
	
	$(function() {
		
		if (self.autoInit)
			init();
	});
};