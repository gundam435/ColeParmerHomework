import { Moment } from "moment";

export interface ITripEvents{
  accountId: number,
  serialNumber?: number,
  channel: string,
  eventType: number,
  timestamp: Moment,
  alarmData: string,
  comments?: string,
  commentThread?: string,
  dataType?: string,
  unitLabel?: string,
  id: number,
  createdAt?: Moment,
  createdBy?: string,
  modifiedAt?: Moment,
  modifiedBy?: string
}