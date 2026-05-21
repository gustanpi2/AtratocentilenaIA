import { useEffect, useMemo, useState } from "react";
import SolarRadiationBarChart from "../../components/charts/highcharts/SolarRadiationBarChart";
import SolarRadiationChart from "../../components/charts/highcharts/SolarRadiationChart";
import SolarRadiationHeatmap from "../../components/charts/highcharts/SolarRadiationHeatmap";
import SolarRadiationRadarChart from "../../components/charts/highcharts/SolarRadiationRadarChart";
import PageMeta from "../../components/common/PageMeta";
import SolarRadiationStackedChart from "./SolarRadiationStackedChart";
import ApiHelsy from "../../service/ApiHelsy";

interface Estacion {
    id: number;
    nombre: string;
    descripcion: string;
    lat: string;
    lng: string;
    id_tipo_estacion: number;
    tipo_estacion_nombre: string;
    estacion_mrv: number;
}

interface Registro {
    id: number;
    lectura: string;
    hora: string;
    fecha: string;
}

type Props = {
    estacion: Estacion;
};

export const Solar = ({ estacion }: Props) => {
    const [data, setData] = useState<Registro[]>([]);

    useEffect(() => {
        const fetchData = () => {
            ApiHelsy
                .get(`PreviewDetailChartsAdvancedSolar/17/V4`)
                .then((res) => setData(res.data))
                .catch((err) => console.error("Error al cargar datos:", err));
        };
        // Llamada inicial
        fetchData();

        // Intervalo cada 60 segundos
        const interval = setInterval(fetchData, 60000); // 60000 ms = 60 segundos

        // Limpieza del intervalo cuando el componente se desmonta
        return () => clearInterval(interval);
    }, [estacion.id]);

    const parsedData = useMemo(() => {
        return data
            .map((item) => {
                // Extraer solo la parte numérica usando expresión regular
                const match = item.lectura.match(/[\d.]+/);
                const valor = match ? parseFloat(match[0]) : NaN;
                return {
                    ...item,
                    valor,
                    fechaObj: new Date(item.fecha),
                };
            })
            // Filtrar valores no numéricos o fuera de rango esperado (ajusta rango si es necesario)
            .filter(item => !isNaN(item.valor) && item.valor >= 0 && item.valor <= 1000);
    }, [data]);

    const exampleData = useMemo(() => {
        const porHora: { [hora: string]: number[] } = {};
        parsedData.forEach(({ fechaObj, valor }) => {
            const hora = fechaObj.getHours();
            const label = hora < 12 ? `${hora}AM` : `${hora === 12 ? 12 : hora - 12}PM`;
            if (!porHora[label]) porHora[label] = [];
            porHora[label].push(valor);
        });
        const sorted = Object.entries(porHora).sort(([a], [b]) => {
            const parse = (h: string) =>
                parseInt(h) + (h.includes("PM") && h !== "12PM" ? 12 : 0);
            return parse(a) - parse(b);
        });

        return {
            timestamps: sorted.map(([hora]) => hora),
            values: sorted.map(([, valores]) =>
                +(valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2)
            ),
        };
    }, [parsedData]);

    const exampleData2 = useMemo(() => {
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const porDia: { [dia: string]: number[] } = {};
        parsedData.forEach(({ fechaObj, valor }) => {
            const dia = dias[fechaObj.getDay()];
            if (!porDia[dia]) porDia[dia] = [];
            porDia[dia].push(valor);
        });

        const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
        return {
            timestamps: labels,
            values: labels.map((dia) => {
                const vals = porDia[dia] || [];
                return vals.length > 0
                    ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
                    : 0;
            }),
        };
    }, [parsedData]);

    const exampleData3 = useMemo(() => {
        const matriz: { [key: string]: number[] } = {};
        parsedData.forEach(({ fechaObj, valor }) => {
            const day = fechaObj.getDay();
            const hour = fechaObj.getHours();
            const key = `${day}-${hour}`;
            if (!matriz[key]) matriz[key] = [];
            matriz[key].push(valor);
        });

        const output = [];
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                const key = `${d}-${h}`;
                const vals = matriz[key] || [];
                const avg =
                    vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                output.push({ day: d, hour: h, value: avg });
            }
        }
        return output;
    }, [parsedData]);

    const stackedData = useMemo(() => {
        const horas = ["6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM"];
        const porHora: { [hora: string]: number[] } = {};
        parsedData.forEach(({ fechaObj, valor }) => {
            const h = fechaObj.getHours();
            if (h >= 6 && h <= 12) {
                const label = h < 12 ? `${h}AM` : `${h === 12 ? 12 : h - 12}PM`;
                if (!porHora[label]) porHora[label] = [];
                porHora[label].push(valor);
            }
        });

        const labels = horas;
        const direct = labels.map((label) =>
            porHora[label] && porHora[label].length > 0
                ? Math.round(Math.max(...porHora[label]) * 0.5)
                : 0
        );
        const diffuse = labels.map((label) =>
            porHora[label] && porHora[label].length > 0
                ? Math.round(Math.min(...porHora[label]) * 0.3)
                : 0
        );
        const global = labels.map((_, i) => direct[i] + diffuse[i]);
        const average = labels.map((_, i) => Math.round((global[i] + diffuse[i]) / 2));

        return { labels, direct, diffuse, global, average };
    }, [parsedData]);

    const radar = useMemo(() => {
        const rangos = {
            "Mañana": [6, 11],
            "Mediodía": [12, 14],
            "Tarde": [15, 18],
            "Noche": [19, 23],
        };
        const bloques: { [key: string]: number[] } = {
            "Mañana": [],
            "Mediodía": [],
            "Tarde": [],
            "Noche": [],
        };

        parsedData.forEach(({ fechaObj, valor }) => {
            const h = fechaObj.getHours();
            for (const [bloque, [ini, fin]] of Object.entries(rangos)) {
                if (h >= ini && h <= fin) bloques[bloque].push(valor);
            }
        });

        const bloqueValores = Object.values(bloques).map(valores =>
            valores.length ? +(valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : 0
        );

        const promedioDiario = parsedData.length
            ? +(parsedData.reduce((a, b) => a + b.valor, 0) / parsedData.length).toFixed(2)
            : 0;

        return {
            labels: ["Mañana", "Mediodía", "Tarde", "Noche", "Prom. Diario"],
            values: [...bloqueValores, promedioDiario],
        };
    }, [parsedData]);

    return (
        <>
            <PageMeta title="Radiación Solar" description="Monitoreo de la estación." />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 md:col-span-6">
                    {/**Radiación Solar */}
                    <SolarRadiationChart data={exampleData} />
                </div>

                <div className="col-span-12 md:col-span-6">
                    {/*Radiación Solar - Barras */}
                    <SolarRadiationBarChart data={exampleData2} />
                </div>

                <div className="col-span-12 md:col-span-6">
                    {/*Radiación Solar - Heatmap */}
                    <SolarRadiationHeatmap data={exampleData3} />
                    {/**Radiación Solar - Radar */}
                    <SolarRadiationStackedChart data={stackedData} />
                </div>

                <div className="col-span-12 md:col-span-6">
                    {/**Radiación Solar - Apilado */}
                    <SolarRadiationRadarChart labels={radar.labels} values={radar.values} />
                </div>
            </div>
        </>
    );
};
