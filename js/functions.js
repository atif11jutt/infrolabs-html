/**

 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * https://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	function extend(a, b) {
		for(var key in b) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function createDOMEl(type, className, content) {
		var el = document.createElement(type);
		el.className = className || '';
		el.innerHTML = content || '';
		return el;
	}

	/**
	 * RevealFx obj.
	 */
	function RevealFx(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	/**
	 * RevealFx options.
	 */
	RevealFx.prototype.options = {
		// If true, then the content will be hidden until it´s "revealed".
		isContentHidden: true,
		// The animation/reveal settings. This can be set initially or passed when calling the reveal method.
		revealSettings: {
			// Animation direction: left right (lr) || right left (rl) || top bottom (tb) || bottom top (bt).
			direction: 'lr',
			// Revealer´s background color.
			bgcolor: '#f0f0f0',
			// Animation speed. This is the speed to "cover" and also "uncover" the element (seperately, not the total time).
			duration: 500,
			// Animation easing. This is the easing to "cover" and also "uncover" the element.
			easing: 'easeInOutQuint',
			// percentage-based value representing how much of the area should be left covered.
			coverArea: 0,
			// Callback for when the revealer is covering the element (halfway through of the whole animation).
			onCover: function(contentEl, revealerEl) { return false; },
			// Callback for when the animation starts (animation start).
			onStart: function(contentEl, revealerEl) { return false; },
			// Callback for when the revealer has completed uncovering (animation end).
			onComplete: function(contentEl, revealerEl) { return false; }
		}
	};

	/**
	 * Init.
	 */
	RevealFx.prototype._init = function() {
		this._layout();
	};

	/**
	 * Build the necessary structure.
	 */
	RevealFx.prototype._layout = function() {
		var position = 'relative';
		if( position !== 'fixed' && position !== 'absolute' && position !== 'relative' ) {
			this.el.style.position = 'relative';
		}
		// Content element.
        var newText;
        if(this.el.dataset.text){
//            console.log("data is here")
            newText = this.el.dataset.text
        }else{
//            console.log("first time")
            newText = this.el.innerText;
            this.el.dataset.text = this.el.innerText;
        }
        
		this.content = createDOMEl('div', 'block-revealer__content', newText);
		if( this.options.isContentHidden) {
			this.content.style.opacity = 0;
		}
		// Revealer element (the one that animates)
		this.revealer = createDOMEl('div', 'block-revealer__element');
		this.el.classList.add('block-revealer');
        
		this.el.innerHTML = '';
		this.el.appendChild(this.content);
		this.el.appendChild(this.revealer);
	};

	/**
	 * Gets the revealer element´s transform and transform origin.
	 */
	RevealFx.prototype._getTransformSettings = function(direction) {
		var val, origin, origin_2;

		switch (direction) {
			case 'lr' : 
				val = 'scale3d(0,1,1)';
				origin = '0 50%';
				origin_2 = '100% 50%';
				break;
			case 'rl' : 
				val = 'scale3d(0,1,1)';
				origin = '100% 50%';
				origin_2 = '0 50%';
				break;
			case 'tb' : 
				val = 'scale3d(1,0,1)';
				origin = '50% 0';
				origin_2 = '50% 100%';
				break;
			case 'bt' : 
				val = 'scale3d(1,0,1)';
				origin = '50% 100%';
				origin_2 = '50% 0';
				break;
			default : 
				val = 'scale3d(0,1,1)';
				origin = '0 50%';
				origin_2 = '100% 50%';
				break;
		};

		return {
			// transform value.
			val: val,
			// initial and halfway/final transform origin.
			origin: {initial: origin, halfway: origin_2},
		};
	};

	/**
	 * Reveal animation. If revealSettings is passed, then it will overwrite the options.revealSettings.
	 */
	RevealFx.prototype.reveal = function(revealSettings) {
		// Do nothing if currently animating.
		if( this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;
		
		// Set the revealer element´s transform and transform origin.
		var defaults = { // In case revealSettings is incomplete, its properties deafault to:
				duration: 500,
				easing: 'easeInOutQuint',
				delay: 0,
				bgcolor: '#f0f0f0',
				direction: 'lr',
				coverArea: 0
			},
			revealSettings = revealSettings || this.options.revealSettings,
			direction = revealSettings.direction || defaults.direction,
			transformSettings = this._getTransformSettings(direction);

		this.revealer.style.WebkitTransform = this.revealer.style.transform =  transformSettings.val;
		this.revealer.style.WebkitTransformOrigin = this.revealer.style.transformOrigin =  transformSettings.origin.initial;
		
		// Set the Revealer´s background color.
		this.revealer.style.backgroundColor = revealSettings.bgcolor || defaults.bgcolor;
		
		// Show it. By default the revealer element has opacity = 0 (CSS).
		this.revealer.style.opacity = 1;

		// Animate it.
		var self = this,
			// Second animation step.
			animationSettings_2 = {
				complete: function() {
					self.isAnimating = false;
					if( typeof revealSettings.onComplete === 'function' ) {
						revealSettings.onComplete(self.content, self.revealer);
					}
				}
			},
			// First animation step.
			animationSettings = {
				delay: revealSettings.delay || defaults.delay,
				complete: function() {
					self.revealer.style.WebkitTransformOrigin = self.revealer.style.transformOrigin = transformSettings.origin.halfway;		
					if( typeof revealSettings.onCover === 'function' ) {
						revealSettings.onCover(self.content, self.revealer);
					}
					anime(animationSettings_2);		
				}
			};

		animationSettings.targets = animationSettings_2.targets = this.revealer;
		animationSettings.duration = animationSettings_2.duration = revealSettings.duration || defaults.duration;
		animationSettings.easing = animationSettings_2.easing = revealSettings.easing || defaults.easing;

		var coverArea = revealSettings.coverArea || defaults.coverArea;
		if( direction === 'lr' || direction === 'rl' ) {
			animationSettings.scaleX = [0,1];
			animationSettings_2.scaleX = [1,coverArea/100];
		}
		else {
			animationSettings.scaleY = [0,1];
			animationSettings_2.scaleY = [1,coverArea/100];
		}

		if( typeof revealSettings.onStart === 'function' ) {
			revealSettings.onStart(self.content, self.revealer);
		}
		anime(animationSettings);
	};
	
	window.RevealFx = RevealFx;

})(window);





var $color = '#ffffff';

function animateText(){
    var elms = document.querySelectorAll('.animate_box');


elms.forEach(function(elm){
    var newDelay;
    if($(elm).data("delay")){
        newDelay = $(elm).data("delay");
    }else{
        newDelay = 0;
    }
    var rev = new RevealFx(elm, {
        revealSettings : {
            bgcolor: $color,
            delay: newDelay,
            onCover: function(contentEl, revealerEl) {
                contentEl.style.opacity = 1;
            }
        }
    });
    rev.reveal()
})
}


    




jQuery(function ($) {
    //    start javascript code
    animateText()
    $("#open-nav .open-nav-btn").on('click', function () {
        $(".sidenav-cont").toggleClass("active");
    })
    
    $(document).keyup(function(e) {
            if (e.keyCode === 27) { // escape key maps to keycode `27`
                $(".sidenav-cont").toggleClass("active");
            }
        });


    $(document).ready(function () {
    setTimeout(function(){
        $("#pageLoader").addClass("hidden")
        setTimeout(function(){
            $(".show-onload .custom-class").each(function(){
                    var tempClass = $(this).data("class");
                    $(this).addClass(tempClass).css("visibility", "visible")
                })
        },700)
    },500)
});


				

    if($('#pagepiling').length){
        $('#pagepiling').pagepiling({
            onLeave: function(index, nextIndex, direction){
                if(direction == "up" && nextIndex == 1){
                    $("#pp-nav").removeClass("show");
                }
                --nextIndex;
                $(".section").eq(nextIndex).find(".block-revealer .block-revealer__content").css("opacity", 0)
//                console.log($(".section").eq(nextIndex).find(".block-revealer .block-revealer__content"))
//                $(".custom-class").addClass("hide-vb")
            },
            afterLoad: function(anchorLink, index){
                if($(".text-shadow").hasClass("active")){
                    $("#pp-nav").addClass("show");
                }else{
                    $("#pp-nav").removeClass("show");
                }
                if($(".hide-pp-nav").hasClass("active")){
                    $("#pp-nav").addClass("pp-hide");
                }else{
                    $("#pp-nav").removeClass("pp-hide");
                }

                if($(".sidenave-dark").hasClass("active")){
                    $("#open-nav").addClass("dark");
                }else{
                    $("#open-nav").removeClass("dark");
                }
                
                $(".section .custom-class").each(function(){
                    var tempClass = $(this).data("class");
                    $(this).removeClass(tempClass).css("visibility", "hidden")
                })
                
                $(".section.active .custom-class").each(function(){
                    var tempClass = $(this).data("class");
                    $(this).addClass(tempClass).css("visibility", "visible")
                })
                
                
                $(".block-revealer .block-revealer__content").css("opacity", 0)
                $(".custom-opacity").css("opacity", 1)
                //animation start
                animateText()


            },
            scrollBar:true
        });
    }
    
    
    if($('.autogrow').length){
        $('.autogrow').autogrow({vertical: true, horizontal: false});
    }
    
    
    
    $(".custom-pp").click(function(e){
        e.preventDefault();
        var sectionId = $(this).data("id");
        $("#pp-nav > ul li").eq(sectionId).children().click();
    })
    
    
    
    
    
    let wow = new WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true
    });
    wow.init();
    
    
    if($(".owl-slider").length){
        $('.slider.owl-slider').owlCarousel({
            items: 1,
            singleItem:true,
            nav: true,
            dots: false,
            loop: true,
            autoPlay: 3000
        });
    }
    
    $("a.scroll").on("click", function (event) {
        event.preventDefault();
        let action = $(this.hash).offset().top;
        $("html,body").animate({
            scrollTop: action
        }, 1200);
    });
    

    
    
    
//    end of javascript code
})
