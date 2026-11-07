/*!
 * mBank, pm.js :: 22/09/2016 @ pp
 * Copyright (C) Quercus, https://qrqs.eu
 */
/*
 * v. 1.2.0 @ pp (24/07/19): poprawienie skryptu do wersji 2.9.15 PL (SKCZDEV-433)
 * v. 1.2.1 @ pp (28/01/20): poprawka dla tabletu: skrzynka dluzsza niz strona (SKCZDEV-470)
 * v. 1.2.2 @ pp (28/03/22): zablokowanie ustawiania ciasteczek (zamiast saveCookie jest verifyCookie) (SKCZDEV-596)
 * v. 1.2.3 @ pp (21/04/22): umozliwienie zalozenia ciastek po sprawdzeniu czy mozna (SKCZDEV-603)
 * v. 1.2.4 @ pp (26/03/24): poprawki zwiazane z aktualizacja biblioteki jQuery (MBANKITDEV-21)
 * v. 1.3.0 @ pp (09/04/25): zmiany WCAG: dodana obsluga klawiatury (SKCZDEV-778)
 */
'use strict';
if (typeof ICApps == 'undefined')
	ICApps = {fake:true};

ICApps.PM = new function() {

	if (ICApps.fake) {
		var mes = '\'pm.js\' - brak skryptu \'scripts.js\'!';
		return typeof console == 'object' ? console.log(mes) : '';
	}
	var self = this,
		version = 'v. 1.3.0 CZ (2.9.15 PL) :: r. 12/05/25 @ pp',
		scriptType = 'prod',
		win = window,
		parent = ICApps,
		offline = parent.offline,
		ww = null,	//window (screen) width (set in 'updateWinDimm')
		wh = null,	//window (screen) height (set in 'updateWinDimm')
		mBox = null,	//messages box (popup)
		pMLink = null,	//push-message icon link
		overlay = null,	//dark background (when messages box is shown)
		mesHeads = null,	//messages headings (h5)
		opened = false,	//if push-messages popup in visible
		touched = false,	//if push-messages popup in visible and touch event was inited (mobile)
		posyMax = 110,	//maximum top position of push-messages box (popup)
		touchObj = {	//object to keep informations about touch events
			evt			: false,	//if touch event is on
			pos			: -1	//vertical position of window scroll after ending touch event
		},
		sections = ['ind', 'biz', 'other'],	//section classes
		section = null,	//section we are currently in
		clientCookie = null,	//client cookie (set on logout page)
		clientTypeCookie = null,	//client type cookie (set on logout page)
		firstRun = 1,	//if function 'initMessageBox' is running for the first time
		toolTipZIndex = $('#tooltip').css('z-index');

	this.inited = false;	//indicates that object has been inited
	this.numberOfMessages = 0;	//number of not read messages in push-message-box

	this.getVersion = function() {
		return version + ' ' + scriptType;
	};

	this.autoInit = true;	//automatical initialization on DOMContentLoaded

	this.COOKIE = {
		'push-message'		: '__mcz-pmd',	//cookie set on push-message-box closing
		'antichurn-popup'	: '__mcz-npd',	//cookie set on antichurn popup closing
		'client'			: '__mcz-lg',	//client cookie (to read if user is a client and set after clicking client link, set on logout page)
		'client-type'		: '__mcz-lgt'	//client-type (to read what type of a client user is, set on logout page)
	};

	var loadStyles = function() {

		parent.loadStyles('push-message.css');
	}();
	
	var updateWinDimm = function() {

		ww = $(win).width();
		wh = $(win).height();
	};

	/*
	 * function to toggle display and visibility of push-message box (if have to calculate position or dimensions box has to be displayed)
	 */
	var togglePMBox = function(show) {

		mBox.toggle(show).css('visibility', (show ? 'hidden' : 'visible'));
	};

	/*
	 * function to calculate messages box position
	 */
	var setMBoxPos = function() {

		if (ww > 600) {
			if (!opened) {
				togglePMBox(true);
			}
			var posx = Math.round($(win).scrollLeft() + (ww * .5) - 300);
			var posy = Math.round($(win).scrollTop() + ($(win).height() * .5) - (mBox.outerHeight() / 2));

			if (posy < 0) {
				posy = 0;
			}
			if (posy > posyMax) {
				posy = posyMax;
			}
			if (!opened) {
				togglePMBox(false);
			}
			mBox.css({'top' : posy, 'left' : posx});
		}
		else {
			if (opened) {
				mBox.css({'top' : 0, 'left' : 0});
			}
		}
		if (opened) {
			if (ww <= 768) {
				$(win).scrollTop(0);	//have to set push-message-box at scroll top and on closing it have to scroll back (remembered last window scroll position: touchObj['pos']) on mobiles
			}
		}
	};
	
	/*
	 * function to calculate page scroll
	 */
	var setPageScroll = function() {
		
		if (ww < 640 && Utils.UA.browser == 'Firefox') {	//on mobile devices only and in FF browser (new Chrome doesn't support scroll change)
			if (opened) {
				var h = mBox.outerHeight() + (mBox.attr('id').indexOf('push') == 0 ? 255 : 0);

				if (h < wh) {
					h = wh;
				}
				$('body').css({'overflow' : 'hidden', 'height' : h});	//restrict page scroll to messages box height + legal note height (or window height)
			}
			else {
				$('body').css({'overflow' : 'initial', 'height' : '100%'});	//set normal page scroll
			}
		}
	};
	
	/*
	 * function to set message heading (h5) margin: on mobile devices (< 360) heading should be centered vertically on message picture
	 */
	var setHeadMargins = function() {

		if (!opened) {
			togglePMBox(true);
		}
		mesHeads.each(function(i) {
			var t = $(this), h = t.parent().siblings('.img').outerHeight(), th = t.outerHeight();

			if (th < h) {
				if (ww <= 360) {
					t.css('margin-top', Math.round((h - th) / 2));	//heading is vertically centered on picture
				}
				else {
					$(this).removeAttr('style');	//style attribute has to be removed (i.e. view changing)
				}
			}
			else {
				$(this).removeAttr('style');	//style attribute has to be removed (i.e. view changing)
			}
		});
		if (!opened) {
			togglePMBox(false);
		}
	};

	var initMessageBox = function() {

		updateWinDimm();

		var bodyClass,	//CSS classes in <body> (section we are in)
			blocked = ['no-pm'];	//classes on pages without push-messsage

		mBox.on('touchstart.mcz.message-box', function() {	//on mobile: after opening push-message-box and initialization of touch event have to set 'touched' flag
			
			touched = true;
		});
		
		if (firstRun) {
			firstRun = 0;
			clientCookie = Utils.readCookie(self.COOKIE['client']), 
			clientTypeCookie = Utils.readCookie(self.COOKIE['client-type']);
			bodyClass = $('body').attr('class');
			overlay = $('#overlay');

			for (var j = 0; j < blocked.length; j++) {
				if (bodyClass.indexOf(blocked[j]) >= 0) {
					section = 'other';
					break;
				}
			}
			if (!section) {	//section is defined so it's not blocked page
				section = $('body').attr('data-pm');
				//for (var i = 0; i < sections.length; i++) {
				//	if (bodyClass.indexOf(sections[i]) >= 0) {
				//		section = sections[i];
				//		break;
				//	}
				//}
			}
			//if (!section) {
			//	section = 'other';
			//}
			$(win)
				.on('resize.mcz.message-box', function() {	//on window resize have to update states

					if (!touchObj['evt'] && !touched) {	//on mobiles window size can vary during swipe
						updateWinDimm();
						//on view change have to again set margins with 'setHeadMargins' function (delete style if needed),
						//push-message-box position (setMBoxPos) and window scroll (setPageScroll)

						if (mesHeads && mesHeads[0]) {	//have to check if headers exists (push-message-box is on)
							setHeadMargins();
						}
						setMBoxPos();
						setPageScroll();
					}
				})
				.on('touchstart.mcz.message-box', function() {	//have to change state of the event in touch object
					
					touchObj['evt'] = true;
				})
				.on('touchend.mcz.message-box', function() {

					if (!opened) {	//if push-message is still closed ('opened' flag = false) have to save last scroll position right before push-message opening
						setTimeout(function() {
							
							touchObj['evt'] = false;	//have to change state of touch event after scroll stops (swipe)
							touchObj['pos'] = $(win).scrollTop();	//remembering last scroll position after scroll stops (swipe)
						}, 500);
					}
					else {
						touchObj['evt'] = false;	//if push-message-box is closed we can change touch state immidiately
					}
				})
				.on('orientationchange.mcz.message-box', function() {
					
					touched = false;	//if screen orientation changes (portrait, landscape) have to reset 'touched' flag
				});
		}
	};

	var closeMessageBox = function(e, elm, focus) {
		
		e.preventDefault();
		elm.closest('.message-box').fadeOut(self.animSpeed, function() {
			
			$(this).attr('aria-hidden', true);
			
			if (focus && focus.length) {
				focus[0].focus();
			}
		});
		overlay.fadeOut(self.animSpeed);
		opened = false;	//on closing have to update (reset) 'opened' state
		touched = false;	//on closing have to update (reset) 'touched' state
		setPageScroll();	//after closing messages box we must recalculate page height

		if (touchObj['pos'] != -1) {
			$(win).scrollTop(touchObj['pos']);
			touchObj['pos'] = -1;
		}
	};

	var setCurrentTime = function() {
		
		return Math.floor(parseInt($('body').attr('data-time'), 10) / 60);    //setting timestamp in minutes and 'data-time' attribute is in seconds so it must be divided by 60
	};

	var initPopup = function() {
		
		function setPopupCookie() {
			
			Utils.verifyCookie(self.COOKIE['antichurn-popup'], setCurrentTime(), 60, 'marketing analytics', true);	// set after verifing consent
			//Utils.saveCookie(self.COOKIE['antichurn-popup'], setCurrentTime(), 60); // 60 days
		}

		mBox = $('#antichurn-popup');

		if (!mBox[0]) {
			initPushMessage();	//if there's no survey popup (antichurn) then we have to initialize push-message
			return;
		}
		if ($('body').hasClass('antichurn-popup')) {	//if <body> has 'antichurn-popup' CSS class the popup will be shown
			initMessageBox();	//initializing universal variables (for both message boxes: popup and push-message)
			var cDate = Utils.readCookie(self.COOKIE['antichurn-popup']);
			var gap = scriptType == 'dev' ? 15 : 86400;

			if (!clientCookie && (!cDate || setCurrentTime() - cDate >= gap)) {	//difference between current time and last closing popup time must be more than 1 min (dev) (or 60 days (prod))
				mBox.addClass(section);	//adding current section CSS class
				opened = true;	//message-box is displayed
				setMBoxPos();	//setting popup position on screen (different on desktop and mobiles)
				setPageScroll();	//after opening messages box have to restrict page scroll (on mobiles)

				if (!overlay[0]) {
					overlay = $('<div id="overlay" style="display: none;" />');
				}
				$('body').append(overlay.fadeIn(self.animSpeed));
				mBox
					.css({'display' : 'none', 'visibility' : 'visible'})
					.fadeIn(self.animSpeed, function() {
						
						$(this).find('a.close').on('click.mcz.popup keydown.mcz.popup', function(e) {
							
							if (e.type === 'click' || (e.type === 'keydown' && e.keyCode === 13/*ENTER*/)) {	//keyboard control added for WCAG
								closeMessageBox(e, $(this));	//closing popup
								setPopupCookie();	//saving popup cookie (time of popup close)
								initPushMessage();	//init push-message-box
								$('#tooltip').css('z-index', toolTipZIndex);
								return false;
							}
						});
						
						$(this).find('a.client').on('click.mcz.popup keydown.mcz.popup', function(e) {
							
							if (e.type === 'click' || (e.type === 'keydown' && e.keyCode === 13/*ENTER*/)) {	//keyboard control added for WCAG
								closeMessageBox(e, $(this));	//closing popup
								setPopupCookie();	//saving popup cookie (time of popup close)
								initPushMessage();	//init push-message-box
								$('#tooltip').css('z-index', toolTipZIndex);
								return false;
							}
						});
					});
			}
			else {
				initPushMessage();
			}
		}
		else {
			initPushMessage();
		}
	};
	
	var initPushMessage = function() {
		
		pMLink = $('#push-message a');

		if (!pMLink[0] || pMLink.is(':hidden'))
			return;
		
		mBox = $('#push-message-box');
		
		if (!mBox[0])	//if there is no push-message-box in DOM we have to leave
			return;

		initMessageBox();	//initializing universal variables (for both message boxes: popup and push-message)
		
		var cDate = Utils.readCookie(self.COOKIE['push-message']);
		var cDateArr = [], cDateNew = '';
		self.cDateClientInd = self.cDateClientBiz = '';
		self.cDateInd = self.cDateBiz = '';
		self.cDateOther = '';
		/*
		if (clientCookie && !clientTypeCookie) {	//if user is a client of any type he must be an individual type
			clientTypeCookie = 'u';
		}
		*/
		if (cDate) {
			cDateArr = cDate.split('|');
			cDate = '';	//have to clear this variable
			self.cDateClientInd = cDateArr[0];
			self.cDateClientBiz = cDateArr[1];
			self.cDateInd = cDateArr[2];
			self.cDateBiz = cDateArr[3];
			self.cDateOther = cDateArr[4];
		}
		// if (!section) {
			// section = 'other';
		// }
		if (section === sections[0]) {	//ind
			if (clientCookie) {	//any client
				mBox.find('.messages:not(.client.' + section + ')').remove();	//hide messages that are not for individual clients

				if (self.cDateClientInd) {//date of messages for individual clients
					cDate = self.cDateClientInd;
				}
				cDateNew = 'cDateClientInd';	//have to reset counter of messages for individual clients
			}
			else {
				mBox.find('.messages:not(.non-client.' + section + ')').remove();	//hide messages that are for clients and leave messages for non-clients in individual section

				if (self.cDateInd) {//date of messages for individual non-clients
					cDate = self.cDateInd;
				}
				cDateNew = 'cDateInd';	//have to reset counter of messages for individual non-clients
			}
		}
		else if (section === sections[1]) {	//biz
			if (clientCookie) {	//any client
				mBox.find('.messages:not(.client.' + section + ')').remove();	//hide messages that are not for business clients

				if (self.cDateClientBiz) {//date of messages for business clients
					cDate = self.cDateClientBiz;
				}
				cDateNew = 'cDateClientBiz';	//have to reset counter of messages for business clients
			}
			else {
				mBox.find('.messages:not(.non-client.' + section + ')').remove();	//hide messages that are for clients and leave messages for non-clients in business section

				if (self.cDateBiz) {//date of messages for business non-clients
					cDate = self.cDateBiz;
				}
				cDateNew = 'cDateBiz';	//have to reset counter of messages for business non-clients
			}
		}
		else if (section === sections[2]) {	//other
			//section = 'other';
			if (clientTypeCookie && (clientTypeCookie === 'u' || clientTypeCookie === 't')) {	//individual client
				section = sections[0];	//ind
				mBox.find('.messages:not(.client.' + section + ')').remove();	//hide messages that are not for individual clients
				
				if (self.cDateClientInd) {//date of messages for individual clients
					cDate = self.cDateClientInd;
				}
				cDateNew = 'cDateClientInd';	//have to reset counter of messages for individual clients
			}
			else if (clientTypeCookie && clientTypeCookie === 'f') {	//business client
				section = sections[1];	//biz
				mBox.find('.messages:not(.client.' + section + ')').remove();	//hide messages that are not for business clients

				if (self.cDateClientBiz) {//date of messages for business clients
					cDate = self.cDateClientBiz;
				}
				cDateNew = 'self.cDateClientBiz';	//have to reset counter of messages for business clients
			}
			else {
				mBox.find('.messages:not(.non-client.' + section + ')').remove();	//hide messages that are for clients and leave messages for non-clients in other offers section

				if (self.cDateOther) {//date of messages for non-section (other) non-clients
					cDate = self.cDateOther;
				}
				cDateNew = 'cDateOther';	//have to reset counter of messages for non-section (other) non-clients
			}
		}
		pMLink.siblings('span.count').remove();	//remove if any span (message counter) exist in push-message link (precaution)
		self.numberOfMessages = mBox.find('.message').length;	//actualizing message counter: all messages (for the section) in the box
		
		if (cDate) {
			mBox.find('.message > .message-date').each(function() {
				
				var date = $(this).text();
				date = $.trim(date.replace(/-/g, '/'));

				if (new Date(parseInt(cDate, 10) * 60000) > new Date(date)) {	//cDate is a timestamp in minutes so we have to multiply by 60000 (minute = 60 seconds * 1000 miliseconds)
					self.numberOfMessages--;
				}
			});
		}
		mBox
			.addClass(section)
			.css({
				'visibility': 'hidden',
				'display': 'block'
			})
			.prop('data-cookie', cDateNew)
			.find('.messages > p')
				.remove();
		
		if (self.numberOfMessages > 0) {	//if there are unread messages have to add updated messages counter & actualize ARIA label
			pMLink.parent().append('<span class="count" title="Nepřečtené zprávy">' + self.numberOfMessages + '</span>');
			var label = pMLink.attr('aria-label');
			pMLink.attr('aria-label', label + ' (Nepřečtené zprávy: ' + self.numberOfMessages + ')');
		}
		mesHeads = mBox.find('.message .text h5');	//need to find all messages headings (h5)
		mBox.find('.message .img img').each(function() {	//have to add additional wrapper element to image in order to zoom it on hover
			
			$(this).wrap('<div class="wrapper" />')
		});
		
		pMLink
			.on('click.mcz.messages keydown.mcz.messages', function(e) {
				
				e.preventDefault();
				
				if (e.type === 'click' || (e.type === 'keydown' && (e.keyCode === 13/*ENTER*/ || e.keyCode === 9/*TAB*/))) {
					if (e.keyCode === 9/*TAB*/) {
						if (parent.windowWidth > parent.Cnts['SCREEN']['rwd']) {
							var nextElm = !e.shiftKey ? ($('#cta-button:visible a:visible').length ? $('#cta-button:visible a:visible') : $('#log-in a:visible')) : $('#contact a:visible');
							nextElm[0].focus();
						}
						return;
					}
					if (opened) {
						return;
					}
					setHeadMargins();	//setting headings on mobiles
					opened = true;
					setMBoxPos();
					setPageScroll();	//after opening messages box have to restrict page scroll (on mobiles)
					
					$('#tooltip').css({
						'z-index': 100001,
						'visibility': 'hidden'
					});
	
					if (!overlay[0]) {
						overlay = $('<div id="overlay" style="display: none;" />');
					}
					$('body').append(overlay.fadeIn(self.animSpeed));
					mBox
						.attr('aria-hidden', false)
						.css({'display' : 'none', 'visibility' : 'visible'})
						.fadeIn(self.animSpeed, function() {
							
							self[mBox.prop('data-cookie')] = setCurrentTime();    //setting timestamp and actualizing time of read messages (of type saved in data-cookie property)
	
							var sName = self.COOKIE['push-message'],
								sData = self.cDateClientInd + '|' + self.cDateClientBiz + '|'  + self.cDateInd + '|' + self.cDateBiz +  '|' + self.cDateOther;
	
							Utils.verifyCookie(sName, sData, 365, 'marketing analytics', true);	//set after verifing consent
							//Utils.saveCookie(sName, sData, 365);
							pMLink.siblings('span.count').remove();	//remove message counter after reading (showing message box)
							//needed on legacy iPad (old safari) to lay note above messages
							/*mBox.find('.legal-note')
								.off()
								.on('click.mcz.pm', function() {
									
									$(this).parent().siblings().addBack().css('z-index', 'inherit');
									$(this).parent().css('z-index', 14);
								});*/
							
							if (parent.windowWidth <= 920) {
								if (mBox.height() > window.innerHeight) {
									mBox.css('bottom', 0);
								}
							}
							
							$(this).find('a.close')
								.off()
								.on('click.mcz.messages keydown.mcz.messages', function(e) {
									
									if (e.type === 'click' || (e.type === 'keydoown' && e.keyCode === 13/*ENTER*/)) {
										closeMessageBox(e, $(this), pMLink);	//closing push-message-box and setting focus on push-message button
										return false;
									}
									if (e.type === 'keydown' && e.which === 9/*TAB*/) {	//keyboard navigation
										e.preventDefault();
										
										if (!e.shiftKey) {	//forward
											mBox.find('a[data-first]')[0].focus();
										}
										else {	//go back
											mBox.find('a[data-last]')[0].focus();
										}
									}
								});
							
							var messages = $('.message:not(:hidden)'), mLen = messages.length;
							
							messages.find('a.more').each(function(i) {	//every visible message must have wrapper link, so we add one + adding offscreen info foe WCAG
								
								var message = $(this).parents('.message'), title = message.find('p.heading, h5, h6').text(), text = $(this).html(), offscreen = text.replaceAll(/<.+?>/g, '') + ' na téma: ' + title, onclick = $(this).attr('onclick');
								
								if (!message.children('.outer')[0]) {	//have to add wrapping link equal to 'more' link (immidiately before div.img for CSS)
									var t = $(this).attr('target'), target = (t ? ' target="' + t + '"' : '');	//target attribute of the link (new/same window)
									$('<a class="link-name outer" href="' + $(this).attr('href') + '"' + target + (onclick ? ' onclick="' + onclick + '"' : '') + '>' + offscreen + '</a>').insertBefore(message.find('.img'));
									//this <a> element switching to <span> element
									$(this).parent().append('<span class="more">' + text + '</span>');
									$(this).remove();
								}
								if (i === 0) {	//if it's first message have to add 'data-first' attribute
									message.children('.outer').eq(0).attr('data-first', true);
								}
								if (i === mLen - 1) {	//if it's last message have to add 'data-last' attribute
									message.children('.outer').eq(0).attr('data-last', true);
								}
							});
							
							messages.find('a.outer')
								.off()
								.on('keydown.mcz.message', function(e) {	//keyboard navigation
									
									if (e.which === 9/*TAB*/) {
										if ($(this).is('[data-last]') || $(this).is('[data-first]')) {
											e.preventDefault();
											
											var dir = $(this).is('[data-first]') && e.shiftKey || $(this).is('[data-last]') && !e.shiftKey;	//direcrion
											
											if (dir) {
												mBox.find('a.close')[0].focus();
											}
											else {
												$(this).closest('.message').next('.message').find('a.outer')[0].focus();
											}
										}
									}
								});
							
							self.numberOfMessages = 0;	//actualizing number of not read messages
							pMLink.attr('aria-label', 'Tipy mBank');	//actualizing ARIA label
							$(this).find('.message .outer').eq(0)[0].focus();
							return false;
						})
						.off()
						.on('keydown.mcz.push-message-box', function(e) {
							
							if (e.keyCode === 27/*ESC*/) {
								closeMessageBox(e, $(this), pMLink);	//closing push-message-box and setting focus on push-message button
							}
						});
				}
			})
			.on('touchstart.mcz.push-message', function() {	//we have to detect touch event on link and set 'opened' flag (the same as click event)
				
				//opened = true;
			});
	};

	this.init = function() {

		if (self.inited)
			return;

		self.inited = true;
		initPopup();
	};

	$(function() {

		if (self.autoInit)
			self.init();
	});
};