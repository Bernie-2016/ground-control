<script>
  jQuery(document).ready(function(event) {
    window.addEventListener('message', function(event) {
      if (event.data.message === "getHeight")
        event.source.postMessage({message: "documentHeight", details: {height: document.body.scrollHeight}}, event.origin);
      else if (event.data.message === "setInputValue")
        jQuery('#' + event.data.details.inputId).val(event.data.details.value)
      else if (event.data.message === "disableField")
        jQuery('#' + event.data.details.inputId).prop('disabled', true)
      else if (event.data.message === 'submit')
        jQuery('#signup').submit()
      else if (event.data.message === 'getFieldValues') {
        var fieldValues = {}
        jQuery('[gc-field-id]').each(function(i) {
          var input = jQuery(this)
          var key = input.attr('gc-field-id')
          var value = input.val()
          fieldValues[key] = value
        })
        event.source.postMessage({message: 'fieldValues', details: fieldValues}, event.origin);
      }
    })

    jQuery('.label .field').each(function(i, label) {
      var regex = /^(\[.*?\])/;
      var label = jQuery(this)
      var labelText = label.text()
      var matches = regex.exec(labelText);
      if (matches && matches[1])
      {
        var matchedTag = matches[1]
        label.text(labelText.replace(matchedTag, '').trim())
        var fieldId = matchedTag.substring(1, matchedTag.length-1)
        jQuery(this).parents('.fieldset').find('input').attr('gc-field-id', fieldId)
        jQuery(this).parents('.fieldset').find('input').attr('id', fieldId)
      }
    })
    window.top.postMessage({message: 'documentLoaded', details: {location: window.location.href}}, '*')
    jQuery('input[type=submit]').hide()

  });
</script>