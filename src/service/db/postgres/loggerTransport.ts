import Transport, { TransportStreamOptions } from "winston-transport";
import { PostgresDB } from "./index";
import safeJson from "safe-json-stringify";

export class PgTransport extends Transport {
  constructor(private db: PostgresDB, private props: TransportStreamOptions) {
    super(props);
  }

  log = async (info, callback) => {
    try {
      await this.db.insertLog(info.level, info.message, info);
    } catch (e) {
      await this.db.insertLog(info.level, info.message, {
        dump: safeJson(info),
      });
    }

    callback();
  };
}
