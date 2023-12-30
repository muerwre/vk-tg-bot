import axios from "axios";

interface RollResult {
  distance: number;
  id: string;
  title: string;
}

const url = `https://backend-map.vault48.org/api/route/random`;
const successMessages = [
  "Вот маршрут для тебя: {link}, {dist}км",
  "Ну вот есть, например, {link}, всего {dist}км",
  "Нашёл {link}, всего {dist}км, надо ехать",
  "Вот, {link}, всего {dist}км, катал его, нет?",
];

const failureMessages = [
  "Ничего не нашёл 🤷",
  "Не, такого нет, попробуй снова",
  "Может, что-то и было такое, но сейчас я не ничего не нашёл.",
];

const say = (vals: string[]) =>
  vals[Math.floor(Math.random() * (vals.length - 1))];

const parseVal = (val?: string) => {
  const parsed = val && parseInt(val, 10);

  if (!parsed || !Number.isFinite(parsed) || parsed <= 0 || parsed >= 10000) {
    return;
  }

  return parsed;
};

const escape = (val?: string) => val && val.replace(/([-.\[\]\(\)])/g, "\\$1");
const deviate = (max: number, factor: number) => [
  Math.round(max * (1 - factor)),
  Math.round(max * (1 + factor)),
];

// begin search in range of 80%-120% of specified distance
const startDeviation = 0.2;
// add 10% each time we haven't found anything
const deviationStep = 0.1;
// perform this amount of tries, increasing deviation each time we haven't found anything
const deviationTries = 8;

const getRoute = async (
  min?: number,
  max?: number
): Promise<RollResult | undefined> => {
  if (!min && !max) {
    return axios.get<RollResult>(url).then((it) => it.data);
  }

  if (min && max && min > max) {
    return axios
      .get<RollResult>(url, { params: { min: max, max: min } })
      .then((it) => it.data);
  }

  if (min && max) {
    return axios
      .get<RollResult>(url, { params: { min, max } })
      .then((it) => it.data);
  }

  if (!min) {
    return;
  }

  for (let i = 0; i < deviationTries; i += 1) {
    const deviation = startDeviation + deviationStep * i;

    let [devMin, devMax] = deviate(min, deviation);

    try {
      return await axios
        .get<RollResult>(url, { params: { min: devMin, max: devMax } })
        .then((it) => it.data)
        .catch();
    } catch (error) {}
  }
};

export const roll = async (text: string) => {
  try {
    const parts = text.match(/^\/roll\s?(\d+)?[-\s,]{0,3}(\d+)?$/);
    const result = await getRoute(parseVal(parts?.[1]), parseVal(parts?.[2]));

    if (!result || !result?.id) {
      return say(failureMessages);
    }

    const link = `https://map.vault48.org/${result.id}`;
    const distance = result.distance.toFixed(0);
    const message = say(successMessages);

    return message
      .replace("{dist}", distance)
      .replace("{link}", `[${escape(result.title ?? link)}](${escape(link)})`);
  } catch (error) {
    console.warn("Error, when trying to fetch random route", error);
  }
};
