/*
 * angular-stickyThead
 * A pure Angular directive for making thead sticking to the top of the screen. No jQuery needed
 *
 * (c) 2015 Chambon Emmanuel
 * License:MIT
 */

(function () {
    'use strict';

    angular.module('angular-stickyThead', [])
        .directive('stickyThead', StickyTheadDirective);

    StickyTheadDirective.$inject = ['$window'];

    function StickyTheadDirective($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                if (elem[0].tagName != 'TABLE') {
                    throw new Error('sticky-thead must be run on a table element.');
                }

                var sticky = null,
                    theadHeight = elem.find('thead')[0].offsetHeight;

                function init() {
                    sticky = elem.clone();
                    sticky.find('tbody').remove();
                    sticky.removeAttr('sticky-thead');
                    sticky.css({
                        top: 0,
                        position: 'fixed',
                        display: 'none',
                        border: 'none'
                    });
                    elem.parent()[0].insertBefore(sticky[0], elem[0]);
                    onResize();
                    if ($window.scrollY > 0) {
                        onScroll();
                    }
                }

                function onResize() {
                    theadHeight = elem.find('thead')[0].offsetHeight;
                    angular.forEach(sticky.find("th"), function (value, index) {
                        var el = angular.element(sticky.find('th')[index]);
                        el.css("width", elem.find("th").eq(index)[0].offsetWidth + "px");
                    });
                }

                function onScroll() {
                    var offset = $window.scrollY;
                    var tableOffsetTop = elem[0].getBoundingClientRect().top + offset;
                    var tableOffsetBottom = tableOffsetTop + elem[0].offsetHeight - theadHeight;
                    if (offset < tableOffsetTop || offset > tableOffsetBottom) {
                        sticky.css('display', 'none');
                    } else if (offset >= tableOffsetTop && offset <= tableOffsetBottom && sticky.css('display') == 'none') {
                        sticky.css('display', 'block');
                    }
                }

                angular.element($window).bind("resize", onResize);
                angular.element($window).bind("scroll", onScroll);
                init();
            }
        };
    }

})();
