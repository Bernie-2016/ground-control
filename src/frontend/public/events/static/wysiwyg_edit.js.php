wysiwygJqueryReference = typeof(bQuery) == "function" ? bQuery : jQuery;

wysiwygJqueryReference(find_and_wysiwygify_textareas);

// define a simplified toolbar for normal users
CKEDITOR.config.toolbar_BSDBasic =
[
    {name:'styles',     items:['FontSize','Format']},
    {name:'format',     items:['Bold','Italic','Underline','TextColor']},
    {name:'justify',    items:['JustifyLeft','JustifyCenter','JustifyRight']},
    {name:'blocks',     items:['BulletedList','NumberedList','Outdent','Indent','Blockquote']},
    {name:'extra',  items:['Link','Unlink','Anchor','Image','Flash']},
    {name:'extra2', items:['SpecialChar','Table','PasteFromWord','PasteText','RemoveFormat']},
    {name:'code',   items:['Source']}
];


// flashless toolbar for mailing-related wysiwyg
CKEDITOR.config.toolbar_BSDMailing =

[
    {name:'styles',     items:['FontSize','Format']},
    {name:'format',     items:['Bold','Italic','Underline','TextColor']},
    {name:'justify',    items:['JustifyLeft','JustifyCenter','JustifyRight']},
    {name:'blocks',     items:['BulletedList','NumberedList','Outdent','Indent','Blockquote']},
    {name:'extra',  items:['Link','Unlink','Anchor','Image']},
    {name:'extra2', items:['SpecialChar','Table','PasteFromWord','PasteText','RemoveFormat']},
    {name:'code',   items:['Source']}
];

CKEDITOR.config.toolbar_BSDUser = getToolArrayFromAllowedHtmlTags();

// use basic as the global default (can be overridden in specific cases)
CKEDITOR.config.toolbar = 'BSDBasic';

CKEDITOR.config.fontSize_sizes = '1 (8pt)/8px;2 (10pt)/10px;3 (12pt)/12px;4 (14pt)/14px;5 (18pt)/18px;6 (24pt)/24px;7 (36pt)/36px';

CKEDITOR.config.resize_dir = 'vertical';

// define an event to fire on dialog creation - all we're doing right now
// is changing the display order of the ok/cancel buttons
//  @see http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Dialog_Customization
CKEDITOR.on('dialogDefinition', function(ev) {
    // Take the dialog name and its definition from the event data.
    var dialogDefinition = ev.data.definition;
    dialogDefinition.buttons = [  CKEDITOR.dialog.cancelButton, CKEDITOR.dialog.okButton ];
});

// this is called after the page loads.  it scans the page for
// textareas and adds the 'Use WYSIWYG Editor >>' link
function find_and_wysiwygify_textareas() {
    wysiwygJqueryReference('textarea.wysiwyg-yes').each(function(){this.setAttribute('wysiwyg', 'yes')});
    wysiwygJqueryReference('textarea[wysiwyg=yes]').each(wysiwygify_textarea);
}

function wysiwygify_textarea () {
    if (this.getAttribute('wysiwyg') == 'yes') {
        // save state on the textrea (initialize so later checks work)
        this.setAttribute('wysiwyg_state', 'off');

        var id = this.id;
        if (!id) {
            this.id = this.name;
            id = this.name;
        }

        wysiwygJqueryReference(this).width('100%');

        // and toggle the area on
        if (this.getAttribute('wysiwyg_showbydefault') == 'yes' && wysiwygJqueryReference.cookie('html_editor') != 'off') {
            toggle_wysiwyg(id, true);
        } else {
            update_toggle_link(this);
        }
    }
}

function update_toggle_link(area) {
    wysiwygJqueryReference('.wysiwyg_allowed_tags').toggle();

    if (area.getAttribute('wysiwyg_showtoggle') == 'no') {
        return;
    }

    var link = document.getElementById('wysiwygedit-label-' + area.id);

    if (!link) {
        wysiwygJqueryReference(area).after('<div class="wysiwygeditlinkwrap"><a href="#" class="wysiwygeditlink" id="wysiwygedit-label-' + area.id + '" onclick="toggle_wysiwyg(\'' + area.id + '\');return false;"></a></div>');
        link = document.getElementById('wysiwygedit-label-' + area.id);

        if(area.getAttribute('wysiwyg_mode') != 'formbuilder'){
            // set the size of the link wrapper div to match the textarea
            var width = get_width_at_all_costs(area);
            link.parentNode.style.width = width;
        }
    }

    if (area.getAttribute('wysiwyg_state') == 'off') {
        link.innerHTML = "Turn <strong>on</strong> HTML Editor &raquo;";
        jQuery(link.parentNode).removeClass('bsd-editor-on');
        jQuery(link.parentNode).addClass('bsd-editor-off');

    } else {
        link.innerHTML = "&laquo; Turn <strong>off</strong> HTML Editor";
        jQuery(link.parentNode).removeClass('bsd-editor-off');
        jQuery(link.parentNode).addClass('bsd-editor-on');

    }
}

// this function is called to turn on or off the wysiwyg edit control
function toggle_wysiwyg(id, initializing) {
    var selector = "#" + id;

    // need to escape brackets for jquery
    selector = selector.replace(/\[/g, "\\[");
    selector = selector.replace(/\]/g, "\\]");

    var area = wysiwygJqueryReference(selector);
    if (!area || !area[0]) {
        return false;
    }

    area = area[0];

    if(!initializing){
        if (area.getAttribute('wysiwyg_state') == 'off'){
            wysiwygJqueryReference.cookie('html_editor', 'on');
        } else {
            wysiwygJqueryReference.cookie('html_editor', 'off');
        }
    }

    if (
        !initializing &&
        area.getAttribute('wysiwyg_state') == 'off' &&
        /\S/.test(area.value) && area.getAttribute('wysiwyg_mode') != 'formbuilder'
    ) {
        show_confirm_wysiwyg_toggle_dialog(area, selector);
    } else {
        finish_wysiwyg_toggle(area, selector);
    }
}

function show_confirm_wysiwyg_toggle_dialog(area, selector) {
    if (wysiwygJqueryReference.ui && wysiwygJqueryReference.ui.dialog) {
        var confirmationDialog = wysiwygJqueryReference(selector + ' + .wysiwygConfirmationDialog');

        if (!confirmationDialog.length) {
            confirmationDialog = wysiwygJqueryReference('<div class="wysiwygConfirmationDialog">Turning on the HTML editor may cause some of your content to be reformatted or lost. Do you want to continue?</div>');
            confirmationDialog.hide();
            wysiwygJqueryReference(selector).after(confirmationDialog);
            confirmationDialog.dialog({
                title: '<span class="ui-icon ui-icon-alert" style="float: left; margin-right: 16px"></span>Turn on HTML editor?',
                modal: true,
                autoOpen: false,
                buttons: {
                    'No': function() {
                        wysiwygJqueryReference(this).dialog('close');
                    },
                    'Yes': (function(area, selector) {
                        return function() {
                            wysiwygJqueryReference(this).dialog('close');
                            finish_wysiwyg_toggle(area, selector);
                        };
                    })(area, selector)
                }
            });
        }

        confirmationDialog.dialog('open');
    } else {
        if (confirm('Turning on the HTML editor may cause some of your content to be reformatted or lost. Do you want to continue?')) {
            finish_wysiwyg_toggle(area, selector);
        }
    }
}

function finish_wysiwyg_toggle(area, selector) {
    // match the width and height of the editing window to the width and height of the textarea
    var width = wysiwygJqueryReference(area).width();
    var height = wysiwygJqueryReference(area).height();


    if (area.getAttribute('wysiwyg_state') == 'off' && wysiwygJqueryReference.cookie('html_editor') != 'off') {
        // unless wysiwyg_expand is set to no, expand the textarea by 4 rows to accomodate controls
        if (area.getAttribute('wysiwyg_autoexpand') != 'no') {
            if (area.style.height) {
                height = area.style.height;

                var current_height = area.style.height;
                if (!current_height) {
                    current_height = area.offsetHeight;
                }

                area.setAttribute('wysiwyg_original_height', current_height);
                area.style.height = (parseInt(area.style.height) + (area.getAttribute('wysiwyg_mode') == 'simple' ? 25 : 75)) + "px";
            } else {
                area.rows += (area.getAttribute('wysiwyg_mode') == 'simple' ? 2 : 4);
            }
        }

        // turn on the wysiwyg editor
        area.setAttribute('wysiwyg_state', 'on');

        var settings = { width: width, height: height };

        if (area.getAttribute('wysiwyg_mode') == 'mailing') {
            settings.toolbar = 'BSDMailing';
        } else if (area.getAttribute('wysiwyg_mode') == 'user') {
            settings.toolbar = 'BSDUser';
        }

        if (area.getAttribute('wysiwyg_position') == 'top') {
            settings.toolbarLocation = 'top';
        }

        if(typeof CKFinder != "undefined") {
            settings.filebrowserBrowseUrl = '/ext/ckfinder/ckfinder.html';
        }


        // replace the textarea with a ckeditor
        wysiwygJqueryReference(selector).ckeditor(function() {}, settings);

    } else {
        // turn off the wysiwyg editor
        area.setAttribute('wysiwyg_state', 'off');

        // remove the ckeditor
        wysiwygJqueryReference(selector).ckeditor(function() { this.destroy(); });

        // unless wysiwyg_expand is set to no, contract the textarea by 4 rows
        if (area.getAttribute('wysiwyg_autoexpand') != 'no') {
            if (area.style.height) {
                area.style.height = area.getAttribute('wysiwyg_original_height');
            } else {
                area.rows -= (area.getAttribute('wysiwyg_mode') == 'simple' ? 2 : 4);
            }
        }
    }

    update_toggle_link(area);

    if (area.getAttribute('wysiwyg_state') == 'on') {
        return 'true';
    } else {
        return 'false';
    }
}

function find_mce_instance (form_element) {
    try {
        return wysiwygJqueryReference(form_element).ckeditorGet();
    } catch (e) {
        return null;
    }
}

function get_width_at_all_costs (element) {
    return wysiwygJqueryReference(element).width();
}

function get_wysiwyg_type() {
    return 'ckeditor';
}

function get_wysiwyg_data(form_element) {
    var inst = find_mce_instance(form_element);
    if (inst) {
        return inst.getData();
    }
    return null;
}

function getToolArrayFromAllowedHtmlTags() {
        var allowedTags = ['b', 'blockquote', 'br', 'i', 'p', 'u', 'strong', 'em', 'strike', 'h1', 'div', 'center'];
    var phraseTools = [];
    var blockTools = [];
    var allowLinks = false;
    var allowImages = false;
    var allowFlash = false;
    var allowTables = false;

    for (var i=0; i < allowedTags.length; i++) {
        switch (allowedTags[i]) {
        case 'strong':
            phraseTools.push('Bold');
            break;

        case 'em':
            phraseTools.push('Italic');
            break;

        case 'u':
            phraseTools.push('Underline');
            break;

        case 'strike':
            phraseTools.push('Strike');
            break;

        case 'sup':
            phraseTools.push('Superscript');
            break;

        case 'sub':
            phraseTools.push('Subscript');
            break;

        case 'blockquote':
            blockTools.push('Blockquote');
            break;

        case 'ol':
            blockTools.push('NumberedList');
            break;

        case 'ul':
            blockTools.push('BulletedList');
            break;

        case 'a':
            allowLinks = true;
            break;

        case 'img':
            allowImages = true;
            break;

        case 'object':
            allowFlash = true;
            break;

        case 'table':
            allowTables = true;
            break;
        }
    }

    return [phraseTools.concat(
        ['-'],
        blockTools,
        (allowLinks ? ['-', 'Link', 'Unlink'] : []),
        (allowImages ? ['-', 'Image'] : []),
        (allowFlash ? ['-', 'Flash'] : []),
        (allowTables ? ['-', 'Table'] : []),
        ['-','Undo','Cut','Copy','Paste', '-', 'SpecialChar', '-', 'Source']
    )];
}
