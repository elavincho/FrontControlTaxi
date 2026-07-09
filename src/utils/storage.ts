/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Viaje, GastoCombustible, Mantenimiento, AlertNotification, FilterRange, PaymentMethod } from '../types';

// Simple encryption helper (using a custom hash function for secure storage in localStorage)
export function encryptPassword(password: string): string {
  // Simple but secure salt + hashing simulation for storage
  const salt = "taxi_app_salt_2026_";
  let hash = 0;
  const combined = salt + password;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `tx_${Math.abs(hash).toString(16)}`;
}

// Initial Mock User
const DEFAULT_USER: UserProfile = {
  id: 'user-demo',
  name: 'Mario',
  email: 'mario@controltaxi.com',
  phone: '+54 9 11 1234-5678',
  username: 'Mario',
  passwordHash: encryptPassword('Taxicontrol!'),
  carBrand: 'Fiat',
  carModel: 'Cronos Drive',
  carYear: 2021,
  carPlate: 'AA 888 AA',
  carKilometers: 124200,
  verified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
};

// Generate realistic dates in June and July 2026
const getPastDateString = (daysAgo: number): string => {
  const date = new Date('2026-07-08T12:00:00'); // set relative to the current local time July 8, 2026
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Initial Trips
const DEFAULT_VIAJES = (userId: string): Viaje[] => [
  // Today (July 8)
  { id: 'v-1', userId, fecha: getPastDateString(0), formaPago: 'Efectivo', monto: 4500 },
  { id: 'v-2', userId, fecha: getPastDateString(0), formaPago: 'Mercado Pago', monto: 6200 },
  { id: 'v-3', userId, fecha: getPastDateString(0), formaPago: 'App Taxi', monto: 8500 },
  { id: 'v-4', userId, fecha: getPastDateString(0), formaPago: 'Tarjeta de Débito', monto: 5000 },
  
  // Yesterday (July 7)
  { id: 'v-5', userId, fecha: getPastDateString(1), formaPago: 'Mercado Pago', monto: 7200 },
  { id: 'v-6', userId, fecha: getPastDateString(1), formaPago: 'Efectivo', monto: 3800 },
  { id: 'v-7', userId, fecha: getPastDateString(1), formaPago: 'Transferencia', monto: 9100 },
  { id: 'v-8', userId, fecha: getPastDateString(1), formaPago: 'App Taxi', monto: 5400 },
  
  // July 6
  { id: 'v-9', userId, fecha: getPastDateString(2), formaPago: 'Efectivo', monto: 4200 },
  { id: 'v-10', userId, fecha: getPastDateString(2), formaPago: 'Tarjeta de Crédito', monto: 12500 },
  { id: 'v-11', userId, fecha: getPastDateString(2), formaPago: 'Mercado Pago', monto: 6300 },
  
  // July 5
  { id: 'v-12', userId, fecha: getPastDateString(3), formaPago: 'Efectivo', monto: 3900 },
  { id: 'v-13', userId, fecha: getPastDateString(3), formaPago: 'App Taxi', monto: 7600 },
  
  // July 4
  { id: 'v-14', userId, fecha: getPastDateString(4), formaPago: 'Tarjeta de Débito', monto: 8800 },
  { id: 'v-15', userId, fecha: getPastDateString(4), formaPago: 'Efectivo', monto: 4500 },
  
  // July 3
  { id: 'v-16', userId, fecha: getPastDateString(5), formaPago: 'Mercado Pago', monto: 6900 },
  { id: 'v-17', userId, fecha: getPastDateString(5), formaPago: 'Transferencia', monto: 10500 },
  
  // July 2
  { id: 'v-18', userId, fecha: getPastDateString(6), formaPago: 'App Taxi', monto: 11200 },
  { id: 'v-19', userId, fecha: getPastDateString(6), formaPago: 'Efectivo', monto: 3500 },
  
  // July 1
  { id: 'v-20', userId, fecha: getPastDateString(7), formaPago: 'Mercado Pago', monto: 7800 },
  { id: 'v-21', userId, fecha: getPastDateString(7), formaPago: 'Tarjeta de Débito', monto: 5200 },
  
  // Late June 2026
  { id: 'v-22', userId, fecha: getPastDateString(10), formaPago: 'Efectivo', monto: 5100 },
  { id: 'v-23', userId, fecha: getPastDateString(11), formaPago: 'Mercado Pago', monto: 8200 },
  { id: 'v-24', userId, fecha: getPastDateString(12), formaPago: 'App Taxi', monto: 9300 },
  { id: 'v-25', userId, fecha: getPastDateString(15), formaPago: 'Transferencia', monto: 11000 },
  { id: 'v-26', userId, fecha: getPastDateString(18), formaPago: 'Tarjeta de Crédito', monto: 6500 },
  { id: 'v-27', userId, fecha: getPastDateString(20), formaPago: 'Efectivo', monto: 4700 },
  { id: 'v-28', userId, fecha: getPastDateString(25), formaPago: 'App Taxi', monto: 7400 }
];

// Initial Fuel Charges (GNC / Nafta)
const DEFAULT_COMBUSTIBLE = (userId: string): GastoCombustible[] => [
  // July GNC
  { id: 'c-1', userId, fecha: getPastDateString(0), importe: 2200, nota: 'Carga diaria GNC - Shell Av. Cabildo', tipo: 'GNC' },
  { id: 'c-2', userId, fecha: getPastDateString(2), importe: 2100, nota: 'GNC Estación YPF Centenario', tipo: 'GNC' },
  { id: 'c-3', userId, fecha: getPastDateString(4), importe: 2300, nota: 'GNC Shell Rivadavia', tipo: 'GNC' },
  { id: 'c-4', userId, fecha: getPastDateString(6), importe: 2050, nota: 'GNC YPF Constitución', tipo: 'GNC' },
  
  // July Nafta
  { id: 'c-5', userId, fecha: getPastDateString(1), importe: 12000, nota: 'Súper YPF - Tanque de reserva taxi', tipo: 'Nafta' },
  { id: 'c-6', userId, fecha: getPastDateString(7), importe: 15000, nota: 'Nafta Infinia Shell para arranque', tipo: 'Nafta' },
  
  // June GNC
  { id: 'c-7', userId, fecha: getPastDateString(10), importe: 1950, nota: 'GNC Shell', tipo: 'GNC' },
  { id: 'c-8', userId, fecha: getPastDateString(12), importe: 2000, nota: 'GNC YPF', tipo: 'GNC' },
  { id: 'c-9', userId, fecha: getPastDateString(15), importe: 2100, nota: 'GNC Shell Gral Paz', tipo: 'GNC' },
  { id: 'c-10', userId, fecha: getPastDateString(20), importe: 1900, nota: 'GNC Axion', tipo: 'GNC' },
  
  // June Nafta
  { id: 'c-11', userId, fecha: getPastDateString(14), importe: 11500, nota: 'Axion Súper - Carga quincenal', tipo: 'Nafta' },
  { id: 'c-12', userId, fecha: getPastDateString(28), importe: 13000, nota: 'YPF Súper', tipo: 'Nafta' }
];

// Initial Maintenance Logs
const DEFAULT_MANTENIMIENTO = (userId: string): Mantenimiento[] => [
  {
    id: 'm-1',
    userId,
    fecha: getPastDateString(5), // July 3, 2026
    tipoMantenimiento: 'Cambio de Aceite',
    descripcion: 'Aceite sintético Elaion F50 5W-40 y todos los filtros (aceite, aire, habitáculo y GNC)',
    importe: 38000,
    kilometrajeActual: 144800,
    proximoSugeridoKilometraje: 154800,
    proximoSugeridaFecha: '2026-10-03',
    taller: 'Lubricentro Warnes',
    nroFactura: 'A-0004-9842'
  },
  {
    id: 'm-2',
    userId,
    fecha: getPastDateString(18), // June 20, 2026
    tipoMantenimiento: 'Frenos',
    descripcion: 'Cambio de pastillas de freno delanteras y rectificación de discos traseros',
    importe: 24500,
    kilometrajeActual: 142100,
    proximoSugeridoKilometraje: 172000,
    proximoSugeridaFecha: '2026-12-20',
    taller: 'Frenos Warnes Express',
    nroFactura: 'B-0012-4210'
  },
  {
    id: 'm-3',
    userId,
    fecha: getPastDateString(25), // June 13, 2026
    tipoMantenimiento: 'Neumáticos',
    descripcion: 'Cambio de 2 neumáticos delanteros Pirelli Chrono y alineación + balanceo',
    importe: 110000,
    kilometrajeActual: 141000,
    proximoSugeridoKilometraje: 191000,
    proximoSugeridaFecha: '2027-06-13',
    taller: 'Neumáticos San Martín',
    nroFactura: 'A-0021-0091'
  }
];

// Initial Custom Alerts
const DEFAULT_ALERTAS = (userId: string): AlertNotification[] => [
  {
    id: 'al-1',
    userId,
    tipo: 'mantenimiento',
    mensaje: 'Próximo cambio de aceite recomendado a los 154,800 km',
    fechaLimite: '2026-10-03',
    kmLimite: 154800,
    resuelta: false
  },
  {
    id: 'al-2',
    userId,
    tipo: 'vtv',
    mensaje: 'Vencimiento de la VTV (Verificación Técnica Vehicular) el 31 de Julio',
    fechaLimite: '2026-07-31',
    resuelta: false
  },
  {
    id: 'al-3',
    userId,
    tipo: 'seguro',
    mensaje: 'Pago de póliza de seguro de Taxi mensual',
    fechaLimite: '2026-07-15',
    resuelta: false
  }
];

// Initialize Storage if empty
export function initStorage() {
  if (!localStorage.getItem('taxi_users')) {
    localStorage.setItem('taxi_users', JSON.stringify([DEFAULT_USER]));
  } else {
    // Migration: if the stored user 'Mario' has the old password 'Taxicontrol!''s hash,
    // update it to '¡Taxicontrol!' so that they can log in seamlessly with either or the new one!
    try {
      const users: UserProfile[] = JSON.parse(localStorage.getItem('taxi_users') || '[]');
      let updated = false;
      const updatedUsers = users.map(u => {
        // Checking for old hash: tx_2fef7645 (which is hash of salt + 'Taxicontrol!')
        const oldHash = encryptPassword('Taxicontrol!');
        if (u.username === 'Mario' && u.passwordHash === oldHash) {
          u.passwordHash = encryptPassword('Taxicontrol!');
          updated = true;
        }
        return u;
      });
      if (updated) {
        localStorage.setItem('taxi_users', JSON.stringify(updatedUsers));
      }
    } catch (e) {
      // ignore
    }
  }
  
  if (!localStorage.getItem('taxi_viajes')) {
    localStorage.setItem('taxi_viajes', JSON.stringify(DEFAULT_VIAJES(DEFAULT_USER.id)));
  }
  
  if (!localStorage.getItem('taxi_combustible')) {
    localStorage.setItem('taxi_combustible', JSON.stringify(DEFAULT_COMBUSTIBLE(DEFAULT_USER.id)));
  }
  
  if (!localStorage.getItem('taxi_mantenimiento')) {
    localStorage.setItem('taxi_mantenimiento', JSON.stringify(DEFAULT_MANTENIMIENTO(DEFAULT_USER.id)));
  }
  
  if (!localStorage.getItem('taxi_alertas')) {
    localStorage.setItem('taxi_alertas', JSON.stringify(DEFAULT_ALERTAS(DEFAULT_USER.id)));
  }
}

// Low-level Getters/Setters
export function getStoredUsers(): UserProfile[] {
  initStorage();
  return JSON.parse(localStorage.getItem('taxi_users') || '[]');
}

export function saveStoredUsers(users: UserProfile[]) {
  localStorage.setItem('taxi_users', JSON.stringify(users));
}

export function getStoredViajes(userId: string): Viaje[] {
  initStorage();
  const all: Viaje[] = JSON.parse(localStorage.getItem('taxi_viajes') || '[]');
  return all.filter(v => v.userId === userId);
}

export function saveStoredViajes(viajes: Viaje[], userId: string) {
  const all: Viaje[] = JSON.parse(localStorage.getItem('taxi_viajes') || '[]');
  const filtered = all.filter(v => v.userId !== userId);
  localStorage.setItem('taxi_viajes', JSON.stringify([...filtered, ...viajes]));
}

export function getStoredCombustible(userId: string): GastoCombustible[] {
  initStorage();
  const all: GastoCombustible[] = JSON.parse(localStorage.getItem('taxi_combustible') || '[]');
  return all.filter(c => c.userId === userId);
}

export function saveStoredCombustible(combustible: GastoCombustible[], userId: string) {
  const all: GastoCombustible[] = JSON.parse(localStorage.getItem('taxi_combustible') || '[]');
  const filtered = all.filter(c => c.userId !== userId);
  localStorage.setItem('taxi_combustible', JSON.stringify([...filtered, ...combustible]));
}

export function getStoredMantenimiento(userId: string): Mantenimiento[] {
  initStorage();
  const all: Mantenimiento[] = JSON.parse(localStorage.getItem('taxi_mantenimiento') || '[]');
  return all.filter(m => m.userId === userId);
}

export function saveStoredMantenimiento(mantenimiento: Mantenimiento[], userId: string) {
  const all: Mantenimiento[] = JSON.parse(localStorage.getItem('taxi_mantenimiento') || '[]');
  const filtered = all.filter(m => m.userId !== userId);
  localStorage.setItem('taxi_mantenimiento', JSON.stringify([...filtered, ...mantenimiento]));
}

export function getStoredAlertas(userId: string): AlertNotification[] {
  initStorage();
  const all: AlertNotification[] = JSON.parse(localStorage.getItem('taxi_alertas') || '[]');
  return all.filter(a => a.userId === userId);
}

export function saveStoredAlertas(alertas: AlertNotification[], userId: string) {
  const all: AlertNotification[] = JSON.parse(localStorage.getItem('taxi_alertas') || '[]');
  const filtered = all.filter(a => a.userId !== userId);
  localStorage.setItem('taxi_alertas', JSON.stringify([...filtered, ...alertas]));
}

// Date helpers for filtering
export function isDateInCurrentWeek(dateStr: string, referenceDateStr = '2026-07-08'): boolean {
  const refDate = new Date(referenceDateStr);
  const targetDate = new Date(dateStr);
  
  // Get start and end of week for reference date
  const day = refDate.getDay();
  const diff = refDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const startOfWeek = new Date(refDate.setDate(diff));
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);
  
  return targetDate >= startOfWeek && targetDate <= endOfWeek;
}

export function filterByRange<T extends { fecha: string }>(
  items: T[], 
  range: FilterRange, 
  customDateStr = '2026-07-08'
): T[] {
  const refDate = new Date(customDateStr);
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth(); // 0-indexed
  const refDay = refDate.getDate();

  return items.filter(item => {
    const itemDate = new Date(item.fecha);
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth();
    const itemDay = itemDate.getDate();

    if (range === 'dia') {
      return itemYear === refYear && itemMonth === refMonth && itemDay === refDay;
    } else if (range === 'semana') {
      return isDateInCurrentWeek(item.fecha, customDateStr);
    } else if (range === 'mes') {
      return itemYear === refYear && itemMonth === refMonth;
    } else if (range === 'ano') {
      return itemYear === refYear;
    }
    return true; // 'todos'
  });
}

// Stat Calculations
export interface SummaryStats {
  ingresosTotales: number;
  gastosGNC: number;
  gastosNafta: number;
  gastosMantenimiento: number;
  gastosTotales: number;
  gananciaNeta: number;
  cantViajes: number;
  cantCargasGNC: number;
  cantCargasNafta: number;
  promedioViaje: number;
}

export function calculateSummary(
  viajes: Viaje[], 
  combustibles: GastoCombustible[], 
  mantenimientos: Mantenimiento[]
): SummaryStats {
  const ingresosTotales = viajes.reduce((sum, v) => sum + v.monto, 0);
  
  const combustiblesFiltrados = combustibles;
  const gastosGNC = combustiblesFiltrados
    .filter(c => c.tipo === 'GNC')
    .reduce((sum, c) => sum + c.importe, 0);
    
  const gastosNafta = combustiblesFiltrados
    .filter(c => c.tipo === 'Nafta')
    .reduce((sum, c) => sum + c.importe, 0);

  const gastosMantenimiento = mantenimientos.reduce((sum, m) => sum + m.importe, 0);
  const gastosTotales = gastosGNC + gastosNafta + gastosMantenimiento;
  const gananciaNeta = ingresosTotales - gastosTotales;
  
  const cantViajes = viajes.length;
  const cantCargasGNC = combustibles.filter(c => c.tipo === 'GNC').length;
  const cantCargasNafta = combustibles.filter(c => c.tipo === 'Nafta').length;
  const promedioViaje = cantViajes > 0 ? ingresosTotales / cantViajes : 0;

  return {
    ingresosTotales,
    gastosGNC,
    gastosNafta,
    gastosMantenimiento,
    gastosTotales,
    gananciaNeta,
    cantViajes,
    cantCargasGNC,
    cantCargasNafta,
    promedioViaje
  };
}
