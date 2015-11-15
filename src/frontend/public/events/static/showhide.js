/**
 * Takes an element id. This function does nothing if the element
 * does not exist or if the browser does not support JS:DOM. 
 * 
 * Notes:
 *    1. Block element restricture removed
 *    2. Hiding an element will recalculate document flow to account
 *       for the removal of the element from the rendering pipeline.
 *    3. This script replaces an older version which was using
 *       deprecated JS browser detects.
 *
 * --Josh K
 *
 */

// traverse the dom out to the tr and show it
function show_element_row(element_id) {
    var row = find_element_row(document.getElementById(element_id));
    if (!row) return;
    
    row.style.display = '';
    row.style.visibility = 'visible';
}

function hide_element_row(element_id) {
    var row = find_element_row(document.getElementById(element_id));
    if (!row) return;
    
    row.style.display = 'none';
    row.style.visibility = 'hidden';
}

function find_element_row(element) {
    return YAHOO.util.Dom.getAncestorByTagName(element, "tr");
}

/* 
 * shows an element
 *
 * elem - id of element to show
 */

function show(elem, displayMode) {
    if (!document.getElementById) return;
    
    var e = document.getElementById(elem);
    displayMode = displayMode || 'block';

    if (!e) return;

    e.style.display = displayMode;
    e.style.visibility = 'visible';
}

/* 
 * hides an element
 *
 * elem - id of element to show
 */

function hide(elem) {
    if (!document.getElementById) return;

    var e = document.getElementById(elem);

    if (!e) return;

    e.style.display = 'none';
    e.style.visibility = 'hidden';
}


/* 
 * shows or hides an element depending on the currect display value
 *	added by CN
 *
 * elem - id of element to show
 */

function toggle_show_hide(elem)
{
    if (!document.getElementById) return;

    var e = document.getElementById(elem);

    if (!e) return;

    if (e.style.display == 'none')
    {
    	show(elem) ;
    }
    else
    {
    	hide(elem) ;
    }
}
