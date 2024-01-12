import { calendar_v3, google } from "googleapis";
import { KeyFile } from "./types";
import { JWT } from "google-auth-library";

export class CalendarService {
  private auth!: JWT;
  private calendar!: calendar_v3.Calendar;

  constructor(
    key: KeyFile,
    private timeZone: string, // idk, use it someday
    private log: (...vals: any) => void
  ) {
    this.auth = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ]
    );

    this.calendar = google.calendar({
      version: "v3",
      auth: this.auth,
    });
  }

  public async authenticate() {
    await this.auth.authorize();
  }

  protected async isEventExist(calendarId: string, eventID: string) {
    const event = await this.calendar.events.list({
      calendarId: calendarId,
      iCalUID: eventID,
      showDeleted: true,
    });

    return Boolean(event.data.items?.length);
  }

  public async createEvent(
    calendarId: string,
    start: Date,
    end: Date,
    summary: string,
    description: string,
    eventId: string
  ) {
    if (await this.isEventExist(calendarId, eventId)) {
      this.log("event already exist, quitting");
      return;
    }

    await this.calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
        iCalUID: eventId,
      },
    });
  }
}
