export interface Launch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  exposure: string;
  valley: string;
  difficulty: number;
}

export const launches: Launch[] = [
  { id: "malanotte", name: "Malanotte", lat: 44.2587, lng: 7.7943, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.1509, lng: 7.5693, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.3211, lng: 7.5447, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.4316, lng: 7.3629, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.4989, lng: 7.382, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.5078, lng: 7.3466, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5399, lng: 7.2529, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.6828, lng: 6.9782, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.6386, lng: 7.2309, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.6574, lng: 7.2600, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.6069, lng: 7.3832, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.7421, lng: 7.2201, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7644, lng: 7.2498, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.8367, lng: 7.1739, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.0639, lng: 7.0283, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.9325, lng: 7.3110, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.9967, lng: 7.4480, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.0797, lng: 7.3420, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.1626, lng: 7.4637, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.3276, lng: 7.5728, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4183, lng: 7.6419, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.4402, lng: 7.6480, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.5173, lng: 7.7988, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.5506, lng: 7.8808, exposure: "S", valley: "Canavese", difficulty: 1 },
];