import { CopyrightFooter } from "../sections/CopyrightFooter";
import { FileDrag } from "../sections/FileDrag";
import { Hero } from "../sections/Hero";
import HeroImg from "@assets/svg/heroImg.svg";
export function LandPage() {
  return (
    <>
      <Hero
        title={
          "Analizador de conversaciones de WhatsApp para textos, audios e imágenes"
        }
        paragraph={
          "Identifica categorias de interes, temas y posibles incidencias de comportamientos o de relevancia en las conversaciones de whatsapp y recibe reportes retroalimentativos"
        }
        image={HeroImg}
      />
      <FileDrag />
      <CopyrightFooter />
    </>
  );
}
