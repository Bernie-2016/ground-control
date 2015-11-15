/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
  // Define changes to default configuration here. For example:
  // config.language = 'fr';
  // config.uiColor = '#AADC6E';
  //load a different ckeditor skin for formbuilder
  var path = window.location.pathname;
  if(path.indexOf('FormBuilder') != -1 || path.indexOf('Cards') != -1){
      config.skin = 'bsdformbuilder';
      config.toolbarCanCollapse = false;
      config.extraPlugins = 'confighelper';
  } else{
      config.skin = 'bsd';
  }
};
