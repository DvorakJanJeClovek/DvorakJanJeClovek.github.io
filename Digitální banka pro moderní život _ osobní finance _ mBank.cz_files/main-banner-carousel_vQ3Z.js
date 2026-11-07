/*!
 * mBank, main-banner-carousel.js
 * modified carousel-banner.js (v. 1.9.2)
 * Copyright (C) QUERCUS, https://qrqs.eu
 * ICApps.MAIN_BANNER_CAROUSEL:: subobject to control UI on site (dependent from it's parent object ICApps; uses jQuery and jQuery UI)
 */
/*
 * v. 1.0.1 @ pp (19/04/22): dodanie ukrywania zakladek z tym, ze zakladki sa zawsze odkryte (hiddenTabs = false, poniewaz portlet nie pozwala na ukrywanie zakladek) (BREMBDEV-3054)
 * v. 1.0.2 @ pp (25/04/22): poprawka obliczania wysokosci zakladek dla paska promocyjnego (SKCZDEV-606)
 * v. 1.0.3 @ pp (06/05/25): poprawiona funkcja zmieniajaca naglowki 'changeHeadings'; dodany atrybut 'aria-labelledby' do paska postepu w zakladce 'createNav'; dodana obsluga 
 							 nawigacji klawiszem TAB do przycisku w slajdzie; wydluzony czas po zdarzeniu dotkniecia na poruszanie zakladek (nav click); dodane dodawanie klasy 
							 do kontenera jezeli jest wiecej niz jeden slide (SKCZDEV-791)
 */
if (typeof ICApps == 'undefined')
	ICApps = {fake:true};

ICApps.MAIN_BANNER_CAROUSEL = {};

(function(self) {
	
	if (ICApps.fake) {
		var mes = '\'main-banner-carousel.js\' - brak skryptu \'scripts.js\'!';
		return typeof console == 'object' ? console.log(mes) : '';
	}
	
	var version = 'v. 1.0.3 CZ (1.2.7 PL) :: 19/05/25 @ pp',
		inited = false,
		parent = ICApps,
		de = parent.de,	//debugger
		device = parent.device.substring(0, 1),
		carouselContainer = $('#main-banner-carousel'),
		uuid = carouselContainer.attr('data-uuid'),
		carousel, // find the slide list in carousel
		slides,	// sigle item with slide(s)
		lastSlide,
		links,
		tabs, // find slides' nav container for tabs' list
		tabsWidth,
		tabsShort,	//if tabs are wider than screen
		tabsPos,	//current tabs horizontal scroll position
		tabsMaxPos,	//maximal horizontal scroll position
		currentTab,	//currently shown slide's tab
		hiddenTabs,	//if tabs are hidden in the carousel view
		touchOn,	//touch event in progress
		nav,	//navigation arrows
		interval, // find time interval, // given interval time of slides changing
		mainIntval, // given interval time once again (different variable)
		smallIntval = 100, // small interval (fraction of given slides change interval time)
		loopsAmount = 0, // number of small timeout loops (fraction)
		rotate,
		startTimeout,
		loopTimeout,
		navTimeout,
		timeout,
		legalNoteNumber = -1, // initially, no legal notes
		serviceListNumber = -1, // initially, no servuce lists
		leftConfig, // config object for swipe gestures
		rightConfig, // config object for swipe gestures
		displayedSlide = 0;	//last viewed slide in carousel
	
	self.stopped = false;
	
	this.getVersion = function() {
		
		return self.version;
	};
	
	// creating carousel navigation tabs at the bottom
	function createNav() {
		
		tabs.children('li').each(function(index) {
			
			var tab = $(this), href = tab.children('a');
			
			tab.attr('index', index);
			href.append('<span class="progress" aria-labelledby="' + href.attr('id') + '" />');	//active tab gets element to show progress
			
			if (!hiddenTabs) {	//adding click event only if tabs aren't hidden
				clickOn(href); // set clicks
			}
		});
	}
	
	// gets or sets attribute value of element depending of whether new value (i) is given
	function setGetAttr(el, attr, i) {
		
		if (typeof i !== 'undefined') {
			el.attr(attr, i);
		}
		else {
			return el.attr(attr);
		}
	}
	
	// activating nav tab element
	function activateNav(el) {
		
		currentTab = el;
		el
			.css('border-color', el.attr('data-activity'))	//active tab should have the same color as banner's background
			.attr('aria-selected', true);	//adding aria attribute to indicate selected state
		el.parent().addClass('active');
		el.parent().attr('data-active', 1);
		
		//progress bar in tab and its animation
		var progressBar;
		
		if ((progressBar = el.children('.progress'))[0]) {
			progressBar
				.css('border-color', el.attr('data-activity'))	//setting color as parent tab
				// Set its ARIA roles and states,
				// so that assistive technologies know what kind of widget it is.
				.attr('role', 'progressbar')
				.attr('aria-valuemin', 0)
				.attr('aria-valuemax', 100);
			animateBar(progressBar, el, interval);
		}
		if (tabsShort && !hiddenTabs) {
			showActiveTab();
		}
	}
	
	//function to start progress bar animation of given tab and time (duration)
	function animateBar(bar, el, time) {
		
		bar
			.attr('animation', true)	//adding attribute showing that animation is in progress
			.animate({
				'width' : el.parent().width() - 3
			}, {
				duration: time,
				easing: 'linear',
				progress: function() {
					
					if (self.stopped) {	//if slide is hovered animation have to stop
						$(this)
							.removeAttr('animation')	//removing attribute to be able to start animation again 
							.stop();
					}
					if (el.is(':focus')) {	//aria-valuenow attribute is changed only when tab is in focus state
						var percentComplete = Math.round($(this).width() * 100 / (el.parent().width() - 3));
						$(this).attr('aria-valuenow', percentComplete);
					}
				},
				complete: function() {
					
					bar
						.css('width', 0)	//after competting an animation have to reset progressBar width and aria attribute
						.attr('aria-valuenow', 0)
						.removeAttr('animation');	//after animation is complete can remove attribute showing that animation is in progress
				}
			});
	}
	
	// deactivating nav tab element
	function deactivateNav(el) {
		
		//taking off special (active) color, aria 'selected' attriburte, active class and active attribute
		el
			.css('border-color', '')
			.removeAttr('aria-selected')
			.parent()	//selecting parent tab to remove it's active class and attribute
				.removeClass('active')
				.removeAttr('data-active');
		
		//stopping progress bar in tab animation and resetting its width
		el.children('.progress')
			.stop()
			.css('width', 0);
	}
	
	// animate nav tabs
	function animateNav(i) {
		
		tabs.find('li > a').each(function() {	//first should deactivate all tabs
			
			deactivateNav($(this));
		});
		activateNav(tabs.find('li[index=' + i + ']').children('a'));	//activate only chosen one
	}
	
	function updateTabNav() {
		
		tabsWidth = 0;
		
		tabs.children('li[index]').each(function() {
			
			tabsWidth += $(this).width();
		});
		
		//if tabs exeeds carousel have to show navigation arrows (i don't know why but tabs that fits are always one or two pixels (depends on browser) wider then slides)
		if (tabsWidth > slides.width() + 2) {
			tabs.parent().addClass('shorten');	//shortening tabs
			tabsShort = true;	//indicator that tabs are wider than screen
			nav.addClass('active');	//displaying navigation arrows			
		}
		else {
			tabs.parent().removeClass('shorten');	//widening tabs
			tabsShort = false;	//indicate that tabs fit on screen
			nav.removeClass('active');	//hiding navigation arrows
			tabs.removeAttr('style');	//removing possibly added inline styles
		}
	}
	
	//function scrolls tab list to show on screen current tab
	function showActiveTab() {
		
		if (hiddenTabs) {	//if tabs are hidden there's no need to do this
			return;
		}
		var elPos = currentTab.position().left, elW = currentTab.outerWidth(), tabsW = tabs.width(), 
			prev, next;	//if to activate or deactivate navigation arrows
		
		if ((elPos + elW > tabsW) || elPos < 0) {	//if current tab doesn't fit whole on screen
			tabsPos += Math.round(elPos);	//actualize tab horizontal scroll position to show active tab
			
			if (tabsPos >= tabsMaxPos) {
				tabsPos = tabsMaxPos;	//if new tab's scroll position exeeds maximal scroll position then must set it to max
				prev = true;	//activating left arrow
				next = false;	//deactivating right arrow
			}
			else if (tabsPos <= 0) {
				tabsPos = 0;	//if new tab's scroll position is less than 0 then must set it to 0
				prev = false;
				next = true;
			}
			else {
				prev = next = true;	//activating both navigation arrows
			}
			nav.eq(0).toggleClass('off', !prev);
			nav.eq(1).toggleClass('off', !next);
			
			if (!touchOn) {	//if touch event is in progress then cannot move to active tab
				tabs.animate({
					scrollLeft: tabsPos
				}, 200);
			}
		}
	}
	
	// get data from attribute or return '0' if slide is targetted
	function getData(el, key) {
		
		if (el.hasClass('rtt-item')) {
			return '0';
		}
		else {
			return el.attr('data-statad') ? JSON.parse(el.attr('data-statad'))[key] : undefined;
		}
	}
	
	// send statistics
	function sendStats(nr, key) {
		
		var data;
		
		if (!slides.eq(nr).find('.slide:not(.hidden)').hasClass('viewed') && (data = getData(slides.eq(nr).find('.slide:not(.hidden)'), key))) { // statistics on first viev		
			if (ICApps.STATS && ICApps.STATS.sendViewCarouselStats) { // send required data
				ICApps.STATS.sendViewCarouselStats(data);
			}
			slides.eq(nr).find('.slide:not(.hidden)').addClass('viewed'); // set class to prevent sending statistics
		}
	}
	
	// animate nav circle button
	function animateNavBtn(btn) {
		
	}
	self.animateNavBtn = animateNavBtn;
	
	// load image on demand
	function loadImage(container) {
		
		function setLoadedState(src) {
			
			container
				.css('background-image', 'url(' + src + ')')	//setting background of loaded image
					.parents('li')
						.removeClass('loading')
						.addClass('loaded');
			parent.preloader(false, 'main-banner-carousel');	//turning off the preloader
		}
		
		var src = container.attr('data-image');
		
		if (src) {
			container.parents('li').addClass('loading');	//image is loading
			
			if (!parent.standalone) {	//if page is on mbank can download image by AJAX request otherwise have to use old way to download image
				$.ajax({
					url : src,
					success : function(res) {
						
						setLoadedState(src);	//image is loaded
					}
				});
			}
			else {
				var fakeImg = new Image();
				
				fakeImg.onload = function() {	//attaching an onload event to image
					
					setLoadedState(src);	//image is loaded
				};
				fakeImg.src = src;
			}
		}
		else {	//image already loaded
			container.parents('li').addClass('loaded');
			ICApps.preloader(false, 'main-banner-carousel');
		}
	}
	
	// load video on demand
	function loadVideo(slide) {
		
		var videoBox = slide.find('.video-box'),
			srcStr = '',
			video;
		
		if (videoBox.length) {
			slide.addClass('loading');
			
			if (videoBox.attr('data-webm')) {
				srcStr += '<source src="' + videoBox.attr('data-webm') + '" type="video/webm">';
			}
			srcStr += '<source src="' + videoBox.attr('data-mp4') + '" type="video/mp4">';
			video = $('<video loop="true" autoplay="true" poster="' + videoBox.attr('data-poster') + '">' + srcStr + '</video>');
			videoBox.append(video);
			
			video.on('load', function() {
				
				slide.removeClass('loading');
				slide.addClass('loaded');
				ICApps.preloader(false, 'main-banner-carousel');
			});
		}
	}
	
	//additional rotation of slides
	function setRotation(no) {
		
		if (typeof localStorage === 'undefined') {
			return;
		}
		if (typeof no !== 'undefined') {
			localStorage.setItem(uuid, no);
		}
		else {
			var savedUuid = localStorage.getItem(uuid);
			var maxItems = carouselContainer.attr('data-items');
			
			if (maxItems) {
				maxItems = parseInt(maxItems, 10);
			}	
			if (!maxItems || maxItems > slides.length) {
				maxItems = slides.length;
			}
			if (savedUuid != null) {
				displayedSlide = parseInt(savedUuid, 10) + 1;
				
				if (displayedSlide >= maxItems) {
					displayedSlide = 0;
				}
			}
			setDisplayed(displayedSlide);
		}
	}
	
	//actualizing storage value
	function setDisplayed(no) {
		
		if (typeof no == 'number') {
			if (no < displayedSlide) {
				if (displayedSlide < slides.length - 1) {
					return;
				}
			}
			displayedSlide = no;
			setRotation(no);	//saving slide to show in local storage
		}
	}
	
	// animate slides
	function animateSlides(i, pos, focus) {
		
		var slideTimeout1,
			slideTimeout2;
		
		if (navTimeout) {
			clearTimeout(navTimeout);
		}
		
		slideTimeout1 = setTimeout(function() {
			
			var slide = slides.eq(i);
			
			lastSlide.removeClass('current');
			lastSlide.find('[class$=-label], a.button')
				.attr('tabindex', '-1')
				.filter('a')
					.attr('aria-hidden', true);
			lastSlide = slide;
			slide.addClass('current');
			//setDisplayed(i);
			animateNav(i);
			sendStats(i, 'portletNo');
			
			if (!focus) {
				self.stopped = false;
			}
			if (focus) {
				slide.find('[class$=-label], a.button')
					.attr('tabindex', '0')
					.filter('a')
						.attr('aria-hidden', false);
						var c = carousel.find('.current a.button');
						
						if (c) {
							c[0].focus();
						}
			}
			clearTimeout(slideTimeout1);
		}, 200);
	}
	
	// main loop
	function animationLoop(n) {
		
		var switchSlides = false;
		var nextSlide = n === slides.length - 1 ? 0 : n + 1;	//if watching last slide in carousel next one is first slide
		++loopsAmount;
		
		if (loopsAmount * smallIntval >= mainIntval * 80 / 100) {
			if (slides.eq(nextSlide).length && !slides.eq(nextSlide).is('[class*=load]')) {
				slides.eq(nextSlide).find('.slide').each(function() {
					
					loadImage($(this).find('.col-right'));
				});
				if (slides.eq(nextSlide).find('.video-box').length) {
					loadVideo(slides.eq(nextSlide));
				}
			}
		}
		
		slides.each(function() {
			
			if ($(this).hasClass('current')) {
				n = parseInt(setGetAttr($(this), 'index'), 10);
				
				if (mainIntval <= loopsAmount * smallIntval) {
					mainIntval = interval;
					loopsAmount = 0; // after slides change loops must start from the beginning
					switchSlides = true; // when interval pass time to switch slides
					n = n + 1; // switching next slide after interval pass
				}
			}
		});
		
		if (n == slides.length) {
			n = 0;
		}
		if (!self.stopped) {
			if (switchSlides) {
				animateSlides(n, 0);
			}
			mainLoop(n);
		}
	}
	self.animationLoop = animationLoop;
	
	function mainLoop(n) {
		
		clearTimeout(loopTimeout);
		
		loopTimeout = setTimeout(function() {
			
			animationLoop(n);
		}, smallIntval);
	}
	
	// temp function for testing
	function startLoop() {
		
		self.stopped = false;
	}
	
	// stop the loop
	function stopLoop() {
		
		self.stopped = true;
	}
	
	// activate clicks
	function clickOn(el) {
		
		var timeout1,
			timeout2,
			silent = false; //a flag to prevent multiple clicks in a short time

		el.on('mousedown.mpl.carousel-stop keydown.mpl.carousel-stop', function(e) { // add action to nav tabs href element
			
			if (e.type == 'keydown') {
				if (e.which == 9) {
					return;
				}
			}
			e.preventDefault();
			
			if (silent || el.attr('data-active')) {
				return;
			}
			silent = true;
			
			timeout2 = setTimeout(function() {
				
				silent = false;
				clearTimeout(timeout2);
			}, 500);

			var focus = e.keyCode === 13 || e.which === 1 ? true : false,
				index = parseInt($(this).parent().attr('index'), 10);
			//console.log('clickOn type: ' + e.type + ' keyCode: ' + e.keyCode + ' which: ' + e.which);
			if (e.type === 'click' || focus) {
				if (self.stopped !== true && !el.hasClass('active')) {
					countTimeout(0, index);
				}
				if (!slides.eq(index).is('[class*=load]')) {
					ICApps.preloader(true, 'main-banner-carousel', 'spinner');
					
					slides.eq(index).find('.slide').each(function() {
						
						loadImage($(this).find('.col-right'));
					});
					if (slides.eq(index).find('.video-box').length) {
						loadVideo(slides.eq(index));
					}
				}
				animateSlides(index, 0, focus); // animate carousel
				
				if (!el.hasClass('active'))
					stopLoop();
					
					timeout1 = setTimeout(function() {
						
						if (rotate && self.stopped) {
							startLoop();
						}
						clearTimeout(timeout1);
					}, 0);
				if (focus) {
					stopLoop();
				}
			}
		});
	}
	
	function countTimeout(next, index) {
		
		if (typeof index == 'undefined') {
			index = setGetAttr(slides.filter('.current'), 'index');
			mainIntval = mainIntval - (loopsAmount * smallIntval);	// remaining interval time
		}
		else {
			mainIntval = interval;
		}
		loopsAmount = 0;
		
		if (next) {
			index = index > 3 ? 0 : ++index;
		}
		if (timeout) {
			clearTimeout(timeout);
		}
		if (currentTab != undefined) {
			animateBar(currentTab.children('.progress'), currentTab, mainIntval);
		}
		// if ($('html').hasClass('desktop')) {
			// animateNavBtn(nav.find('circle').eq(index)); // commented cause its makes double faster animation on mobile after swipe right/left
		// }
		mainLoop(index);
	}
	self.countTimeout = countTimeout;
	
	function calcValuesMargin(values) {
		
		//var matrix = values.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
		//var transform = matrix[13] || matrix[5];
		var marginBottom = values.height(); /*+ Math.abs(parseInt(transform))*/;
		
		return marginBottom;
	}
	
	//hiding scrollbar on mobiles
	function updateTabsScroll() {
		
		if (device === 'm') {
			var h = tabs.outerHeight();
			tabs
				.attr('orig', h);	//saving original tabs height
			tabs.parent().height(h - 10);	//height - scrollbar height
			nav.height(h - 10);
		}
	}
	
	function addPromoBarPad(elm, init) {
		
		if (!elm.length) {
			return;
		}
		var margin = 6;	//margin between text and promo-bsr
		var promoBarPad = elm.outerHeight() + margin;
		var height = promoBarPad;
		
		if (tabs.length) {
			if (!hiddenTabs) {	//if tabs are hidden there's no need to calulate its' height  
				var links = tabs.find('li > a'), linksHeight = links.attr('data-pad');	//data-pad = lastly set tabs' top padding height
				
				if (!linksHeight || promoBarPad > linksHeight) {	//if promo-bar height of last tab is bigger then previously set then have to set bigger one
					links
						.attr('data-pad', promoBarPad)	//new, bigger top-padding of tabs
						.css('padding-top', promoBarPad);	//adding promo bar height to tabs
				}
				tabs.parent().addClass('promo-bar');	//if slide has promo bar then adding special class to tab container
				height = tabs.outerHeight();
				nav.css('height', tabs.outerHeight());	//setting navigation tabs height the same as tabs have
			}
		}
		carouselContainer.attr('style', 'margin-bottom: ' + (height + 13) + 'px !important');
	}
	
	function setNavHeight() {
		
		var h;
		
		if (nav.length && !hiddenTabs) {	//navigation tabs are created only if there is more then one visible slide but maybe hidden
			h = tabs.outerHeight();
			nav.css('height', h);	//setting navigation tabs height the same as tabs have
			carouselContainer.attr('style', 'margin-bottom: ' + (h + 13) + 'px !important');	//carousel has to have same margin as tabs height
		}
	}
	
	function changeHeadings() {
		
		slides.each(function() {
		
			var s = $(this).find('.slide.active'), h, t;
			
			for (var i = 1; i < 3; i++) {
				 h = s.find('h' + i);
				
				if (h.length) {
					t = h.text();
					h.replaceWith('<p class="h' + i + ' heading" role="heading" arua-level="' + (i + 1) + '">' + t + '</p>');
				}
			}
		});
	}
	
	function addSlidesClass() {
		
		carouselContainer.addClass('slides');
	}
	
	// initialize
	function init() {
		
		slides = [];
		
		if (inited === true || !carouselContainer[0]) {	//if it was inited then don't do this again
			return;
		}
		
		var timeout1 = setTimeout(function() {
			
			var promoBarCounter = carouselContainer.find('.color-bar .antichurn-counter');

			if (!promoBarCounter.length) {
				carouselContainer.addClass('visible');
			}
			clearTimeout(timeout1);
		}, 500);
		
		inited = true;
		carousel = carouselContainer.children('ul.slides'); // find the slide list in carousel
		slides = carousel.children('li');	// sigle item with slide(s)
		tabs = carouselContainer.find('div.title-tabs > ul'), // find slides' nav container for tabs' list
		hiddenTabs = false;	//tabs are always visible	//carouselContainer.find('div.title-tabs.hidden-tabs')[0] ? true : false;	//tabs are hiddden in carousel
		nav = carouselContainer.find('div.title-tabs > .nav'),	//navigation arrows
		links = slides.find('a[href]');
		interval = parseInt(carouselContainer.attr('data-rotation-time'), 10); // find time interval
		rotate = carouselContainer.attr('data-rotate') && carouselContainer.attr('data-rotate') === 'true' ? true : false;
		mainIntval = interval;
		
		slides.each(function(index) {
			
			var slide = $(this);
			var values = slide.find('.values');
			var promoBar = carouselContainer.find('.slot > .color-bar');
			var counter = promoBar.find('.antichurn-counter');
			
			var timeout = setTimeout(function() {
				
				if (slide.css('display') != 'none') {
					if (values.length) {
						carouselContainer.attr('style', 'margin-bottom: ' + calcValuesMargin(values) + 'px !important');
					}
				}
				if (!slide.is(':hidden')) {
					if (promoBar.length) {
						if (counter.length) {
							var interval = setInterval(function() {
								
								if (counter.attr('data-inited') || counter.attr('data-expired')) {
									addPromoBarPad(promoBar.eq(index), true);	//adding promo bar height to tabs
									clearInterval(interval);
									updateTabsScroll();	//hiding scroll (only on mobiles)
								}
							}, 100);
						}
						else {
							addPromoBarPad(promoBar.eq(index), true);	//adding promo bar height to tabs
							updateTabsScroll();	//hiding scroll (only on mobiles)
						}
					}
					else {
						setNavHeight();
						updateTabsScroll();	//hiding scroll (only on mobiles)
					}
					carouselContainer.addClass('visible');
				}
				clearTimeout(timeout);
			}, 0);
		});
		
		//preparing active and visible slides array
		slides = slides.filter(function(i, el) {
			
			if ($(el).html().trim() === '') {
				$(el).remove();
			}
			else {
				return $(el);
			}
		});
		
		var tabIndex = 0;
		
		slides = slides.filter(function(i, el) {
			
			var tempSlides = [];
			var items = $(el).find('.slide'); // single item (div.slide) in slide (li)
			
			for (var y = 0; y < items.length; y++) {
				if (!$(items[y]).hasClass('hidden')) {
					tempSlides.push(1); // if item is active we add index to temporary array
				}
				else {
					tabs.children().eq(tabIndex).addClass('hidden');
				}
				tabIndex++;
			}
			if (tempSlides.length === 0) { // if temporary array has no length that means there are no active items in slide so we must hide it
				$(el).hide();
			}
			else {
				return $(el);
			}
		});
		
		tabs.children().each(function(i, el) {
			
			if ($(el).hasClass('hidden')) {
				$(el).remove();
			}
		});
		
		if (slides.length > 1) {	//there are more then one visible slide in carousel
			if (carouselContainer.attr('data-rotation')) {	//additional rotation option is on so have to actualize 'displayedSlide'
				setRotation();
			}
		}
		//activating first slide
		slides.eq(displayedSlide).addClass('current');
		lastSlide = slides.eq(displayedSlide);
		
		slides.eq(displayedSlide).find('.col-right').each(function() {
			
			if ($(this).attr('data-image')) {
				ICApps.preloader(true, 'main-banner-carousel', 'spinner');
				loadImage($(this));
			}
		});
		
		if (slides.eq(displayedSlide).find('.video-box').length) {
			loadVideo(slides.eq(displayedSlide));
		}
		
		$(window).on('resize.mpl.carousel-resize', function() {	//on window resize have to calculate margin and padding again
				
			slides.each(function(index) {
				
				var slide = $(this);
				var values = slide.find('.values');
				var promoBar = carouselContainer.find('.slot > .color-bar');
				var counter = promoBar.find('.antichurn-counter');
				
				if (values.length && slide.css('display') != 'none') {
					carouselContainer.attr('style', 'margin-bottom: ' + calcValuesMargin(values) + 'px !important');
				}
				if (!slide.is(':hidden')) {
					if (promoBar.length) {
						if (counter.length) {
							if (counter.attr('data-inited') || counter.attr('data-expired')) {
								addPromoBarPad(promoBar.eq(index));	//adding promo bar height to tabs
								updateTabsScroll();	//hiding scroll (only on mobiles)
							}
						}
						else {
							addPromoBarPad(promoBar.eq(index));	//adding promo bar height to tabs
							updateTabsScroll();	//hiding scroll (only on mobiles)
						}
					}
					else {
						setNavHeight();
						updateTabsScroll();	//hiding scroll (only on mobiles)
					}
					carouselContainer.addClass('visible');
				}
			});
			if (slides.length > 1) {
				updateTabNav();
				nav.eq(0).trigger('click.mpl.carusel.tabs.nav');	//have to execute navigation to calculate dimmensions and set menu in max left position
			}
		});
		
		if (slides.length > 1) {	//there are more then one visible slide in carousel
			createNav(); // create nav content
			updateTabNav();	//updating tabs width for navigation
			changeHeadings();	//changing H1 headings to P as can be just one H1 in carousel
			addSlidesClass();	//adding CSS class for more than one slide
			
			if (!hiddenTabs) {	//if tabs are hidden in view there's no need to add events
				nav.on('click.mpl.carusel.tabs.nav', function() {	//there is more than one slide so have to allow to navigate
					
					if (!tabsShort) {	//if tabs fit there is no need to navigate
						return;
					}
					if ($(this).hasClass('off')) {	//if we reach max in any direction
						return;
					}
					var dir = $(this).hasClass('prev') ? -1 : 1;	//moving direction (which arrow)
					tabsPos = Math.round(tabs.scrollLeft());	//current left position of tabs menu
					var pos = tabsPos;
					tabsMaxPos = tabsWidth - tabs.width();	//maximal horizontal scroll amount of tabs menu (difference between real width of all tabs and visible part of tabs on the screen)
					var max = tabsMaxPos;
					var min = 0;	//minimal horiontal scroll amount
					var move = 0;	//single move after clicking navigation arrow
					var maxMove = 200;	//maximal width of single move
					nav.removeClass('off');	//activating both nav arrows
					
					if (dir > 0) {	//moving right (next)
						if (pos >= min) {
							move = max - pos;
						}
					}
					else {	//moving left (prev)
						if (pos <= max) {
							move = min - pos;
						}
					}
					if (Math.abs(move) > maxMove) {
						move = dir * maxMove;
					}
					else {
						$(this).addClass('off');	//deactivating current arrow cause cannot move further
					}
					tabs.animate({
						scrollLeft: pos + move
					}, 200);
				});
				nav.eq(0).trigger('click.mpl.carusel.tabs.nav');	//triggering move to deactivate left arrow (tabs menu is in max left position)
				
				if (tabsShort) {	//if tabs doesn't
					tabs.on('touchend.mpl.carousel.tabs', function() {
						
						touchOn = false;
						
						setTimeout(function() {
							
							if (!touchOn) {
								tabsPos = tabs.scrollLeft();
								showActiveTab();
							}
						}, 1000);
					});
					tabs.on('touchstart.mpl.carousel.tabs', function() {
						
						touchOn = true;
					});
					//var obj = {horizrailenabled: true};
					//tabs.niceScroll($.extend({}, parent.scrollBarLegalNote, obj));	//horizontal scrolling
				}
				
				//adding key event to button in slide for keyboard TAB navigation thru page
				slides.each(function(e) {
					
					$(this).find('.button.big.red').on('keydown.mcz.carousel', function(e) {
						
						if (e.which === 9) {
							$(this).attr('tabindex', -1);	//have to remove possibility of getting focus
							var index = parseInt($(this).attr('index'), 10) + (e.shiftKey ? 0 : 1),
								nextElm = tabs.find('li[index="' + index + '"]').eq(0);
							
							if (nextElm.length) {	//if next tab (slide) exists
								e.preventDefault();
								nextElm.children('a').eq(0)[0].focus();
								return false;
							}
						}
					});
				});
				
				animateNav(displayedSlide);	//activate first slide nav tab
			}
		}
		else { //do not proceed if there are no slides in carousel
			carouselContainer.children('div.title-tabs').hide();	//hiding unnecessary tabs added in portlet (CMS)
			return;
		}
		
		/*links.each(function() {
			
			$(this).attr('tabindex', '-1');
		});*/
		
		slides.each(function(i) { // set index attribute of each slide
			
			var el = $(this),
				legalNotes = carouselContainer.find('> .legal-note'),
				serviceLists = carouselContainer.find('> .service-list'),
				legalClone,
				serviceClone;
			
			if (el.find('.slide .legal-note').length) {
				legalNoteNumber++;
			}
			if (el.find('.slide .service-list').length) {
				serviceListNumber++;
			}
			if (el.find('.slide').hasClass('rtt-item')) {
				var originLegal = el.find('.slot > .legal-note');
				var originService = el.find('.slot > .service-list');
				legalClone = originLegal.clone();
				serviceClone = originService.clone();
				originLegal.remove();
				originService.remove();
				
				if (legalNoteNumber === 0) {
					legalNotes.eq(legalNoteNumber).before(legalClone);
				}
				else {
					legalNotes.eq(legalNoteNumber - 1).after(legalClone);
				}
				if (serviceListNumber === 0) {
					serviceLists.eq(serviceListNumber).before(serviceClone);
				}
				else {
					serviceLists.eq(serviceListNumber - 1).after(serviceClone);
				}
				legalClone.find('.legal-text').on('mouseleave.mpl.close-legal', function() {
					
					ICApps.closeLegal($(this));
				});
				serviceClone.find('.service-list-text').on('mouseleave.mpl.close-legal', function() {
					
					ICApps.closeLegal($(this));
				});
				if (ICApps.scrollBarLegalNote['doc']) {
					delete ICApps.scrollBarLegalNote['doc'];
				}
				legalClone.find('.row').niceScroll(ICApps.scrollBarLegalNote);
				serviceClone.find('.row').niceScroll(ICApps.scrollBarLegalNote);
				ICApps.activateScroll(legalClone.find('.legal-text'));
				ICApps.activateScroll(serviceClone.find('.service-list-text'));
			}
			setGetAttr(el, 'index', i);
			setGetAttr(el.find('a.button.big.red'), 'index', i);
			i++;
		});
		
		// swipe gestures
		leftConfig = {
			direction: 'left',
			prevDirection: 'horizontal',
			amplitude: 50
		};
		
		rightConfig = {
			direction: 'right',
			prevDirection: 'horizontal',
			amplitude: 50
		};
		
		ICApps.swipe(carousel[0], leftConfig, function(className) {
			
			var index = parseInt(carousel.find('.current').attr('index'));
			
			if (className && (className == 'legal-label' || className == 'service-list-label'))
				return;
			if (index === slides.length - 1)
				index = -1;
			index += 1;
			loopsAmount = 0;
			
			if (!slides.eq(index).is('[class*=load]')) {
				ICApps.preloader(true, 'main-banner-carousel', 'spinner');
				
				slides.eq(index).find('.col-right').each(function() {
					
					loadImage($(this));
				});
				if (slides.eq(index).find('.video-box').length)
					loadVideo(slides.eq(index));
			}
			countTimeout(index + 1);
			animateSlides(index, 0, true);
		});
		
		ICApps.swipe(carousel[0], rightConfig, function(className) {
			
			var index = parseInt(carousel.find('.current').attr('index'));
			
			if (className && (className == 'legal-label' || className == 'service-list-label'))
				return;
			if (index === 0)
				index = slides.length;
			index -= 1;
			loopsAmount = 0;
			
			if (!slides.eq(index).is('[class*=load]')) {
				
				ICApps.preloader(true, 'main-banner-carousel', 'spinner');
				
				slides.eq(index).find('.col-right').each(function() {
					
					loadImage($(this));
				});
				if (slides.eq(index).find('.video-box').length) {
					loadVideo(slides.eq(index));
				}
			}
			countTimeout(index - 1);
			animateSlides(index, 0, true);
		});
		
		sendStats(0, 'portletNo'); // send statistics of first slide
		//activateNav(tabs.find('li').eq(0)); // activate first nav tab
		
		var timeout = setTimeout(function() {
			
			if (rotate) {
				//animateNavBtn(nav.find('circle').eq(0));
			}
			clearTimeout(timeout);
		}, 0);
		
		startTimeout = setTimeout(function() {
			
			if (rotate) { // if autorotation on
				animationLoop(displayedSlide); // start animation loop
			}
			clearTimeout(startTimeout);
		}, smallIntval);
		
		$(window).on('resize.mpl.carousel-resize2', function() {	// when window resized
			
			slides.each(function() { // reposition slides
				
				$(this).css({'right': 0});
			});
		});
		
		/*carousel.find('.legal-label, .service-list-label').each(function() { // stop carousel when legal note label or service-list label or slide frame is hovered
			
			var el = $(this);
			el.attr('tabindex', '-1');
			
			if ($(window).width() > 768) {
				el.on('mouseenter.mpl.carousel-stop', function() {
					
					stopLoop();
				});x
			}
		});*/
		
		carouselContainer.find('.legal-label, .service-list-label, .legal-text, .service-list-text, .link-cover, .button.big').each(function() { // start carousel when legal note label or service-list label or slide frame is closed
			
			var el = $(this);
			
			if ($(window).width() > 768) {
				//if (el.hasClass('legal-text')) {
					el.on('mouseenter.mpl.carousel-stop focusin.mpl.carousel', function() {
						
						stopLoop();
					});
				//}
				if (el.hasClass('legal-text') || el.hasClass('service-list-text')) {
					el.find('.close').on('click.mpl.carousel-start keydown.mpl.carousel-start', function(e) {
						
						if (rotate) { // if autorotation on
							startLoop();
							countTimeout();	// start rotation
							
							if (e.type === 'keydown' && e.keyCode === 13) {	//ENTER is pressed
								tabs.children().eq(0).focus();
							}
						}
					});
				}
				el.on('mouseleave.mpl.carousel-start focusout.mpl.carousel', function() {
					
					if (rotate) { // if autorotation on
						startLoop();
						countTimeout();	//start rotation with the same slide
					}
				});
			}
		});
	} // end initialize
	
	$(function() {
		
		init();
	});
})(ICApps.MAIN_BANNER_CAROUSEL); // end ICApps.MAIN_BANNER_CAROUSEL