// Scroll Top
$('.top').click(function() {
  $('html, body').stop().animate({scrollTop: 0}, 'slow', 'swing');
});
$(window).scroll(function() {
  if ($(this).scrollTop() > $(window).height()) {
    $('.top').addClass("up");
  } else {
    $('.top').removeClass("up");
  }
});

// This is the important part!
var busy = false

function collapseSection(element) {
  // get the height of the element's inner content, regardless of its actual size
  var sectionHeight = element.scrollHeight;

  // temporarily disable all css transitions
  var elementTransition = element.style.transition;
  element.style.transition = '';

  // on the next frame (as soon as the previous style change has taken effect),
  // explicitly set the element's height to its current pixel height, so we
  // aren't transitioning out of 'auto'
  requestAnimationFrame(function() {
    element.style.height = sectionHeight + 'px';
    element.style.transition = elementTransition;

    // on the next frame (as soon as the previous style change has taken effect),
    // have the element transition to height: 0
    requestAnimationFrame(function() {
      element.style.height = '0px';
    });
  });

  // mark the section as "currently collapsed"
  element.setAttribute('data-collapsed', 'true');
}

function expandSection(element) {
  // get the height of the element's inner content, regardless of its actual size
  var sectionHeight = element.scrollHeight;
  sectionHeight += 20

  // have the element transition to the height of its inner content
  element.style.height = sectionHeight + 'px';

  // when the next css transition finishes (which should be the one we just triggered)
  element.addEventListener('transitionend', function(e) {
    // remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', arguments.callee);

  });

  // mark the section as "currently not collapsed"
  element.setAttribute('data-collapsed', 'false');
}

if($("#menu_anchor").length != 0) {
  document.querySelector('#menu_anchor').addEventListener('click', function(e) {
    if(!busy){
      var section = document.querySelector('.responsive_menu');
      var isCollapsed = section.getAttribute('data-collapsed') === 'true';
      var icon = document.getElementById("line_icon");

      busy = true;
      if(isCollapsed) {
        icon.style.color = "#C0334A";
        var x = document.getElementById("responsive_menu_id");
        x.className += " responsive";
        expandSection(section)
        section.setAttribute('data-collapsed', 'false')


      } else {
        icon.style.color = "white";
        collapseSection(section)
      }
      busy = false;
    }

  });
}


/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
// function myFunction() {
//   var x = document.getElementById("responsive_menu_id");
//   var y = document.getElementById("line_icon");
//   if (x.className === "responsive_menu") {
//     x.className += " responsive";
//     y.style.color = "#C0334A";
//   } else {
//     x.className = "responsive_menu";
//     y.style.color = "white"
//   }
// }
