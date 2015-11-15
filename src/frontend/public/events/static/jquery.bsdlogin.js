(function( $ ) {

 function loadCss() {
    if ( skinLoginCss != '' && window.bsdLoginCssLoaded != true ) {
        $.ajax({
            url: skinLoginCss,
            success: function( data ) {

                // IE8 is silly.
                $('head').append( '<style type="text/css">' + data + '</style>' );
                window.bsdLoginCssLoaded = true;
            }
        });
    }
 };

 $.bsdLoginLoadCss = loadCss;

 $.fn.bsdLogin = function(options) {

	 var defaults = {
		activeIndex: 0,
        description: 'Please log in below.'
	 };

    if ( options ) {    
	    var options = $.extend(defaults, options);
    }

	return this.each(function() {
        var elem = $(this);
		var tabs = elem.find('ul.login-tabs').children().children();
		var contents = elem.find('div.login-content').children();
        var loginDescription = elem.find('.login-description');
        var registerLink = elem.find('.login-register-link');
        var loginLink = elem.find('.login-login-link');
        var loginTabs = elem.find('.login-tabs');
        var registerForm = elem.find('.login-register-form');
		var activeIndex = defaults.activeIndex;

        if ( activeIndex == 'default' ) activeIndex = 0;
        if ( activeIndex == 'facebook' ) activeIndex = 1;
        if ( activeIndex == 'externalbsd' ) activeIndex = 2;

        /* Add the stylesheet, if not added already */
        loadCss();

        loginDescription.html( $('<p>').text(options['description']) );

        registerLink.show();
        registerForm.hide();
        loginLink.show();
		
        if ( contents.length <= 1 ) {
            activeIndex = 0;
            elem.find('.login-tabs').hide();
        }
        else {
            loginTabs.show();
        }

        contents.hide();
		$(contents[activeIndex]).addClass("activeContent").show();
		$(tabs[activeIndex]).addClass("activeTab");

		/* Event Bindings */
		loginTabs.find('a', elem).click(function(e) {
            e.preventDefault();
			if ( !$(this).parent().hasClass("activeTab") ) {
                $(tabs[activeIndex]).removeClass('activeTab');
                $(contents[activeIndex]).removeClass('activeContent').hide();
				activeIndex = $(this).parent().prevAll().length;
                $(tabs[activeIndex]).addClass('activeTab');
                $(contents[activeIndex]).addClass('activeContent').show();
			}
		});

        registerLink.click( function(e) {
            e.preventDefault();
            elem.find('.login-register-form').show();
            elem.find('.login-login-form').hide();
        });

        loginLink.click( function(e) {
            e.preventDefault();
            elem.find('.login-register-form').hide();
            elem.find('.login-login-form').show();
        });

        if ( BsdDisplay != 'page' ) {
            elem.find('.login-external-1-button').click( function(e) {

                // assume it's 'popup'

                e.preventDefault();
                window.bsdLoginPopup = window.open(
                    BsdAuthUri + '?state=popup',
                    'bsdLogin',
                    'width='+BsdWindowWidth+',height='+BsdWindowHeight );
            });
        }

        if ( FacebookDisplay != 'page' && typeof FacebookAppId !== 'undefined' ) {
 
           FB.init({ 
                appId: FacebookAppId,
                cookie: true,
                status: true,
                xfbml: true
            });

            elem.find('.login-facebook-button').click( function(e) {
                e.preventDefault();
                FB.ui(
                    {
                        method: 'oauth',
                        display: FacebookDisplay,
                        client_id: FacebookAppId,
                        redirect_uri: FacebookRedirectUri,
                        scope: FacebookScope
                    },
                    function(response) {
                        console.log(response); 
                    }
                );
            });
        }
	 });
 };
})(jQuery);  

