export interface LaunchSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  exposure: string;
  region: string;
}

export const launchSites: LaunchSite[] = [
  { id: "malanotte", name: "Malanotte", lat: 44.2588709833616, lon: 7.794304664370852, elevation: 1580, exposure: "Sud", region: "Cuneo" },
  { id: "colle-tenda", name: "Colle di Tenda", lat: 44.15093973937469, lon: 7.569262924652476, elevation: 1870, exposure: "Sud-Est", region: "Cuneo" },
  { id: "boves", name: "Boves", lat: 44.32113720462757, lon: 7.544697617792515, elevation: 980, exposure: "Sud", region: "Cuneo" },
  { id: "monte-male", name: "Monte Male di Dronero", lat: 44.43163071064606, lon: 7.362886778152897, elevation: 1370, exposure: "Sud-Est", region: "Cuneo" },
  { id: "iretta", name: "Iretta", lat: 44.49893744007536, lon: 7.382036612070795, elevation: 1420, exposure: "Sud", region: "Cuneo" },
  { id: "pratoni-val-mala", name: "Pratoni di Val Mala", lat: 44.50780117336976, lon: 7.346618978966227, elevation: 1480, exposure: "Sud", region: "Cuneo" },
  { id: "monte-birrone", name: "Monte Birrone", lat: 44.5398927839592, lon: 7.25293945830122, elevation: 1550, exposure: "Sud-Est", region: "Cuneo" },
  { id: "colle-agnello", name: "Colle dell'Agnello", lat: 44.68282592463814, lon: 6.978200601250462, elevation: 2740, exposure: "Sud", region: "Cuneo" },
  { id: "pian-mune-seggiovia", name: "Pian Munè seggiovia", lat: 44.63861029121272, lon: 7.230889474766025, elevation: 1800, exposure: "Sud-Ovest", region: "Cuneo" },
  { id: "pian-mune-basso", name: "Pian Munè basso", lat: 44.65736521807557, lon: 7.260017009542715, elevation: 1650, exposure: "Sud", region: "Cuneo" },
  { id: "martiniana-po", name: "Martiniana Po", lat: 44.60695265332723, lon: 7.38322612877631, elevation: 1050, exposure: "Sud", region: "Cuneo" },
  { id: "rucas-alto", name: "Rucas alto", lat: 44.74213930591463, lon: 7.220118689737356, elevation: 1720, exposure: "Sud", region: "Cuneo" },
  { id: "montoso-basso", name: "Montoso basso", lat: 44.7643723437882, lon: 7.249757926713178, elevation: 1200, exposure: "Sud", region: "Cuneo" },
  { id: "monte-vandalino", name: "Monte Vandalino", lat: 44.83671231480542, lon: 7.173866924055591, elevation: 2150, exposure: "Sud-Est", region: "Cuneo" },
  { id: "pian-alpe", name: "Pian dell'Alpe", lat: 45.06396153999711, lon: 7.028266530872771, elevation: 2100, exposure: "Sud", region: "Torino" },
  { id: "roletto", name: "Roletto (Piggi)", lat: 44.93249288285819, lon: 7.310959031722244, elevation: 700, exposure: "Sud", region: "Torino" },
  { id: "piossasco", name: "Piossasco Monte S. Giorgio", lat: 44.99671840144012, lon: 7.44800217882953, elevation: 620, exposure: "Sud", region: "Torino" },
  { id: "truccetti", name: "Truccetti", lat: 45.07973511679036, lon: 7.342018342463826, elevation: 920, exposure: "Sud", region: "Torino" },
  { id: "val-della-torre", name: "Val della Torre", lat: 45.16262748864921, lon: 7.463716167415302, elevation: 620, exposure: "Sud", region: "Torino" },
  { id: "rocca-canavese", name: "Rocca Canavese", lat: 45.32757754837493, lon: 7.572793582322621, elevation: 650, exposure: "Sud-Est", region: "Torino" },
  { id: "santa-elisabetta", name: "Santa Elisabetta", lat: 45.4182733880574, lon: 7.641945041749434, elevation: 900, exposure: "Sud", region: "Torino" },
  { id: "santa-elisabetta-alto", name: "Santa Elisabetta alto", lat: 45.44019393073506, lon: 7.648025947229948, elevation: 1050, exposure: "Sud-Est", region: "Torino" },
  { id: "monte-cavallaria", name: "Monte Cavallaria", lat: 45.51729363773779, lon: 7.798808327293107, elevation: 1020, exposure: "Sud", region: "Torino" },
  { id: "andrate", name: "Andrate", lat: 45.55063933418272, lon: 7.880775591143394, elevation: 800, exposure: "Sud", region: "Torino" },
];
