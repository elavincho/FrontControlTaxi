/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Viaje, GastoCombustible, Mantenimiento, AlertNotification } from '../types';
import { 
  calculateSummary, 
  filterByRange, 
  getStoredViajes, 
  getStoredCombustible, 
  getStoredMantenimiento, 
  getStoredAlertas, 
  saveStoredAlertas,
  saveStoredMantenimiento,
  saveStoredCombustible,
  saveStoredViajes
} from '../utils/storage';
import { 
  DollarSign, 
  TrendingUp, 
  Compass, 
  Wrench, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  Car, 
  Clock, 
  FileDown, 
  Fuel, 
  Layers, 
  PlusCircle, 
  BellRing,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (view: string) => void;
  onQuickAction: (action: string) => void;
}

export default function Dashboard({ user, onNavigate, onQuickAction }: DashboardProps) {
  const [activeActivityTab, setActiveActivityTab] = useState<'viajes' | 'combustible' | 'mantenimiento'>('viajes');
  const [exporting, setExporting] = useState(false);

  // Load user data
  const viajes = getStoredViajes(user.id);
  const combustibles = getStoredCombustible(user.id);
  const mantenimientos = getStoredMantenimiento(user.id);
  const alertas = getStoredAlertas(user.id);

  // Reference date for simulation: July 8, 2026
  const REFERENCE_DATE = '2026-07-08';

  // Stats calculations
  // Today's Stats
  const viajesHoy = filterByRange(viajes, 'dia', REFERENCE_DATE);
  const combustibleHoy = filterByRange(combustibles, 'dia', REFERENCE_DATE);
  // No maintenance typically registered in a single day, but calculate just in case
  const mantenimientoHoy = filterByRange(mantenimientos, 'dia', REFERENCE_DATE);
  const statsHoy = calculateSummary(viajesHoy, combustibleHoy, mantenimientoHoy);

  // Month's Stats
  const viajesMes = filterByRange(viajes, 'mes', REFERENCE_DATE);
  const combustibleMes = filterByRange(combustibles, 'mes', REFERENCE_DATE);
  const mantenimientoMes = filterByRange(mantenimientos, 'mes', REFERENCE_DATE);
  const statsMes = calculateSummary(viajesMes, combustibleMes, mantenimientoMes);

  // Next Maintenance schedule
  const activeAlerts = alertas.filter(a => !a.resuelta);
  const nextMaintenanceAlert = activeAlerts.find(a => a.tipo === 'mantenimiento');
  const nextMaintenanceMsg = nextMaintenanceAlert 
    ? nextMaintenanceAlert.mensaje 
    : 'No hay mantenimientos programados.';

  // --- CHART 1: LAST 30 DAYS INCOMES VS EXPENSES ---
  // Generate past 30 days records
  const generateLast30DaysChartData = () => {
    const data = [];
    const dateObj = new Date(REFERENCE_DATE);
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(dateObj);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.getDate() + '/' + (d.getMonth() + 1);

      // Incomes
      const dayIncomes = viajes
        .filter(v => v.fecha === dateStr)
        .reduce((sum, v) => sum + v.monto, 0);

      // Expenses
      const dayComb = combustibles
        .filter(c => c.fecha === dateStr)
        .reduce((sum, c) => sum + c.importe, 0);
      const dayMaint = mantenimientos
        .filter(m => m.fecha === dateStr)
        .reduce((sum, m) => sum + m.importe, 0);

      data.push({
        name: dayLabel,
        Ingresos: dayIncomes,
        Gastos: dayComb + dayMaint,
      });
    }
    return data;
  };

  const trendData = generateLast30DaysChartData();

  // --- CHART 2: MONTHLY EXPENSES BY CATEGORY ---
  const expensesPieData = [
    { name: 'GNC', value: statsMes.gastosGNC },
    { name: 'Nafta', value: statsMes.gastosNafta },
    { name: 'Mantenimiento', value: statsMes.gastosMantenimiento },
  ].filter(item => item.value > 0);

  const PIE_COLORS = ['#EAB308', '#F59E0B', '#F59E0B/50', '#71717a'];

  // --- CHART 3: PAYMENT METHODS ---
  const generatePaymentMethodsData = () => {
    const methods: Record<string, number> = {
      'Efectivo': 0,
      'Mercado Pago': 0,
      'Tarjeta de Débito': 0,
      'Tarjeta de Crédito': 0,
      'Transferencia': 0,
      'App Taxi': 0,
    };
    
    viajesMes.forEach(v => {
      if (methods[v.formaPago] !== undefined) {
        methods[v.formaPago] += v.monto;
      }
    });

    return Object.keys(methods).map(key => ({
      name: key,
      Monto: methods[key]
    })).filter(item => item.Monto > 0);
  };

  const paymentData = generatePaymentMethodsData();

  // Recent activity data
  const recentTrips = [...viajes].sort((a,b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
  const recentExpenses = [...combustibles].sort((a,b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
  const recentMaintenance = [...mantenimientos].sort((a,b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  const handleResolveAlert = (id: string) => {
    const updated = alertas.map(a => a.id === id ? { ...a, resuelta: true } : a);
    saveStoredAlertas(updated, user.id);
    // Reload through simple state refresh or component update
    window.dispatchEvent(new Event('storage-update'));
  };

  // Simulated export feature
  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      const reportHeader = `====================================================\n`;
      const reportTitle = `   REPORTE FINANCIERO MENSUAL - TAXI CONTROL (JULIO 2026)\n`;
      const reportCar = `   Vehículo: ${user.carBrand} ${user.carModel} | Patente: ${user.carPlate}\n`;
      const reportUser = `   Chofer: ${user.name} | Kilometraje: ${user.carKilometers} KM\n`;
      const reportDivider = `====================================================\n\n`;
      
      const reportContent = `--- RESUMEN DE FINANZAS ---\n` +
        `Ingresos Totales del Mes: $${statsMes.ingresosTotales.toLocaleString()}\n` +
        `Gastos GNC del Mes: $${statsMes.gastosGNC.toLocaleString()}\n` +
        `Gastos Nafta del Mes: $${statsMes.gastosNafta.toLocaleString()}\n` +
        `Gastos Mantenimiento del Mes: $${statsMes.gastosMantenimiento.toLocaleString()}\n` +
        `Total Gastos del Mes: $${statsMes.gastosTotales.toLocaleString()}\n` +
        `Ganancia Neta del Mes: $${statsMes.gananciaNeta.toLocaleString()}\n\n` +
        `--- ESTADISTICAS DE VIAJES & CARGAS ---\n` +
        `Cantidad de Viajes Realizados: ${statsMes.cantViajes}\n` +
        `Promedio de Ingreso por Viaje: $${Math.round(statsMes.promedioViaje).toLocaleString()}\n` +
        `Cantidad de Cargas GNC: ${statsMes.cantCargasGNC}\n` +
        `Cantidad de Cargas Nafta: ${statsMes.cantCargasNafta}\n\n` +
        `Reporte emitido el: 08/07/2026\n` +
        `Generado automáticamente por Taxi Control Premium.\n`;

      const fullText = reportHeader + reportTitle + reportCar + reportUser + reportDivider + reportContent;
      
      const element = document.createElement("a");
      const file = new Blob([fullText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Reporte_Taxi_Control_${user.username}_Julio2026.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setExporting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 font-sans" id="dashboard-container">
      {/* 1. Header Profile & Vehicle Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        {/* Background yellow glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-yellow-400/5 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* User welcome */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={user.avatarUrl || "https://api.dicebear.com/7.x/pixel-art/svg?seed=taxi"} 
                alt={user.name} 
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 p-0.5 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold tracking-wider uppercase">¡Hola!</p>
              <h2 className="text-2xl font-black text-slate-900 leading-tight font-display">{user.name}</h2>
              <p className="text-xs text-yellow-600 font-mono mt-0.5 font-bold">Taxi Nº 10 | @{user.username}</p>
            </div>
          </div>

          {/* Vehicle summary widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-50 border border-slate-200 p-4 rounded-xl gap-4 max-w-xl lg:max-w-none">
            {/* Small vehicle snapshot */}
            <div className="h-16 w-24 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative">
              <img 
                // src="/src/assets/images/taxi_dark_gold_1783567838853.jpg" 
                src="/images/taxi_logo.png" 
                alt="Taxi" 
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-1 left-2 text-[9px] font-mono text-yellow-400 font-bold tracking-widest">{user.carPlate}</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">VEHÍCULO</span>
                <strong className="text-slate-700">{user.carBrand} {user.carModel}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">AÑO / PATENTE</span>
                <strong className="text-slate-700">{user.carYear} • <span className="text-yellow-600 font-bold">{user.carPlate}</span></strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">KILOMETRAJE</span>
                <strong className="text-slate-700">{user.carKilometers.toLocaleString()} KM</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">ALERTA VTV</span>
                <span className="text-rose-600 font-bold">31 de Julio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" id="quick-actions">
        <button 
          onClick={() => onQuickAction('registrar_viaje')}
          className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-center group transition-all duration-300 hover:border-yellow-500 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Registrar Viaje</span>
        </button>

        <button 
          onClick={() => onQuickAction('registrar_gnc')}
          className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-center group transition-all duration-300 hover:border-yellow-500 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Fuel className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Cargar GNC</span>
        </button>

        <button 
          onClick={() => onQuickAction('registrar_nafta')}
          className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-center group transition-all duration-300 hover:border-yellow-500 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Fuel className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Cargar Nafta</span>
        </button>

        <button 
          onClick={() => onQuickAction('registrar_mantenimiento')}
          className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-center group transition-all duration-300 hover:border-yellow-500 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Mantenimiento</span>
        </button>

        <button 
          onClick={handleExportReport}
          disabled={exporting}
          className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-xl text-center group transition-all duration-300 shadow-md shadow-yellow-400/10 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-slate-950/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-slate-950">
            <FileDown className="h-5 w-5" />
          </div>
          <span className="text-xs font-extrabold">{exporting ? 'Exportando...' : 'Exportar Informe'}</span>
        </button>
      </div>

      {/* 3. Alerts Panel (Active Notifications) */}
      {activeAlerts.length > 0 && (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm" id="notifications-panel">
          <div className="flex items-center space-x-2 text-yellow-600 font-black text-sm mb-3 font-display">
            <BellRing className="h-4 w-4 animate-swing text-yellow-500" />
            <span>Notificaciones y Alertas Activas ({activeAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-xs ${
                  alert.tipo === 'vtv' || alert.tipo === 'seguro' 
                    ? 'bg-rose-50 border-rose-100 text-rose-800' 
                    : 'bg-yellow-50 border-yellow-100 text-yellow-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${
                    alert.tipo === 'vtv' || alert.tipo === 'seguro' ? 'text-rose-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-bold leading-relaxed">{alert.mensaje}</p>
                    <div className="flex gap-2 font-mono text-[10px] text-slate-500 mt-1">
                      <span>Límite: {alert.fechaLimite}</span>
                      {alert.kmLimite && <span>• Km: {alert.kmLimite.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleResolveAlert(alert.id)}
                  className="self-end inline-flex items-center space-x-1 py-1 px-2.5 bg-white hover:bg-slate-50 text-[10px] font-extrabold tracking-wider uppercase rounded-lg border border-slate-200 text-slate-700 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Resolver</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. KPI Scorecards (Today vs Month) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metrics">
        {/* Card 1: Ingresos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">INGRESOS</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-display">$ {statsMes.ingresosTotales.toLocaleString()}</div>
            <p className="text-slate-400 text-xs mt-1 font-bold">Este Mes</p>
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Hoy:</span>
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              $ {statsHoy.ingresosTotales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">GASTOS</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-display">$ {statsMes.gastosTotales.toLocaleString()}</div>
            <p className="text-slate-400 text-xs mt-1 font-bold">Combustible + Taller</p>
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Hoy GNC/Nafta:</span>
            <span className="text-rose-600 font-bold flex items-center">
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              $ {statsHoy.gastosTotales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Ganancia Neta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono bg-yellow-55 text-yellow-700 px-2 py-0.5 rounded-full font-bold">NETO</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-yellow-600 font-display">$ {statsMes.gananciaNeta.toLocaleString()}</div>
            <p className="text-slate-400 text-xs mt-1 font-bold">Ganancia Real</p>
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Hoy Neto:</span>
            <span className={`font-bold flex items-center ${statsHoy.gananciaNeta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              $ {statsHoy.gananciaNeta.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Viajes y Próx Mantenimiento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">ACTIVIDAD</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-display">{statsMes.cantViajes} <span className="text-xs font-normal text-slate-400">viajes mes</span></div>
            <p className="text-slate-500 text-[10px] truncate font-bold">Taller: <span className="text-yellow-600">{nextMaintenanceMsg}</span></p>
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Viajes Hoy:</span>
            <span className="text-yellow-600 font-bold">{statsHoy.cantViajes} viajes</span>
          </div>
        </div>
      </div>

      {/* 5. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts">
        {/* Line Chart: Income vs Expenses Last 30 Days (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[350px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base font-display">Evolución: Ingresos vs Gastos</h3>
              <p className="text-xs text-slate-400 font-bold">Historial diario de los últimos 30 días</p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Ingresos" stroke="#ca8a04" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gastos" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3: Doughnut Chart (Expenses breakdown) + Payment Method Bar Chart */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Doughnut Chart: Expenses breakdown */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex-1 flex flex-col justify-between shadow-sm">
            <div className="mb-2">
              <h3 className="font-black text-slate-900 text-base font-display">Desglose de Gastos</h3>
              <p className="text-xs text-slate-400 font-bold">Distribución de gastos de este mes</p>
            </div>
            
            {expensesPieData.length > 0 ? (
              <div className="flex items-center justify-center relative py-2">
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `$${val?.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Total</span>
                  <span className="text-sm font-black text-slate-900">${statsMes.gastosTotales.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 italic">No hay gastos registrados en el mes.</div>
            )}

            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center pt-2 border-t border-slate-100">
              <div className="flex flex-col items-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mb-1"></span>
                <span className="text-slate-400">GNC</span>
                <strong className="text-slate-700">${statsMes.gastosGNC.toLocaleString()}</strong>
              </div>
              <div className="flex flex-col items-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mb-1"></span>
                <span className="text-slate-400">Nafta</span>
                <strong className="text-slate-700">${statsMes.gastosNafta.toLocaleString()}</strong>
              </div>
              <div className="flex flex-col items-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-600 mb-1"></span>
                <span className="text-slate-400">Taller</span>
                <strong className="text-slate-700">${statsMes.gastosMantenimiento.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Mini Bar Chart: Payment Methods */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex-1 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="font-black text-slate-900 text-base font-display">Medios de Pago</h3>
              <p className="text-xs text-slate-400 font-bold">Monto ingresado por forma de pago</p>
            </div>
            
            {paymentData.length > 0 ? (
              <div className="w-full h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} tickLine={false} />
                    <Tooltip formatter={(val) => `$${val?.toLocaleString()}`} />
                    <Bar dataKey="Monto" fill="#ca8a04" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">No hay cobros registrados.</div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Recent Activity Panels */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="recent-activity-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base font-display">Registro de Actividad Reciente</h3>
            <p className="text-xs text-slate-400 font-bold">Últimos movimientos cargados en la plataforma</p>
          </div>
          
          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-50 border border-slate-100 rounded-xl space-x-1 text-xs">
            <button
              onClick={() => setActiveActivityTab('viajes')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                activeActivityTab === 'viajes' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Viajes
            </button>
            <button
              onClick={() => setActiveActivityTab('combustible')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                activeActivityTab === 'combustible' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Combustibles
            </button>
            <button
              onClick={() => setActiveActivityTab('mantenimiento')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                activeActivityTab === 'mantenimiento' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Mantenimientos
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="overflow-x-auto">
          {activeActivityTab === 'viajes' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Método de Pago</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTrips.length > 0 ? (
                  recentTrips.map(trip => (
                    <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono">{trip.fecha}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center space-x-1 font-semibold">
                          <Wallet className="h-3.5 w-3.5 text-yellow-500" />
                          <span>{trip.formaPago}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black font-mono text-emerald-600">+ $ {trip.monto.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 italic">No hay viajes recientes registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeActivityTab === 'combustible' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Combustible</th>
                  <th className="py-2.5 px-3">Descripción / Estación</th>
                  <th className="py-2.5 px-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono">{item.fecha}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          item.tipo === 'GNC' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 truncate max-w-xs font-medium text-slate-600">{item.nota}</td>
                      <td className="py-2.5 px-3 text-right font-black font-mono text-rose-600">- $ {item.importe.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">No hay cargas recientes de combustible.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeActivityTab === 'mantenimiento' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Servicio</th>
                  <th className="py-2.5 px-3">Taller responsable</th>
                  <th className="py-2.5 px-3">Kms Actuales</th>
                  <th className="py-2.5 px-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentMaintenance.length > 0 ? (
                  recentMaintenance.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono">{item.fecha}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{item.tipoMantenimiento}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{item.taller}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-600">{item.kilometrajeActual.toLocaleString()} KM</td>
                      <td className="py-2.5 px-3 text-right font-black font-mono text-rose-600">- $ {item.importe.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">No hay tareas de mantenimiento registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
