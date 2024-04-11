import { useLocation } from "react-router-dom";
import { Hero } from "../sections/Hero";
import { CopyrightFooter } from "../sections/CopyrightFooter";
import ReportsImg from "@assets/reports.webp";
import { Stats } from "../sections/Stats";

export function Reports() {
  const location = useLocation();
  const { chatData, imgData, audioData } = location.state;
  return (
    <>
    <div style={{minWidth:"622px"}}>
      <Hero
        title={"Reportes del analisis"}
        paragraph={
          "A continuación se muestra el analisis de clasificador de categorias de interes, temas y posibles incidencias de comportamientos o de relevancia en las conversaciones, imagenes y audios.Se muestra un top 3 de categorias obtenidas por apartado analizado, conversaciones, audios, imagenes, todos juntos"
        }
        image={ReportsImg}
        />
      <Stats
        chat={chatData}
        imgs={imgData}
        audios={audioData}
        />
      <CopyrightFooter />
    </div>
    </>
  );
}
