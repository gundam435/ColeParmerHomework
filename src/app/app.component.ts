import { Component, OnInit } from '@angular/core';
import { TripDataService } from './services/tripdata.service';
import * as moment from 'moment';
import { Moment } from "moment";
import { ITripSettings } from './models/ITripSettings';
import { ITripData } from './models/ITripData';
import { ITripEvents } from './models/ITripEvents';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{

  private tripStartTime:Moment = this.data.data.startTime;
  private tripEndTime:Moment = this.data.data.endTime;
  private tripSettings:ITripSettings[] = this.data.data.tripSettings;
  private tripUploadData:ITripData[] = this.data.data.tripUploadData;
  private tripUploadEvents:ITripEvents[] = this.data.data.tripUploadEvents;

  constructor(private data:TripDataService) {}

  ngOnInit(){
    this.alarmTimeByChannel();
  }

  //for each channel finds data alarm time, event alarm time, and the summation of both
  alarmTimeByChannel(){
    this.tripSettings.forEach(m=>{
      let channel:string = m.channelName;
      let currentSensorTripData:ITripData[]=this.orderByTimestamp(
        this.tripUploadData.filter(m=>m.channel==channel)
      );
      let dataAlarmSeconds = this.sensorDataAlarmClocking(currentSensorTripData, m);
      
      let currentSensorEvents:ITripEvents[]=this.orderByTimestamp(
        this.tripUploadEvents.filter(m=>m.channel==channel)
      );
      let eventAlarmSeconds = this.sensorEventAlarmClocking(currentSensorEvents, m);
      console.log(
        `${channel}'s total data and event alarm time: `,
        this.secondsToMoment(dataAlarmSeconds+eventAlarmSeconds)
      );
    })
  }

  //clocks time in alarm from data based on channelName
  sensorDataAlarmClocking(sensorData:ITripData[], setting:ITripSettings):number{
    let alarmFlag:boolean = false;
    let above:boolean =false;
    let below:boolean =false;
    let totalAlarmSeconds = 0;
    let outData:ITripData;
    let inData:ITripData;
    sensorData.forEach(m=>{
      if(alarmFlag==false && m.data>setting.max){
        alarmFlag=true;
        above=true;
        outData=m;
      }
      else if(alarmFlag==false && m.data<setting.min){
        alarmFlag=true;
        below=true;
        outData=m;
      }
      else if(alarmFlag==true && above==true && m.data<setting.max){
        alarmFlag=false;
        inData=m;
        totalAlarmSeconds = totalAlarmSeconds+=this.secondsDifference(inData.timestamp,outData.timestamp);
      }
      else if (alarmFlag==true && below==true && m.data>setting.min){
        alarmFlag=false;
        inData=m;
        totalAlarmSeconds = totalAlarmSeconds+=this.secondsDifference(inData.timestamp,outData.timestamp);
      }
      else if(alarmFlag==true && m==sensorData[sensorData.length - 1]){
        totalAlarmSeconds = totalAlarmSeconds+=this.secondsDifference(this.tripEndTime, outData.timestamp);
      }
    })
    console.log(
      `${setting.channelName}'s total data alarm time: `,
      this.secondsToMoment(totalAlarmSeconds)
    );
    return totalAlarmSeconds;
  }

  //clocks time in alarm from events based on channelName
  sensorEventAlarmClocking(sensorEvents:ITripEvents[], setting:ITripSettings):number{
    let eventFlag:boolean = false;
    let totalEventSeconds = 0;
    let outEvent:ITripEvents;
    let inEvent:ITripEvents;
    sensorEvents.forEach(m=>{
      if(eventFlag==false && (m.eventType==6 || m.eventType==7)){
        eventFlag=true;
        outEvent=m;
      }
      else if(eventFlag==true && (m.eventType==8 || m.eventType==9)){
        eventFlag=false;
        inEvent=m;
        totalEventSeconds = totalEventSeconds+=this.secondsDifference(inEvent.timestamp, outEvent.timestamp);
      }
      else if (eventFlag==true && m==sensorEvents[sensorEvents.length - 1]){
        totalEventSeconds = totalEventSeconds+=this.secondsDifference(this.tripEndTime,outEvent.timestamp);
      }
    });
    console.log(
      `${setting.channelName}'s total event alarm time: `,
      this.secondsToMoment(totalEventSeconds)
    );
    return totalEventSeconds;
  }

  //array in ascending order by timestamp
  orderByTimestamp(arr:any[]){
    return arr.sort(function (left, right) {
      return moment.utc(left.timestamp).diff(moment.utc(right.timestamp))
    });
  }

  //returns seconds difference from then to now
  secondsDifference(now:Moment, then:Moment):number{
    let difference = moment.duration(moment(now).diff(moment(then))).asSeconds();
    return difference;
  }

  //interpolate seconds into "HHmmdd" format
  secondsToMoment(secs:number) {
    function pad(num){
      return ("0"+num).slice(-2);
    }
    let minutes = Math.floor(secs / 60);
    secs = secs%60;
    let hours = Math.floor(minutes/60)
    minutes = minutes%60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

}
