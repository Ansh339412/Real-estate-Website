// Clickjacking defence for hosts that cannot send X-Frame-Options / frame-ancestors (e.g. GitHub Pages).
// index.html hides the page until this runs; it is revealed only when the site is not inside another page.
(function () {
  if (window.self === window.top) {
    var s = document.getElementById('antiClickjack');
    if (s && s.parentNode) s.parentNode.removeChild(s);
  } else {
    window.top.location = window.self.location;
  }
})();
