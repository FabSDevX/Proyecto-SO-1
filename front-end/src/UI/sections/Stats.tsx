import "./Stats.css";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";

interface StatsProps {
  chat: File[];
  imgs: File[];
  audios: File[];
}

export const Stats: React.FC<StatsProps> = ({ chat, imgs, audios }) => {
  const [selectedOption, setSelectedOption] =
    useState<string>("Conversaciones");
    // const [textResult, setTextResult] = useState<string>('');
    // const [audioResult, setAudioResult] = useState<string>('');
    // const [imgsResult, setImgsResult] = useState<string>('');
  const [chartData, setChartData] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const SERVER_IP = "http://192.168.1.188";

  useEffect(() => {
      textAnalysis();
    //   audioAnalysis();
    // imagsAnalysis();
  }, []);

  const processData = (data: any) => {
    const categories = Object.keys(data).map(function (clave) {
      return clave;
    });
    const confidence = Object.keys(data).map(function (clave) {
      return data[clave];
    });

    setChartData({ categories, confidence });
  };
  async function obtainPlainTextPromise(promise: Promise<string>) {
    try {
      const result = await promise;
      return result;
    } catch (error) {
      console.error("Critical Error obtaining promise:", error);
    }
  }

  async function textAnalysis() {
    if (chat != null && chat != undefined && chat.length > 0) {
      const promise = chat[0].text();
      const text = await obtainPlainTextPromise(promise);
      try {
        const response = await fetch(`${SERVER_IP}:5000/api/classify`, {
          method: "POST",
          body: JSON.stringify({
            text: text,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          processData(data);
          //    setTextResult(data)
        } else {
          console.error("Request error:", response.status);
        }
      } catch (error) {
        console.error("Process request error:", error);
      }
    }
  }

  async function genericTextAnalysis(description: string) {
    try {
      const response = await fetch(`${SERVER_IP}:5000/api/classify`, {
        method: "POST",
        body: JSON.stringify({
          text: description,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error("Request error:", response.status);
      }
    } catch (error) {
      console.error("Process request error:", error);
    }
  }

  async function audioAnalysis() {
    if (audios != null && audios != undefined && audios.length > 0) {
      const formData = new FormData();
      audios.forEach((audio: File) => {
        formData.append("audio_file", audio);
      });
      try {
        const response = await fetch(`${SERVER_IP}:5001/api/transcribe`, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          const result = await genericTextAnalysis(data.transcript);
          processData(result);
          //   setAudioResult(result)
        } else {
          console.error("Request error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  async function imagsAnalysis() {
    if (imgs != null && imgs != undefined && imgs.length > 0) {
      const formData = new FormData();
      imgs.forEach((img: File) => {
        formData.append("image", img);
      });
      try {
        const response = await fetch(
          `${SERVER_IP}:5002/api/upload_and_describe_image`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (response.ok) {
          const data = await response.json();
          
          const result = await genericTextAnalysis(data.description);
          console.log(result)
          processData(result);
          // setImgsResult(result)
        } else {
          console.error("Request error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  const handleNavOption = async (identifier: string): Promise<void> => {
    setSelectedOption(identifier);
    
    // Llamar a las funciones de análisis correspondientes según la opción seleccionada
    switch (identifier) {
      case "Conversaciones":
        textAnalysis();
        break;
      case "Audios":
        audioAnalysis();
        break;
      case "Imagenes":
        imagsAnalysis();
        break;
      case "Todos":
        // Aquí puedes agregar lógica adicional si necesitas manejar la opción "Todos"
        break;
      default:
        break;
    }
  };
  

  return (
    <section className="stats-section">
      <div className="container">
        <ul className="lateral-navigation">
          <li>
            <a
              className={selectedOption === "Conversaciones" ? "selected" : ""}
              onClick={() => handleNavOption("Conversaciones")}
            >
              Conversaciones
            </a>
          </li>
          <li>
            <a
              className={selectedOption === "Audios" ? "selected" : ""}
              onClick={() => handleNavOption("Audios")}
            >
              Audios
            </a>
          </li>
          <li>
            <a
              className={selectedOption === "Imagenes" ? "selected" : ""}
              onClick={() => handleNavOption("Imagenes")}
            >
              Imagenes
            </a>
          </li>
          <li>
            <a
              className={selectedOption === "Todos" ? "selected" : ""}
              onClick={() => handleNavOption("Todos")}
            >
              Todos
            </a>
          </li>
        </ul>
        <div className="stats-container">
          {chartData.categories.length > 0 &&
          chartData.confidence.length > 0 ? (
            <BarChart
              xAxis={[
                {
                  id: "barCategories",
                  data: chartData.categories,
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: chartData.confidence,
                },
              ]}
              width={600}
              height={500}
            />
          ) : (
            <p>No hay datos disponibles para mostrar.</p>
          )}
        </div>
      </div>
    </section>
  );
};
