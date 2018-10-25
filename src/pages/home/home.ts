import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  fenceSpace;
  fenceResp;
  distancesInMeters;
  haversineDistance;
  isInside = false;
  radius = 25;

  coords = {lat: 42.6051736, long: -83.2861247};


  // Haversine Formula to calculate distance between two coordinates
  // https://www.movable-type.co.uk/scripts/latlong.html
  // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
  // c = 2 ⋅ atan2( √a, √(1−a) )
  // d = R ⋅ c
  // where	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
  haversineFormula(lat1, long1, lat2, long2){
      let lat1Radians = Math.PI * lat1/180;
      let lat2Radians = Math.PI * lat2/180;
      // Conversion to radians
      let theta = Math.PI * (long1 - long2)/180;
      let latTheta = Math.PI * (lat1 - lat2)/180;
      let radius = 6371e3;

      // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
      let a = Math.pow( Math.sin(latTheta/2), 2) + Math.cos(lat1Radians) * Math.cos(lat2Radians) * Math.pow(Math.sin(theta/2), 2);
      let c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
      let distance = radius * c;
      return distance
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    let radlat1 = Math.PI * lat1/180
    let radlat2 = Math.PI * lat2/180
    let theta = lon1 - lon2
    let radtheta = Math.PI * theta/180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }

  constructor(public navCtrl: NavController, private geoLocation: Geolocation, private toast: ToastController) {
      
    let watcher = this.geoLocation.watchPosition({enableHighAccuracy: true, maximumAge: 100});
      
    watcher.subscribe( (data) => {
        console.log(data);
        this.fenceSpace = {
            alt: data.coords.altitude,
            lat: data.coords.latitude,
            long: data.coords.longitude,
            accuracy: data.coords.accuracy
        }

        let kilometers = this.distance(this.coords.lat, this.coords.long, this.fenceSpace.lat, this.fenceSpace.long, 'K');
        this.haversineDistance = this.haversineFormula(this.coords.lat, this.coords.long, this.fenceSpace.lat, this.fenceSpace.long);

        this.distancesInMeters = (kilometers * 1000);

        if (this.distancesInMeters >= this.radius){
            // this.toast.create({
            //   duration: 2500,
            //   message: "Your out of location",
            //   position: "bottom",
            //   showCloseButton: true
            // }).present();

            this.isInside = false;
        } else {
          this.isInside = true;
        }

    }, (err) => {
        console.log(err);
    });
  }

}
