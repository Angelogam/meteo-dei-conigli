export interface LaunchSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  exposure: string;
  valley?: string;
}

export const launchSites: LaunchSite[] = [
  {
    id: "montoso_croce",
    name: "Montoso – Croce",
    lat: 44.764,
    lon: 7.250,
    elevation: 1350,
    exposure: "S/SE",
    valley: "Valle Infernotto",
  },
  {
    id: "rucas_alto",
    name: "Rucas – Ripetitori",
    lat: 44.742,
    lon: 7.220,
    elevation: 1550,
    exposure: "S",
    valley: "Valle Infernotto",
  },
  {
    id: "malanotte",
    name: "Malanotte",
    lat: 44.730,
    lon: 7.260,
    elevation: 1450,
    exposure: "S/SE",
    valley: "Valle Infernotto",
  },
  {
    id: "pian_mune_alto",
    name: "Pian Munè – Alto",
    lat: 44.639,
    lon: 7.231,
    elevation: 1500,
    exposure: "S/SW",
    valley: "Valle Po",
  },
  {
    id: "pian_mune_basso",
    name: "Pian Munè – Basso",
    lat: 44.657,
    lon: 7.260,
    elevation: 1350,
    exposure: "S",
    valley: "Valle Po",
  },
  {
    id: "martiniana_po",
    name: "Martiniana Po",
    lat: 44.607,
    lon: 7.383,
    elevation: 900,
    exposure: "S",
    valley: "Valle Po",
  },
  {
    id: "vandalino",
    name: "Monte Vandalino",
    lat: 44.837,
    lon: 7.174,
    elevation: 2120,
    exposure: "S/SE",
    valley: "Val Pellice",
  },
  {
    id: "piossasco_s_giorgio",
    name: "Piossasco – Monte S. Giorgio",
    lat: 44.997,
    lon: 7.448,
    elevation: 837,
    exposure: "S",
    valley: "Collina Torinese",
  },
];