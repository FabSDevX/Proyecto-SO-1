import { CopyrightFooter } from "../sections/CopyrightFooter";
import { FileDrag } from "../sections/FileDrag";
import { Hero } from "../sections/Hero";
import HeroImg from "@assets/svg/heroImg.svg";
import { useEffect } from "react";
import { askNotificationPermission } from "../../utils/notifications/notification";
export function LandPage() {
  useEffect(()=>{
    askNotificationPermission();
  },[])
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
