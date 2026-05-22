export type SimPhase = "normal" | "tormenta" | "colapso" | "alerta";
export type AlertLevel = 0 | 20 | 40 | 60 | 80 | 100;

export interface SimState {
  phase: SimPhase;
  waterLevel: number;
  rainIntensity: number;
  internetOn: boolean;
  powerOn: boolean;
  cellOn: boolean;
  sensorOnline: boolean;
  alarmActive: boolean;
  alertLevel: AlertLevel;
  riverSpeed: number;
}

export const DEFAULT_SIM: SimState = {
  phase: "normal",
  waterLevel: 20,
  rainIntensity: 0,
  internetOn: true,
  powerOn: true,
  cellOn: true,
  sensorOnline: true,
  alarmActive: false,
  alertLevel: 0,
  riverSpeed: 1,
};
