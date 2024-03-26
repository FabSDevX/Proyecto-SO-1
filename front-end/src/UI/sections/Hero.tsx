import HeroImg from "@assets/svg/heroImg.svg";
import "./Hero.css"

export function Hero() {
  return (
    <section className="hero-container">
      <div className="hero-left">
        <h1>
          Analizador de conversaciones de WhatsApp para textos, audios e
          imágenes
        </h1>
        <p>
          Identifica categorias de interes, temas y posibles incidencias de
          comportamientos o de relevancia en las conversaciones de whatsapp y
          recibe reportes retroalimentativos
        </p>
      </div>
      <div className="hero-right">
          <img src={HeroImg} alt="Whatsapp analysis image" />
      </div>
    </section>
  );
}
