'use strict';

module.exports = (db) => {
    let express = require('express'),
        router = express.Router();
        
    router.get('/getDashboardData', (req, res, next) => {
        db.query(`
            SELECT 
                u.id,
                u.employeeID,
                CONCAT(e.FirstName, ' ', e.LastName) AS employeeName,
                e.JobTitle AS jobTitle,
                e.EmployeePhoto AS employeePhoto,
                CASE
                    WHEN u.type=0
                        THEN 'lastSeen'
                    ELSE
                        'checkin'
                END AS type,
                u.startTime,
                u.endTime,
                l.name AS location,
                l.description AS locationDescription,
                f.floor,
                f.name AS floorName,
                b.name AS buildingName,
                b.description AS buildingDescription
            FROM Beam.UserLocationStats u
            LEFT JOIN Common_Private.HR_Employee AS e ON e.EmployeeID=u.employeeID
            LEFT JOIN Beam.Locations AS l ON l.id=u.locationID
            LEFT JOIN Beam.Floors AS f ON l.floorID=f.id
            LEFT JOIN Beam.Buildings AS b on b.id=f.buildingID
            LIMIT 20
        `, (err, result) => {
            if(err) return res.json({ error: 'ERROR!!!!' });
            res.json(result);
        });
    });
    
    router.get('/beaconsInLocation/:id', (req, res, next) => {
        let locationId = req.params.id;
        
        db.query(`
            SELECT
                b.id AS beaconID,
                b.name AS beaconName,
                l.name AS locationName,
                l.description AS locationDescription
            FROM Beam.Beacons b
            LEFT JOIN Beam.Locations AS l ON l.id = b.locationID
            WHERE l.id=${db.escape(locationId)}
        `, (err, result) => {
            if(err) return res.json({ error: 'ERROR!!!!' });
            res.json(result);
        });
    });
    
    router.get('/usersInLocation/:id', (req, res, next) => {
        let locationId = req.params.id;
        
        db.query(`
            SELECT
                e.FirstName,
                e.LastName,
                u.startTime,
                u.endTime,
                CASE
                    WHEN u.type = 0
                        THEN 'lastSeen'
                    ELSE
                        'checkin'
                END AS type,
                e.JobTitle,
                e.PositionGroupName
            FROM Beam.UserLocationStats u
            LEFT JOIN Beam.Locations AS l ON l.id = u.locationID
            LEFT JOIN Common_Private.HR_Employee as e ON e.EmployeeID = u.employeeID
            WHERE l.id=${db.escape(locationId)}
        `, (err, result) => {
            if(err) return res.json({ error: 'ERROR!!!!' });
            res.json(result);
        });
    });
    
    router.get('/getBeaconLocation/:id', (req, res, next) => {
        let beaconId = req.params.id;
        
        db.query(`
            SELECT
                l.id AS locationID,
                l.name AS locationName,
                l.description AS locationDescription
            FROM Beam.Locations l
            LEFT JOIN Beam.Beacons AS b ON l.id = b.locationID
            WHERE b.id=${db.escape(beaconId)}
        `, (err, result) => {
            if(err) return res.json({ error: 'ERROR!!!!' });
            res.json(result);
        });
    });
    
    return router;
};
