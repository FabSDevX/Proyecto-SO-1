import "./Hero.css"

interface HeroProps {
  title: string;
  paragraph: string;
  image: string;
}

export const Hero: React.FC<HeroProps> = ({ title, paragraph, image }) => {
  return (
    <section className="hero-container">
      <div className="hero-left">
        <h1>{title}</h1>
        <p>{paragraph}</p>
      </div>
      <div className="hero-right">
        <img src={image} alt="Whatsapp analysis image" />
      </div>
    </section>
  );
};
