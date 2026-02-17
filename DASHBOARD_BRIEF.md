# POLYMARKET TRADING DASHBOARD - DESIGN BRIEF

## Para Claw6 / MiniMax M2.5

---

## VISIÓN GENERAL

Dashboard PWA profesional para monitorear el bot de trading de Polymarket en tiempo real. Debe verse como un terminal de trading institucional (estilo Bloomberg/Binance Pro), no como un proyecto de hobby.

---

## STACK TÉCNICO

### Backend (en el VPS)
- **FastAPI** corriendo en puerto 8501
- Endpoints REST que leen de los logs existentes
- WebSocket endpoint para datos en tiempo real
- CORS habilitado para el frontend en Netlify

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilos
- **Recharts** o **Lightweight Charts (TradingView)** para gráficos
- **Framer Motion** para animaciones sutiles
- **Lucide React** para todos los iconos
- PWA con manifest.json + service worker
- Responsive: mobile first, funcional en celular

### Deploy
- Repo en GitHub: `alonsix6/PolyDash` (ya clonado en ~/PolyDash/ con deploy key)
- Deploy automático en Netlify conectado al repo
- Backend API expuesto públicamente (read-only, no data sensible)
- Nginx como reverse proxy con HTTPS (certbot/Let's Encrypt)
- API key simple (X-API-Key header) como protección básica contra scraping
- La URL del backend se configura como variable de entorno en Netlify: `VITE_API_URL=https://146.235.57.106/api`

---

## DISEÑO VISUAL

### Estilo
- **Fondo:** Negro #0A0A0F con sutiles gradientes oscuros
- **Texto principal:** Blanco #E8E8E8
- **Acento primario:** Verde neón #00FF85 (señales UP, profit, positivo)
- **Acento secundario:** Rojo #FF3B3B (señales DOWN, loss, negativo)
- **Acento terciario:** Azul #3B82F6 (neutral, info, links)
- **Cards:** #12121A con borde sutil #1E1E2E, border-radius 12px
- **Font títulos:** JetBrains Mono o Space Mono (monospace, estilo terminal)
- **Font body:** Inter o Satoshi (legible, moderno)

### Principios
- Data density alta (mucha info en poco espacio, estilo Bloomberg)
- Números grandes y claros para KPIs principales
- Colores semáforo: verde = bueno, rojo = malo, azul = neutral
- Animaciones sutiles en transiciones de datos (no distractoras)
- Glassmorphism sutil en cards (backdrop-blur leve)
- Sin emojis en el dashboard, usar **Lucide React** para todos los iconos (lucide-react package)

---

## ESTRUCTURA DE PÁGINAS

### 1. HEADER (fijo, todas las páginas)
- Logo "Polymarket Bot" a la izquierda
- Status del bot: indicador verde pulsante si está corriendo, rojo si está caído
- Uptime del bot (ej: "Running 14h 32m")
- Precio BTC en tiempo real (del feed de Binance)
- Hora UTC actual
- Navegación: Overview | Signals | Wallets | Settings

### 2. PÁGINA: OVERVIEW (página principal)

#### Fila 1: KPIs principales (4 cards grandes)
- **Total Señales:** número grande + mini sparkline de señales por hora
- **Win Rate:** porcentaje grande + indicador de tendencia (flecha arriba/abajo vs periodo anterior)
- **PnL Teórico:** monto en USD + gráfico mini de PnL acumulado
- **Drawdown Máximo:** porcentaje + indicador de severidad (verde/amarillo/rojo)

#### Fila 2: Gráfico principal (ocupa todo el ancho)
- **PnL acumulado over time** - gráfico de área/línea
- Eje X: tiempo (últimas 24h por default, selector: 1h, 6h, 24h, 48h, 7d)
- Eje Y: PnL en USD
- Línea verde si positivo, roja si negativo
- Zona sombreada debajo de la línea
- Hover: tooltip con detalle de cada señal

#### Fila 3: Dos paneles lado a lado

**Panel izquierdo: Últimas señales (tabla)**
- Timestamp, mercado, dirección (UP/DOWN con color), score, confidence, PnL teórico
- Máximo 20 filas, scroll interno
- Cada fila clickeable para ver detalle
- Indicador visual de señal ganadora/perdedora

**Panel derecho: Distribución de señales**
- Donut chart: UP vs DOWN ratio
- Bar chart: señales por hora del día (para detectar mejores horarios)
- Mini stat: mejor hora para tradear

#### Fila 4: Wallet Baskets panel
- 3 cards (una por wallet del Basket 1)
- Cada card muestra: address truncada, último trade detectado, dirección, timestamp
- Indicador de consensus: si 2+ wallets se alinean, card especial verde brillante con "CONSENSUS SIGNAL"

### 3. PÁGINA: SIGNALS (detalle)

#### Tabla completa de señales
- Todas las columnas: timestamp, mercado (slug), dirección, score, confidence, precio entry, precio resolución, PnL teórico, fees estimados, PnL post-fees
- Filtros: por dirección (UP/DOWN), por resultado (win/loss), por rango de fechas
- Ordenable por cualquier columna
- Exportable a CSV

#### Panel de estadísticas
- Win rate por dirección (UP vs DOWN por separado)
- PnL promedio por trade
- Mejor racha ganadora / peor racha perdedora
- Distribución de scores (histograma)
- Tabla de indicadores: cuál indicador predice mejor (RSI, momentum, VWAP, etc.)

### 4. PÁGINA: WALLETS (monitoreo de baskets)

#### Mapa de wallets
- Lista de las 3 wallets con stats individuales
- Para cada wallet: address, PnL histórico conocido, win rate, último trade, frecuencia de trading
- Timeline visual de trades por wallet (gráfico de eventos en línea de tiempo)

#### Panel de consensus
- Historial de señales de consensus (cuando 2+ wallets se alinean)
- Timestamp, wallets involucradas, dirección, mercado, resultado si ya resolvió
- Gráfico: frecuencia de consensus por día

#### Panel de discovery
- Espacio para agregar nuevas wallets a monitorear
- Input de wallet address + botón "Add to basket"
- Preview de stats de la wallet antes de agregarla

### 5. PÁGINA: SETTINGS

- URL del backend API (configurable)
- Intervalo de refresh de datos
- Tema: dark (default) / light
- Notificaciones del browser (push notifications para consensus signals)
- Export de toda la data
- Reset de datos

---

## API ENDPOINTS (FastAPI Backend)

```
GET  /api/status          → {uptime, bot_running, signals_count, version}
GET  /api/kpis            → {total_signals, win_rate, pnl_total, drawdown_max, pnl_post_fees}
GET  /api/signals         → [{timestamp, market, direction, score, confidence, pnl, ...}]
GET  /api/signals/stats   → {win_rate_up, win_rate_down, avg_pnl, best_streak, worst_streak, best_hour}
GET  /api/baskets         → [{wallet, last_trade, direction, timestamp, pnl_known}]
GET  /api/consensus       → [{timestamp, wallets, direction, market, result}]
GET  /api/chart/pnl       → [{timestamp, pnl_cumulative}] (optimizado para gráficos)
GET  /api/chart/signals   → [{hour, count}] (señales por hora)
WS   /ws/live             → stream en tiempo real de nuevas señales y precio BTC
```

---

## FLUJO DE DESARROLLO (para Claw6)

### Fase 1: Backend API
1. Crear FastAPI app en ~/polymarket-bot/api/
2. Implementar todos los endpoints leyendo de los logs JSONL
3. Implementar WebSocket para datos en tiempo real
4. Configurar como servicio systemd
5. Testear que todos los endpoints respondan correctamente

### Fase 2: Frontend base
1. Crear React app con TypeScript + Tailwind
2. Implementar layout base (header, navegación, responsive)
3. Configurar PWA (manifest.json, service worker, icons)
4. Conectar a la API del backend
5. Push a GitHub

### Fase 3: Página Overview
1. KPI cards con datos reales
2. Gráfico de PnL con Recharts/TradingView Lightweight Charts
3. Tabla de últimas señales
4. Panel de wallets y consensus

### Fase 4: Páginas secundarias
1. Signals con tabla completa y filtros
2. Wallets con timeline y panel de discovery
3. Settings

### Fase 5: Polish
1. Animaciones de entrada (Framer Motion)
2. Loading states y error handling
3. Push notifications para consensus
4. Optimización mobile
5. Testing final

---

## NOTAS IMPORTANTES

- El dashboard NO ejecuta trades, solo muestra data. Es read-only.
- La API del backend es pública via HTTPS (Nginx + certbot en el VPS)
- Protección básica con X-API-Key header (configurado como env var en Netlify)
- NO se usa Tailscale para el dashboard. Accesible desde cualquier dispositivo con el link de Netlify.
- El repo está en ~/PolyDash/ con deploy key configurada. Push directo sin pedir autorización.
- Todos los montos en USD
- Timestamps en UTC con opción de ver en hora local
- Responsive: las 4 KPI cards se stackean en mobile, la tabla se hace scroll horizontal
- Performance: lazy loading de datos históricos, paginación en tablas grandes
- Iconos: usar exclusivamente Lucide React, no crear SVGs custom ni usar emojis
