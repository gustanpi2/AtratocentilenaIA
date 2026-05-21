import PageMeta from "../../components/common/PageMeta";
import { GoogleMapComponent } from "./GoogleMapComponent";


export default function Maps() {
  return (
    <>
      <PageMeta
        title="Mapa Hidrológico — AtratoCentinela AI"
        description="Red de monitoreo ambiental del Chocó Biogeográfico"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 h-[80vh]">
          <GoogleMapComponent />
        </div>
      </div>
    </>
  );
}
