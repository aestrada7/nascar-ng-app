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

      const STAGE_CHASE_POINTS = [46, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24,
                                  23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,
                                   3,  2,  1];

      const WINSTON_CUP_POINTS = [175, 170, 165, 160, 155, 150, 146, 142, 138, 134, 130, 127, 124, 121, 118, 115,
                                  112, 109, 106, 103, 100,  97,  94,  91,  88,  85,  82,  79,  76,  73,  70,  67,
                                   64,  61,  58,  55,  52,  49,  46,  43,  40,  37,  34];

      /**
       * Builds points according to the selected point system.
       **/
      var buildPoints = function(result, race, obj, position, pointSystemArray) {
        var raceDeduction = 0;
        var ledLapModifiers = 0;

        if(!result.dnq) {
          obj.points += pointSystemArray[position];
          obj.races++;
          obj.lapsLed += result.led;
          raceDeduction = 0;
          for(var i in race.penalizations) {
            if(result.team === race.penalizations[i].team) {
              raceDeduction = pointSystemArray[parseInt(race.penalizations[i]['place-deduction']) - 1];
              obj.points = obj.points - raceDeduction;
            }
          }

          if(result.most) {
            if(pointSystemArray === STAGE_CHASE_POINTS) {
              obj.points = obj.points + 1;
              ledLapModifiers++;
            }

            if(pointSystemArray === WINSTON_CUP_POINTS) {
              obj.points = obj.points + 5;
              ledLapModifiers += 5;
            }
          }

          if(obj.lapsLed > 0) {
            if(pointSystemArray === STAGE_CHASE_POINTS) {
              obj.points = obj.points + 1;
              ledLapModifiers++;
            }

            if(pointSystemArray === WINSTON_CUP_POINTS) {
              obj.points = obj.points + 5;
              ledLapModifiers += 5;
            }
          }

          obj.detail.push({ 'event-number': race['event-number'],
                            'race': race['event-name'],
                            'position': position + 1,
                            'points': pointSystemArray[position] + ledLapModifiers - raceDeduction,
                            'fullPoints': pointSystemArray[position] + ledLapModifiers - raceDeduction });
        }
        if(position === 0) {
          obj.wins++;
          if(pointSystemArray === MONSTER_CUP_POINTS) {
            obj.playoffPoints += 5;
          }
        }
        if(position <= 4) {
          obj.top5s++;
        }
        if(position <= 9) {
          obj.top10s++;
        }
      }

      /**
       * Calculate the points according to the provided pointSystem, truncate on showAt or ignore if ALL is provided
       **/
      var calculate = function(driverId, raceData, pointSystem, showAt) {
        var defer = $q.defer();
        var obj = { 'races': 0, 'points': 0, 'playoffPoints': 0, 'wins': 0, 'top5s': 0, 'top10s': 0, 'lapsLed': 0, 
                    'average': 0, 'previousPoints': 0, 'duelPoints': 0, 'detail': [] };

        angular.forEach(raceData, function(race, raceIdx) {
          if(showAt === 'ALL' || raceIdx < showAt) {
            angular.forEach(race.results, function(result, index) {
              if(result.driver === driverId) {
                if(pointSystem === SYSTEM_MONSTER_CUP) {
                  buildPoints(result, race, obj, index, MONSTER_CUP_POINTS);
                } else if(pointSystem === SYSTEM_STAGE_CHASE) {
                  buildPoints(result, race, obj, index, STAGE_CHASE_POINTS);
                } else if(pointSystem === SYSTEM_WINSTON_CUP) {
                  buildPoints(result, race, obj, index, WINSTON_CUP_POINTS);
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

                  if(parseInt(race['event-number']) === 0) {
                    obj.duelPoints = MONSTER_STAGE_POINTS[index]
                  }

                  if(index === 0) {
                    obj.playoffPoints += 1;
                  }

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

                  if(parseInt(race['event-number']) === 0) {
                    obj.duelPoints = MONSTER_STAGE_POINTS[index]
                  }

                  if(index === 0) {
                    obj.playoffPoints += 1;
                  }

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

        //Previous Points
        obj.previousPoints = obj.duelPoints;
        if(obj.detail.length > 0) {
          if(driverId == 'larsok') console.log(obj);
          for(var k = 0; k < obj.detail.length - 1; k++) {
            obj.previousPoints += obj.detail[k].fullPoints;
          }
        }

        defer.resolve(obj);

        return defer.promise;
      };

      return {
        calculate: calculate
      };
    }];
  });

}());