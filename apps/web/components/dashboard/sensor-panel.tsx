import { Activity, CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

import type { ClimateData, NasaDay, SensorReading } from "@/lib/censo-api";

import { SensorSimulateButton } from "./sensor-simulate-button";

function fmt(v: number | null, decimals = 1): string {
  return v == null ? "—" : v.toFixed(decimals);
}

function ReadingCard({ r }: { r: SensorReading }) {
  return (
    <div className="sensor-reading-card">
      <div className="sensor-reading-card__header">
        <span className="sensor-station">{r.station_id}</span>
        <span className="sensor-time">{r.recorded_at.slice(0, 16).replace("T", " ")}</span>
      </div>
      <div className="sensor-reading-card__grid">
        <div className="sensor-metric">
          <Thermometer size={13} />
          <span>{fmt(r.temp_aire)} °C</span>
          <small>Aire</small>
        </div>
        <div className="sensor-metric">
          <Droplets size={13} />
          <span>{fmt(r.humedad)} %</span>
          <small>Humedad</small>
        </div>
        <div className="sensor-metric">
          <Thermometer size={13} />
          <span>{fmt(r.temp_suelo)} °C</span>
          <small>Suelo</small>
        </div>
        <div className="sensor-metric">
          <Activity size={13} />
          <span>pH {fmt(r.ph_suelo)}</span>
          <small>Suelo</small>
        </div>
        <div className="sensor-metric">
          <CloudRain size={13} />
          <span>{fmt(r.lluvia_mm, 0)} mm</span>
          <small>Lluvia</small>
        </div>
      </div>
    </div>
  );
}

function ClimateRow({ d }: { d: NasaDay }) {
  const date = `${d.date.slice(0, 4)}-${d.date.slice(4, 6)}-${d.date.slice(6)}`;
  return (
    <tr>
      <td className="sensor-td">{date}</td>
      <td className="sensor-td sensor-td--num">{d.t2m_max.toFixed(1)}°</td>
      <td className="sensor-td sensor-td--num">{d.t2m_min.toFixed(1)}°</td>
      <td className="sensor-td sensor-td--num">{d.rh2m.toFixed(0)}%</td>
      <td className="sensor-td sensor-td--num">{d.prectotcorr.toFixed(1)}</td>
    </tr>
  );
}

type Props = {
  readings: SensorReading[];
  climate: ClimateData | null;
  loteId?: number;
};

export function SensorPanel({ readings, climate, loteId }: Props) {
  const stationId = loteId ? `finca-${String(loteId).padStart(2, "0")}` : "finca-demo";

  return (
    <div className="sensor-panel">
      <div className="sensor-section">
        <div className="sensor-section__header">
          <p className="sensor-section__title">
            <Wind size={14} />
            Sensores IoT
          </p>
          <SensorSimulateButton stationId={stationId} loteId={loteId} />
        </div>

        {readings.length === 0 ? (
          <p className="sensor-empty">Sin lecturas. Simulá la primera con el botón.</p>
        ) : (
          <div className="sensor-readings">
            {readings.slice(0, 3).map((r) => (
              <ReadingCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>

      {climate && climate.days.length > 0 && (
        <div className="sensor-section">
          <div className="sensor-section__header">
            <p className="sensor-section__title">
              <CloudRain size={14} />
              Clima satelital · NASA POWER
            </p>
          </div>
          <p className="sensor-nasa-note">
            Lat {climate.lat.toFixed(2)}, Lon {climate.lon.toFixed(2)} · {climate.days.length} días reales
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="sensor-table">
              <thead>
                <tr>
                  <th className="sensor-th">Fecha</th>
                  <th className="sensor-th sensor-th--num">Tmáx</th>
                  <th className="sensor-th sensor-th--num">Tmín</th>
                  <th className="sensor-th sensor-th--num">HR%</th>
                  <th className="sensor-th sensor-th--num">mm</th>
                </tr>
              </thead>
              <tbody>
                {climate.days.slice(-7).map((d) => (
                  <ClimateRow key={d.date} d={d} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!climate && (
        <p className="sensor-nasa-note">Clima satelital no disponible.</p>
      )}
    </div>
  );
}
