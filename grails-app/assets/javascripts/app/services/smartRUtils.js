
console.log('Loading smartRUtils...');
window.smartRApp.factory('smartRUtils', ['$q', function($q) {

    var service = {};

    service.conceptBoxMapToConceptKeys = function smartRUtils_conceptBoxMapToConceptKeys(conceptBoxMap) {
        var allConcepts = {};
        Object.keys(conceptBoxMap).each(function(group) {
            var concepts = conceptBoxMap[group];
            concepts.each(function(concept, idx) {
                allConcepts[group + '_' + 'n' + idx] = concept;
            });
        });
        return allConcepts;
    };

    service.makeSafeForCSS = function smartRUtils_makeSafeForCSS(str) {
        return str.replace(/[^a-z0-9]/g, function(s) {
            var c = s.charCodeAt(0);
            if (c == 32) return '-';
            if (c >= 65 && c <= 90) return s.toLowerCase();
            return ('000' + c.toString(16)).slice(-4);
        });
    };

    service.shortenConcept = function smartRUtils_shortenConcept(concept) {
        var split = concept.split('\\');
        return split[split.length - 3] + '/' + split[split.length - 2];
    };

    service.getSubsetIds = function smartRUtil_getSubsetIds() {
        var defer = $q.defer();

        function resolveResult() {
            var res = window.GLOBAL.CurrentSubsetIDs.map(function (v) {
                return v || null;
            });
            if (res.some(function (el) {
                    return el !== null;
                })) {
                defer.resolve(res);
            } else {
                defer.reject();
            }
        }

        for (var i = 1; i <= window.GLOBAL.NumOfSubsets; i++) {
            if (!window.isSubsetEmpty(i) && !window.GLOBAL.CurrentSubsetIDs[i]) {
                window.runAllQueries(resolveResult);
                return defer.promise;
            }
        }

        resolveResult();

        return defer.promise;
    };

    return service;
}]);