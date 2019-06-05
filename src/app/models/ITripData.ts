import { Moment } from "moment";

export interface ITripData{
  accountId: number,
  channel: string,
  serialNumber: string,
  timestamp: Moment,
  data: number,
  id: number,
  createdAt?: Moment,
  createdBy?: string,
  modifiedAt?: Moment,
  modifiedBy?: string
}