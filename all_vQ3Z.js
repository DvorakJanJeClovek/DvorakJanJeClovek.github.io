/*!
 * mBank, all.js (hp.js) :: 17/07/2015 @ pp
 * Copyright (C) Quercus, http://qrqs.eu
 * ICApps.ALL :: subobject to control UI on site (dependent from its parent object ICApps; uses jQuery)
 */
/*
 * v. 1.9.5 @ pp (25/09/23): zmieniony selektor strony (body)
 * v. 1.9.6 @ pp (08/04/25): zakomentowana zdarzenie 'keydown' dla 'skip-links' (SKCZDEV-778)
 */
if (typeof ICApps == 'undefined')
	ICApps = {fake:true};

ICApps.ALL = new function() {

	if (ICApps.fake) {
		var mes = '\'all.js\' - brak skryptu \'scripts.js\'!';
		return typeof console == 'object' ? console.log(mes) : '';
	}
	var self = this,
		parent = ICApps,
		version = 'v. 1.9.6 CZ (1.8.0 PL) :: r. 08/04/25 @ pp',
		debug = parent.Debugger,
		// body = ICApps.device == 'mobile' || Utils.UA.browser === 'Chrome' || Utils.UA.browser === 'Safari' || (Utils.UA.browser === 'Opera' && Utils.UA.version >= 15) ? 'body' : 'html',	//scroll element (html or body) detection
		body = 'html, body',	//jQuery animation selector
		win = window,
		screens = [],	//sec.get(),
		screen = {	//current screen (visible) set by 'getCurrentScreen' function
			elm		: {},	//DIV container of the section
			no		: 0,	//current (visible) screen (section element)
			top		: 0,	//screens's top position
			bottom	: 0,	//screens's top position + height
			height	: 0,	//calculated height of the screen (relative to tiles height on the screen)
			inited	: false	//if HTML content is inserted into screen
		},
		docHeight = 0,	//html document height (#page-wrapper) (set after initialization in calcScrollHeight)
		scrollHeight = 0,	//height of the scroll in which widget-bar should be visible (set after initialization in calcScrollHeight)
		wheel = false,	//mouse wheel activation indicator
		wheelPos = -1;	//how many pixels the page is scrolled down (initially); how much scroll with mouse wheel event

	this.inited = false;	//indicates that object has been inited

	this.getVersion = function() {
		return version;
	};

	this.autoInit = true;	//automatical initialization on DOMContentLoaded

	this.CNTS = {
		HP		: false,	//if BODY has 'hp' css class (set on initialization)
		FIXED	: false,	//if BODY has 'fixed' css class (footer is fixed) (set on initialization)
		SCROLL	: {
			top		: 0,
			max		: 0,
			dir		: 1	//direction of scrolling (1 - down, -1 - up)
		},
		SCREENS	: {
			height	: 0
		},
		PAGE	: {	//document (web page) html elements (set on initialization)
			wrapper		: null,	//page-wrapper
			content		: null,	//page-content
			head		: null,	//page-head (header element)
			foot		: null,	//page-foot (footer element)
			widgetBar	: null,	//widget-bar
			cookie		: null	//cookies information bar
		},
		CLASS	: {
			widgetBar	: 'fixed'	//widget-bar css class added when absolutely positioned
		}
	};

	this.isDesktop = false;	//if used device is desktop (set in 'setDevice' function)
	this.isTablet = false;	//if used device is tablet (set in 'setDevice' function)
	this.isMobile = false;	//if used device is mobile (set in 'setDevice' function)

	var section = null;	//single section
	var initFoot = false;	//if to initialize footer behavior

	/*
	 *
	 */
	this.setFooter = function() {
		initFoot = self.CNTS['FIXED'] && (typeof __footer__ == 'undefined' || __footer__) ? true : false;	//if to initialize footer behavior
	};

	/*
	 * setting sections (screens) based on '__section__' variable (set in template - is a CSS selector)
	 */
	this.setSection = function() {
		var css = (typeof __section__ != 'undefined' && __section__) ? __section__ : '#page-content > div.wrap';	//section css selector (can be set by user)
		return section = section ? section : $(css);
	};

	/*
	 * if used device is a desktop
	 */
	var setDevice = function() {

		self.isTablet = (typeof __tablet__ != 'undefined' && __tablet__) ? true : false; //if we are using tablet
		self.isMobile = (typeof __mobile__ != 'undefined' && __mobile__) ? true : false; //if we are using mobile
		self.isDesktop = !self.isTablet && !self.isMobile ? true : false;

		$('html').addClass(self.isTablet ? 'tablet' : (self.isMobile ? 'mobile' : 'desktop'));	//adding css class indicating what device is used to HTML html-tag
	}();

	/*
	 * setting auxiliary constans
	 */
	var setVars = function() {
		//set constants
		self.CNTS['HP'] = $('body').hasClass('hp');	//if BODY has 'hp' css class
		self.CNTS['PAGE']['wrapper'] = $('#page-wrapper')[0];
		
		if (typeof self.CNTS['PAGE']['wrapper'] == 'undefined')	//precaution: if there is no normal layout (i.e. logout page) lets return false
			return false;
		self.CNTS['PAGE']['content'] = $('#page-content')[0];
		self.CNTS['PAGE']['head'] = $('#page-head')[0];
		self.CNTS['PAGE']['foot'] = $('#page-foot')[0];
		self.CNTS['PAGE']['widgetBar'] = $('#widgets-bar')[0];	//widgets bar
		self.CNTS['PAGE']['cookie'] = $('#cookie-info')[0];	//cookies information bar
	};

	/*
	 * setting auxiliary variables
	 * @PARAM prop (String) - if given it returns this variable (property)
	 */
	this.calcMisc = function(prop) {

		self.winHeight = $(win).height();
		self.winWidth = $(win).width();
		self.headHeight = $(self.CNTS['PAGE']['head']).height() + $(self.CNTS['PAGE']['head']).offset().top;	//height of the header = self height + header top position (can be moved down)
		self.widgetHeight = $(self.CNTS['PAGE']['widgetBar']).outerHeight();	//widgets bar height
		self.CNTS['SCROLL']['top'] = $(win).scrollTop();
		self.CNTS['SCROLL']['max'] = document.documentElement.scrollHeight - window.innerHeight;// - ((b = $('div.apla > div.bookmarks'))[0] ? b.height() : 0);	//win.scrollMaxY;
		self.CNTS['FIXED'] = $('body').hasClass('fixed') && $(win).width() >= 640;	//if BODY has 'fixed' css class (footer is fixed) and screen is wider then 640px (on mobiles footer should always stay at the bottom)

		if (prop)
			return self[prop];
	};

	/*
	 * setting screens array which holds all screens (indexes) and
	 * setting css height of each screen
	 */
	var setScreens = function() {

		self.calcMisc();	//calculate auxiliary variables
		self.CNTS['SCREENS']['height'] = self.headHeight;	//reset the height of the screens
		//var pad = self.headHeight;

		section.each(function(index) {
			$(this).css('min-height', '0');	//reset css height of the screen
			screens[index] = {};
			screens[index].elm = $(this);
			screens[index].no = index;
			screens[index].height = $(this).parent().height();
			//debug.log('parent: ' + $(this).parent()[0].id + ' height: ' + $(this).parent().height());
			screens[index].inited = $(this).parent().hasClass('inited');	//if screen HTML content is inserted
			//debug.log('winHeight: ' + self.winHeight + ' screen.height: ' + screens[index].height + ' headHeight: ' + self.headHeight + ' secHeight: ' + self.secHeight);
			screens[index].top = Math.round($(this).parent().offset()['top']);
			screens[index].bottom = screens[index].top + screens[index].height;
			//debug.log('screen: ' + screens[index].no + ' height: ' + screens[index].height + ' top: ' + screens[index].top + ' bottom: ' + screens[index].bottom);

			if (self.CNTS['SCREENS'].height < screens[index].bottom)
				self.CNTS['SCREENS'].height = screens[index].bottom;
		});
		calcScrollHeight();	//calculating height below which attaching widget-bar to footer

		//debug.log('initFoot: ' + initFoot);
		if (initFoot) {
			self.initFooter();
		}
		$(win).on('unload.mcz.all', function() {});	//fix for firefox script initialization after travelling to another www address and back in hisory (backspace button click)

		$(self.CNTS['PAGE']['content']).imagesLoaded(function() {	//have to calculate scroll height after content images are loaded
			calcScrollHeight();
		});
	};

	/*
	 * function to calculate distance below which we have to attach widget-bar to page foot
	 */
	function calcScrollHeight() {
		
		docHeight = Math.round($(self.CNTS['PAGE']['content']).outerHeight() + $(self.CNTS['PAGE']['content']).offset()['top']);	//document height without footer height (header + content + content top position (it can be moved down))
		scrollHeight = docHeight + self.widgetHeight;	//document height without footer height (header + content + content top position (it can be moved down) + height of the widget-bar)
		//debug.log('scrollHeight: ' + scrollHeight);
	}

	/*
	 * function that has to be run from outside scripts to calculate document height after page height change and initalize footer behaviour
	 */
	this.updateCalc = function() {

		if (!self.inited)
			self.init();

		calcScrollHeight();
		$(win).trigger('scroll.mcz.all.screen');
	};

	/*
	 * function to initialize footer behaviour (at fixed)
	 */
	this.initFooter = function() {

		initFoot = true;	//to add footer behavior when scrolled down the page (controlNavs)
		//self.calcMisc();	//calculate auxiliary variables again
	};

	/*
	 * navigation buttons initialization (up to the top, up one page, down one page)
	 * @PARAM flag (Boolean) - indicates if to add event
	 */
	function initScrolls(flag) {

		var nav = $('a.scroll');

		if (nav[0]) {
			//debug.log(self.CNTS['SCREENS']['height'] + ' ' + self.winHeight);
			if (self.CNTS['SCREENS']['height'] > self.winHeight)	//check to see if screens are taller than window
				controlNavs();	//showing/hiding proper scrolling arrows
			else
				nav.fadeOut(parent.animSpeed);	//hiding all scrolling arrows
			self.CNTS['SCROLL']['max'] = document.documentElement.scrollHeight - window.innerHeight;//win.scrollMaxY;	//need to calculate maximal scroll height again
			
			if (!flag) {
				screen = screens[0];
				
				nav.each(function() {
					if ($(this).hasClass('up')) {
						$(this)
							.on('click.mcz.all.scroll.up', function(e) {
								e.preventDefault();
								$("html, body").animate({scrollTop: 0}, 400);
								wheelPos = 0;
								return false;
								/*self.animateScroll($(this), 0, 0, null, function() {
									wheelPos = 0;
								});*/
							});
					}
					else if ($(this).hasClass('down')) {
						$(this)
							.on('click.mcz.all.scroll.down', function(e) {
								e.preventDefault();
								self.calcMisc();	//calculate auxiliary variables (mainly max-scroll)
								//debug.log(screen.no + ' ' + screens.length);
								self.animateScroll($(this), null, docHeight, null, function() {
									getCurrentScroll();
								});
							});
					}
				});

				/*
				 * window events:
				 * - scroll - show/hide (fade) navigation buttons (depends on window scroll position)
				 * - resize - calculate once again screens (dimmentions, e. c.)
				 */
				$(win)
					.on({
						'scroll.mcz.all.screen'	: function() {
	
							scrollEvent();
	
							if (wheelPos == -1)
								wheelPos = self.CNTS['SCROLL']['top'];	//setting mouse wheel position after initial scrolling
						},
						'resize.mcz.all.screen'	: function() {

							self.calcMisc();	//calculate auxiliary variables again (window height)

							if (self.CNTS['FIXED']) {	//calculate scroll height only when page is fixed (> 640px)
								calcScrollHeight();
							}
							controlNavs();	//must update navigation arrows and footer behaviour
						}
					})
					.trigger('scroll.mcz.all.screen');

				/*
				 * mouse wheel control
				 */
				$(document).on('mousewheel.mcz.all.screen', function(e, delta) {
					wheel = true;
					var step = 85;	//how many pixels in one scroll of the mousewheel
					var time = 300;	//minimal time of scrolling animation in miliseconds
					//if (self.scrolling)   //indicates that animation (scroll) is running
						//return;
						
					scrollEvent();
				});
				// keyboard control WCAG 05012015 @ fs
                /*$(self.CNTS['PAGE']['foot']).find('.skip-links').find('li:last-child').find('a').on('keydown.mcz.skiplinks', function(e) {
                    if (e.keyCode === 9 && !e.shiftKey) { // when only tab key was pressed, otherwise behaves default way
                        e.preventDefault();
                        $(self.CNTS['PAGE']['foot'])
							.css({'position': 'relative', 'display': 'block'})
							.attr('data-pos', 'relative');
                        window.scrollBy(0, docHeight);
                        $(self.CNTS['PAGE']['foot']).find('#footer').find('.column a').eq(0).focus(); 
                    }
                });*/
			}
		}
	}

	/*
	 * window scroll event (added to window.onscroll)
	 */
	function scrollEvent() {

		if (self.scrolling)	//indicates that animation (scroll) is running
			return;

		controlNavs();
	}

	/*
	 * function to control visibility of navigation buttons (fired when user scrolls or scrolling animation runs)
	 */
	function controlNavs() {
		var sTop = Math.round($(this).scrollTop()), breakpoint = $(window).height() * 0.75, fade, mobileWidgetHeight = 0;
		getCurrentScroll();

		$('a.scroll').each(function() {
			var scroller = $(this), scrollers = scroller.closest('.scrollers');
			
			fade = sTop > breakpoint ? true : false;

			if (sTop > scrollHeight - $(window).height() - mobileWidgetHeight) {
				scrollers.removeClass('fixed');
			}
			else {
				scrollers.addClass('fixed');
			}
			if (fade) {
				scroller.fadeIn(parent.animSpeed);
				setTimeout(function() {
					scroller.addClass('transition');
				});
			}
			else {
				scroller.removeClass('transition').fadeOut(parent.animSpeed);
			}
		});
		//debug.log('scroll: ' + (sTop + self.winHeight - self.widgetHeight) + ' screensHeight: ' + self.CNTS['SCREENS']['height']);
		if (self.CNTS['FIXED']) {	//footer behaviour is set only if needed (window must be wider than 640px): 'fixed' class is added (footer is absolutely positioned) to widgets bar
			self.footerBehaviour(sTop);	//footer automatic opening at page end (vertical scroll)
		}
		else {
			$(self.CNTS['PAGE']['widgetBar']).removeClass(self.CNTS['CLASS']['widgetBar']);	//if widgets bar shoudn't be 'fixed' so possibly added css class must be removed
		}
	}

	function getCurrentScroll() {

		self.CNTS['SCROLL']['top'] = Math.round($(win).scrollTop());	//actualizing scroll property
	}

	/*
	 * method to control auto opening/closing footer at page end (vertical scroll)
	 */
	this.footerBehaviour = function(scroll) {

		if (!scroll)
			scroll = self.CNTS['SCROLL']['top'];

		var widgetBar = $(self.CNTS['PAGE']['widgetBar']), cookieBottomPos = 0, c = null;

		if (self.winHeight + scroll >= scrollHeight) {	//if page is shorter than screen height (hole content fully visible)
			widgetBar.removeClass(self.CNTS['CLASS']['widgetBar']);
		}
		else {
			widgetBar
				.addClass(self.CNTS['CLASS']['widgetBar'])
				.css({'top': self.winHeight - self.widgetHeight});
		}
		if (self.CNTS['PAGE']['cookie'] && !(c = $(self.CNTS['PAGE']['cookie'])).is(':hidden')) {	//if cookie bar is visible than have to set it's position
			if (widgetBar.hasClass(self.CNTS['CLASS']['widgetBar'])) {
				cookieBottomPos = self.widgetHeight;
			}
		}
		$(self.CNTS['PAGE']['cookie']).css('bottom', cookieBottomPos);	//set cookie's bar bottom position
	};

	/*
	 * method to animate scrolling the page
	 * @param: a (Object) - possible html href element we invoked
	 * @param: screenNo (Number) - number of the screen we must scroll to
	 * @param: targetPos (Number) - target y (end) position of the scroll animation
	 * @param: duration (Number) - time of scroll animation
	 * @param: callback (Fuction) - additional callback function
	 */
	this.animateScroll = function(a, screenNo, targetPos, duration, callback) {

		if (a) {
			a.blur();
			a.fadeOut(parent.animSpeed);
		}
		//if (typeof screen == 'undefined') {
			//screen = {no: 0};
		//}
		if (screenNo == null || screenNo == screen.no)	//if no screenNo is passed or is equal to current screen than we scroll on one and the same screen
			screenNo = screen.no;

		self.scrolling = true;	//flag indicating that animation is running (disable navigation buttons)
		var added = false;	//flag indicating if tiles' animation is already added
		//$(win).off('scroll.mcz.all.screen');   //delete scroll event

		//if (!targetPos)
			//$(win).off('scroll.mcz.all.tile.' + screenNo); //delete scroll event of the screen we must scroll to (the same screen)
		var animateTo = typeof targetPos != 'undefined' ? targetPos : screens[screenNo].top;	//end position of scrolling animation
		//debug.log('screenNo: ' + screenNo + ' screens[' + screenNo + '].top: ' + screens[screenNo].top + ' animate: ' + animateTo);

		//if no target y position is defined & we scrolling on one and the same screen & viewport height is smaller than screen height & current screem is not yet whole revealed
		if (typeof targetPos == 'undefined' && screen.no == screenNo && self.winHeight < screen.height && $(win).scrollTop() + screen.height < screen.bottom) {
			animateTo = screen.bottom;	//scroll to bottom of the screen
			//debug.log('if: animateTo: ' + animateTo);
		}
		$(body).animate(
			{
				scrollTop	: animateTo
			},
			{
				duration	: duration || Math.round(parent.animSpeed * Math.abs(self.CNTS['SCROLL']['top'] - animateTo) / 500),	//time of animation: counted to be more less the same no matter of animation length (scroll height)
				complete	: function() {
					self.scrolling = false;
					controlNavs(1);
					//callback function
					if (callback)
						callback();
					//add scroll event
					//$(win).on('scroll.mcz.all.screen', function() {
						//scrollEvent();
					//});
				},
				step		: function(now, fx) {
					//debug.log('scroll: ' + now);
					if (initFoot)
						self.footerBehaviour(Math.round(now));	//open/close footer only when needed (initFoot = true)
				}
			}
		);
	};
	
	this.init = function() {

		if (self.inited) return;

		self.inited = true;

		setVars();
		self.setSection();
		self.setFooter();
		setScreens();
		initScrolls();
	};

	$(function() {
	
		if (self.autoInit)
			self.init();
	});
};