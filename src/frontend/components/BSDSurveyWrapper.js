<script>
  jQuery(document).ready(function(event) {
    window.addEventListener('message', function(event) {
      if (event.data === "getHeight")
        event.source.postMessage({call: "getHeight", response: document.body.scrollHeight}, event.origin);
    })
    window.top.postMessage({message: 'loaded', location: window.location.href}, '*')
  });
</script>