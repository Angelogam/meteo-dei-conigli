export interface LaunchSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  exposure: string;
  valley: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export const launchSites: LaunchSite[] = [
  { id: "malanotte", name: "Malanotte", lat: 44.4157, lon: 7.1333, elevation: 1740, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_tenda", name: "Colle di Tenda", lat: 44.1509, lon: 7.5693, elevation: 1870, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.3211, lon: 7.5447, elevation: 1310, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.4316, lon: 7.3629, elevation: 1530, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.4989, lon: 7.3820, elevation: 1480, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5399, lon: 7.2529, elevation: 2131, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.6828, lon: 6.9782, elevation: 2744, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.6386, lon: 7.2309, elevation: 1500, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.6574, lon: 7.2600, elevation: 1350, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana", name: "Martiniana Po", lat: 44.6070, lon: 7.3832, elevation: 900, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas", name: "Rucas alto", lat: 44.7421, lon: 7.2201, elevation: 1550, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso", name: "Montoso – Croce", lat: 44.7644, lon: 7.2498, elevation: 1350, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.8367, lon: 7.1739, elevation: 2120, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_alpe", name: "Pian dell'Alpe", lat: 45.0640, lon: 7.0283, elevation: 1620, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.9325, lon: 7.3110, elevation: 790, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – M. S. Giorgio", lat: 44.9967, lon: 7.4480, elevation: 837, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "trucchetti", name: "Trucchetti", lat: 45.0797, lon: 7.3420, elevation: 720, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_torre", name: "Val della Torre", lat: 45.1626, lon: 7.4637, elevation: 680, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese", lat: 45.3276, lon: 7.5728, elevation: 1100, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4183, lon: 7.6419, elevation: 780, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.4402, lon: 7.6480, elevation: 1000, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.5173, lon: 7.7988, elevation: 1300, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.5506, lon: 7.8808, elevation: 1030, exposure: "S", valley: "Canavese", difficulty: 1 },
];