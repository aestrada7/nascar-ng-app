(function() {
  'use strict';

  angular.module('nascar-app').provider('pointSystemService', function() {
    this.$get = ['$q', function($q) {
      const SYSTEM_WINSTON_CUP = '2003';
      const SYSTEM_STAGE_CHASE = '2014';
      const SYSTEM_MONSTER_CUP = '2017';

      const MONSTER_CUP_POINTS = [40, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17,
                                  16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2,  1,  1,  1,  1,  1];
      const MONSTER_STAGE_POINTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

      /**
       * Calculate the points according to the provided pointSystem, truncate on showAt or ignore if ALL is provided
       **/
      var calculate = function(driverId, raceData, pointSystem, showAt) {
        var defer = $q.defer();
        var obj = { 'races': 0, 'points': 0, 'playoffPoints': 0, 'wins': 0, 'top5s': 0, 'top10s': 0, 'lapsLed': 0, 
                    'average': 0, 'detail': [] };
        var raceDeduction = 0;

        angular.forEach(raceData, function(race, raceIdx) {
          if(showAt === 'ALL' || raceIdx < showAt) {
            angular.forEach(race.results, function(result, index) {
              if(result.driver === driverId) {
                if(pointSystem === SYSTEM_MONSTER_CUP) {
                  if(!result.dnq) {
                    obj.points += MONSTER_CUP_POINTS[index];
                    obj.races++;
                    obj.lapsLed += result.led;
                    raceDeduction = 0;
                    for(var i in race.penalizations) {
                      if(result.team === race.penalizations[i].team) {
                        raceDeduction = race.penalizations[i].deduction
                        obj.points = obj.points - raceDeduction;
                      }
                    }
                    obj.detail.push({ 'event-number': race['event-number'],
                                      'race': race['event-name'],
                                      'position': index + 1,
                                      'points': MONSTER_CUP_POINTS[index] - raceDeduction,
                                      'fullPoints': MONSTER_CUP_POINTS[index] - raceDeduction });
                  }
                  if(index === 0) {
                    obj.wins++;
                  }
                  if(index <= 4) {
                    obj.top5s++;
                  }
                  if(index <= 9) {
                    obj.top10s++;
                  }
                } else if(pointSystem === SYSTEM_STAGE_CHASE) {

                } else if(pointSystem === SYSTEM_WINSTON_CUP) {

                } else {
                  obj.points = 0;
                }
              }
            });

            //Average
            var avg = 0;
            for(var res in obj.detail) {
              avg += obj.detail[res].position;
            }
            avg = avg / obj.detail.length;
            obj.average = parseFloat(avg.toFixed(2));

            //Stages
            if(pointSystem === SYSTEM_MONSTER_CUP) {
              angular.forEach(race['stage-1'], function(stage1, index) {
                if(stage1.driver === driverId) {
                  obj.points = obj.points + MONSTER_STAGE_POINTS[index];
                  for(var k in obj.detail) {
                    if(obj.detail[k]['event-number'] === race['event-number']) {
                      obj.detail[k]['stage-1'] = MONSTER_STAGE_POINTS[index];
                      obj.detail[k].fullPoints = obj.detail[k].fullPoints + obj.detail[k]['stage-1'];
                    }
                  }
                }
              });
              angular.forEach(race['stage-2'], function(stage2, index) {
                if(stage2.driver === driverId) {
                  obj.points = obj.points + MONSTER_STAGE_POINTS[index];
                  for(var k in obj.detail) {
                    if(obj.detail[k]['event-number'] === race['event-number']) {
                      obj.detail[k]['stage-2'] = MONSTER_STAGE_POINTS[index];
                      obj.detail[k].fullPoints = obj.detail[k].fullPoints + obj.detail[k]['stage-2'];
                    }
                  }
                }
              });
            }
          }
        });

        defer.resolve(obj);

        return defer.promise;
      };

      return {
        calculate: calculate
      };
    }];
  });

}());