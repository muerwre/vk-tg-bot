import { CalendarConfig, CalendarKeyFile } from "./config";
import { CalendarService } from "../calendar";

export const setupCalendar = async (
  logger: (...vals: any) => void,
  config?: Partial<CalendarConfig>,
  keyConfig?: CalendarKeyFile
) => {
  if (!keyConfig) {
    return null;
  }

  try {
    const service = new CalendarService(
      keyConfig,
      config?.timezone ?? "",
      logger
    );

    await service.authenticate();

    return service;
  } catch (error) {
    logger("can't init calendar", error);
    return null;
  }
};
