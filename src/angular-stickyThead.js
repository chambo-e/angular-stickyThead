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

    StickyTheadDirective.$inject = ['$window', '$timeout'];

    function StickyTheadDirective($window, $timeout) {
        return {
            restrict: 'A',
            scope: {
                zindex: '='
            },
            link: function (scope, elem) {
                if (elem[0].tagName !== 'TABLE') {
                    throw new Error('sticky-thead must be run on a table element.');
                }

                var zindex = scope.zindex || 1001;

                var sticky = null,
                    theadHeight = elem.find('thead')[0].offsetHeight;

                function init() {
                    $timeout(function () {
                        sticky = elem.clone();
                        sticky.find('tbody').remove();
                        sticky.find('tfoot').remove();
                        sticky.removeAttr('sticky-thead');
                        sticky.css({
                            'z-index': zindex,
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
                    });
                }

                function onResize() {
                    theadHeight = elem.find('thead')[0].offsetHeight;
                    angular.forEach(sticky.find('th'), function (value, index) {
                        var el = angular.element(sticky.find('th')[index]);
                        el.css('width', elem.find('th').eq(index)[0].offsetWidth + 'px');
                    });
                }

                function onScroll() {
                    var off = $window.scrollY;
                    var tblOffTop = elem[0].getBoundingClientRect().top + off;
                    var tblOffBot = tblOffTop + elem[0].offsetHeight - theadHeight;
                    if (off < tblOffTop || off > tblOffBot) {
                        sticky.css('display', 'none');
                    } else if (off >= tblOffTop && off <= tblOffBot && sticky.css('display') === 'none') {
                        sticky.css('display', 'block');
                    }
                }

                angular.element($window).bind('resize', onResize);
                angular.element($window).bind('scroll', onScroll);
                init();
            }
        };
    }

}());
