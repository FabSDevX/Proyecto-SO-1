import "./Stats.css";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from '@mui/x-charts/PieChart';

interface StatsProps {
  chat: File[];
  imgs: File[];
  audios: File[];
}

export const Stats: React.FC<StatsProps> = ({ chat, imgs, audios }) => {
  const [selectedAnalysisOption, setSelectedAnalysisOption] =
    useState<string>("Conversaciones");
  const [selectedGraphOption, setSelectedGraphOption] =
    useState<string>("Barras");
  const [textResult, setTextResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const [audioResult, setAudioResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const [imgsResult, setImgsResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const [chartResult, setChartResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const SERVER_IP = "http://192.168.20.88";
  //192.168.20.88 GANTE
  //192.168.1.188 CASA
  useEffect(() => {
    textAnalysis();
    imagsAnalysis();
    audioAnalysis();
  }, []);

  useEffect(() => {
    if (
      selectedAnalysisOption === "Conversaciones" &&
      textResult.categories.length > 0
    ) {
      handleNavAnalysisOption("Conversaciones");
    }
  }),
    textResult;

  const processData = (data: any, analysis: string) => {
    const categories = Object.keys(data).map(function (clave) {
      return clave;
    });
    const confidence = Object.keys(data).map(function (clave) {
      return data[clave];
    });
    switch (analysis) {
      case "text":
        console.log("texto");
        setTextResult({ categories, confidence });
        break;
      case "audio":
        console.log("audio");
        setAudioResult({ categories, confidence });
        break;
      case "img":
        console.log("imgs");
        setImgsResult({ categories, confidence });
        break;
    }
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
          processData(data, "text");
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
        const result = await response.json();
        console.log(result);
        return result;
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
          console.log(result);
          processData(result, "audio");
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
          console.log(result);
          processData(result, "img");
        } else {
          console.error("Request error:", response.status, response.body);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  const handleNavAnalysisOption = async (identifier: string): Promise<void> => {
    setSelectedAnalysisOption(identifier);
    switch (identifier) {
      case "Conversaciones":
        setChartResult(textResult);
        break;
      case "Audios":
        setChartResult(audioResult);
        break;
      case "Imagenes":
        setChartResult(imgsResult);
        break;
      case "Todos":
        setChartResult({ categories: [], confidence: [] });
        break;
      default:
        break;
    }
  };

  const handleNavGraphOption = async (identifier: string): Promise<void> => {
    setSelectedGraphOption(identifier);
  };

  return (
    <section className="stats-section">
      <div className="container">
        <ul className="lateral-navigation">
          <li>
            <a
              className={
                selectedAnalysisOption === "Conversaciones" ? "selected" : ""
              }
              onClick={() => handleNavAnalysisOption("Conversaciones")}
            >
              Conversaciones
            </a>
          </li>
          <li>
            <a
              className={selectedAnalysisOption === "Audios" ? "selected" : ""}
              onClick={() => handleNavAnalysisOption("Audios")}
            >
              Audios
            </a>
          </li>
          <li>
            <a
              className={
                selectedAnalysisOption === "Imagenes" ? "selected" : ""
              }
              onClick={() => handleNavAnalysisOption("Imagenes")}
            >
              Imagenes
            </a>
          </li>
          <li>
            <a
              className={selectedAnalysisOption === "Todos" ? "selected" : ""}
              onClick={() => handleNavAnalysisOption("Todos")}
            >
              Todos
            </a>
          </li>
        </ul>
        <div className="stats-container">
          {chartResult.categories.length > 0 &&
          chartResult.confidence.length > 0 ? (
            selectedGraphOption === "Barras" ? (
              <BarChart
                xAxis={[
                  {
                    id: "barCategories",
                    data: chartResult.categories,
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: chartResult.confidence,
                  },
                ]}
                width={600}
                height={500}
              />
            ) : (
              <PieChart
                series={[
                  {
                    data: chartResult.confidence.map((value, index) => ({
                      id: index,
                      value: value,
                      label: chartResult.categories[index], 
                    })),
                  },
                ]}
                width={450}
                height={300}
              />
            )
          ) : (
            <p className="stats-paragraph">
              No hay datos disponibles para mostrar para{" "}
              {selectedAnalysisOption}.
            </p>
          )}
        </div>
        <ul className="lateral-right-navigation">
          <li>
            <a
              className={
                selectedGraphOption === "Barras" ? "selectedGraph" : ""
              }
              onClick={() => handleNavGraphOption("Barras")}
            >
              Barras
            </a>
          </li>
          <li>
            <a
              className={
                selectedGraphOption === "Pastel" ? "selectedGraph" : ""
              }
              onClick={() => handleNavGraphOption("Pastel")}
            >
              Pastel
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};
