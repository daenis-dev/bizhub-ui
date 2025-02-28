import { EventDateDetails } from "./event-date-details.model";

export interface ScheduleDetails {
    username: string;
    eventDateDetails: EventDateDetails[];
}