<script>
  jQuery(document).ready(function(event) {
    window.addEventListener('message', function(event) {
      if (event.data.message === "getHeight")
        event.source.postMessage({message: "documentHeight", details: {height: document.body.scrollHeight}}, event.origin);
      else if (event.data.message === "setInputValue")
        jQuery('#' + event.data.details.inputId).val(event.data.details.value)
      else if (event.data.message === 'submit')
        jQuery('#signup').submit()
    })
    window.top.postMessage({message: 'documentLoaded', details: {location: window.location.href}}, '*')
    jQuery('input[type=submit]').hide()
  });
</script>