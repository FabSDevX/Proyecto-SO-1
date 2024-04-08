import "./Stats.css";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarLoader } from "react-spinners";
import { sentNotificationMessage } from "../../utils/notifications/notification";


interface StatsProps {
  chat: File[];
  imgs: File[];
  audios: File[];
}

export const Stats: React.FC<StatsProps> = ({ chat, imgs, audios }) => {
  let building_text = ""
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
  const [todosResult, setTodosResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const [chartResult, setChartResult] = useState<{
    categories: string[];
    confidence: number[];
  }>({ categories: [], confidence: [] });
  const SERVER_IP = "http://192.168.1.127";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [textAnalysisComplete, setTextAnalysisComplete] =
    useState<boolean>(false);
  const [audioAnalysisComplete, setAudioAnalysisComplete] =
    useState<boolean>(false);
  const [imageAnalysisComplete, setImageAnalysisComplete] =
    useState<boolean>(false);
  const [todosAnalysisComplete, setTodosAnalysisComplete] =
    useState<boolean>(false);

  //192.168.20.88 GANTE
  //192.168.1.188 CASA
  useEffect(() => {
    setIsLoading(true);
    console.log("Starting analysis...");

    /*
    Server client multiproccesing stage
    */
    Promise.all([textAnalysis(), audioAnalysis(), imagsAnalysis()])
      .then(() => {
        todoAnalysis(building_text);
        setIsLoading(false);
        console.log("All analysis completed.");
      })
      .catch((error) => {
        console.error("Error during analysis:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (
      textAnalysisComplete &&
      audioAnalysisComplete &&
      imageAnalysisComplete &&
      todosAnalysisComplete
    ) {
      sentNotificationMessage();
      setIsLoading(false);
    }
  }, [audioAnalysisComplete, imageAnalysisComplete, textAnalysisComplete, todosAnalysisComplete]);

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
      case "todos":
        console.log("todos");
        setTodosResult({ categories, confidence });
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
          building_text += text +  ","
          processData(data, "text");
          setTextAnalysisComplete(true);
        } else {
          console.error("Request error:", response.status);
        }

        const moderationAlert = await fetch(`${SERVER_IP}:5000/api/moderate`, {
          method: "POST",
          body: JSON.stringify({
            text: text,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        });

        if(moderationAlert.ok){
          
          const moderationData = await moderationAlert.json();

          const threshold = 0.90;

          const categoriesToCheck = ['Illicit Drugs', 'Firearms & Weapons', 'Sexual', 'War & Conflict'];

          type moderationType = {
            [key: string]: string[]; // Cada propiedad será una categoría con una lista de palabras detectadas
          };

          const moderationJSON:moderationType = {};

          categoriesToCheck.forEach(async category => {
            if (moderationData[category] > threshold) {
              // Llamar a la función para detectar palabras definidas para esta categoría
              const detectionResult = await detectCategoryWords(text, category);
              moderationJSON[category] = detectionResult;
              
            }
          });
          console.log(moderationJSON);
        }

      } catch (error) {
        console.error("Process request error:", error);
      }
    } else {
      setTextAnalysisComplete(true);
    }
  }

  async function detectCategoryWords(text: string|undefined, category:string) {
    if (text === undefined) {
      console.error('Error: El texto es undefined.');
      return [];
    }

    const illicitDrugs=  ['droga', 'narcótico', 'estupefaciente', 'cocaína', 'cocaina', 'marihuana', 'cannabis', 'heroína', 'opio', 'crack',
                          'metanfetamina', 'LSD', 'éxtasis', 'extasis', 'anfetamina', 'MDMA', 'PCP', 'alucinógeno', 'alucinogeno', 'psicodélico',
                          'psicodelico', 'hachís', 'hierba', 'porro', 'pastilla', 'speed', 'perico', 'ácido', 'acido', 'basuco', 'piedra', 'yerba',
                          'cogollo', 'fumar', 'inhalar', 'drogadicción', 'drogadiccion', 'adicción', 'adiccion', 'traficante', 'narcotráfico', 'narcotrafico',
                          'distribuidor', 'dealer', 'narcotraficante', 'narco', 'cartel', 'contrabando', 'clandestino', 'adicto', 'drogodependiente',
                          'consumo', 'dosis', 'drogarse', 'drogando', 'sobredosis', 'síndrome de abstinencia', 'hachis'];

    const gunsWeapons = ['arma', 'arma de fuego', 'pistola', 'revólver', 'rifle', 'escopeta', 'fusil', 'metralleta', 'ametralladora',
                        'subfusil', 'munición', 'municion', 'bala', 'cartucho', 'cargador', 'gatillo', 'cañón', 
                        'cañon', 'culata', 'mira', 'silenciador', 'corredera', 'recámara', 'recamara', 'fusil de asalto', 'ak-47',
                        'ar-15', 'uzi', 'beretta', 'glock', 'colt', 'smith & wesson', 'browning', 'winchester', 'wossberg', 
                        'heckler & koch', 'desert eagle', 'disparan', 'calibre', 'balística','balistica', 'municionar', 'recargar',
                        'disparar', 'balacera', 'tiroteo', 'armamento', 'militar', 'policía', 'policia', 'delito armado',
                        'contrabando de armas', 'contrabando', 'tráfico de armas', 'tráfico', 'trafico',
                        'venta ilegal de armas', 'posesión ilegal de armas', 'posesion ilegal de armas', 'revolver', 'delito']                      

    const relevantWords: string[] = []

    switch(category)
    {
      case 'Illicit Drugs':
        {
          illicitDrugs.forEach(word => {
            if(text.toLowerCase().includes(word)){
              console.log(word)
              relevantWords.push(word);
            }
          })
          break;
        }
      case 'Firearms & Weapons':
        {
          gunsWeapons.forEach(word => {
            if(text.toLowerCase().includes(word)){
              console.log(word)
              relevantWords.push(word);
            }
          })
          break;
        }
    }
    return relevantWords;
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

  async function todoAnalysis(text : string){
    const result = await genericTextAnalysis(text);
    console.log(text);
    processData(result, "todos");
    setTodosAnalysisComplete(true);
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
          building_text += data.transcript + ","
          processData(result, "audio");
          setAudioAnalysisComplete(true);
        } else {
          console.error("Request error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      setAudioAnalysisComplete(true);
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
          building_text += data.description + ","
          processData(result, "img");
          setImageAnalysisComplete(true);
        } else {
          console.error("Request error:", response.status, response.body);
        }


        
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      setImageAnalysisComplete(true);
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
        setChartResult(todosResult);
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
      {isLoading ? (
        <>
          <div className="loading-section">
            <p>Procesando datos</p>
            <img
              src="https://1.bp.blogspot.com/-DtWoCh9wbyM/YT4tnJ-NHTI/AAAAAAAAP54/UKIWmZQcGLQxm94xG7QnoRoIHVNE20u9ACLcBGAsYHQ/s300/animated-waiting.gif"
              alt="Waiting gif"
            />
            <BarLoader width={200} height={5} color="#36d7b7" />
          </div>
        </>
      ) : (
        <>
          <div className="container">
            <ul className="lateral-navigation">
              <li>
                <a
                  className={
                    selectedAnalysisOption === "Conversaciones"
                      ? "selected"
                      : ""
                  }
                  onClick={() => handleNavAnalysisOption("Conversaciones")}
                >
                  Conversaciones
                </a>
              </li>
              <li>
                <a
                  className={
                    selectedAnalysisOption === "Audios" ? "selected" : ""
                  }
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
                  className={
                    selectedAnalysisOption === "Todos" ? "selected" : ""
                  }
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
        </>
      )}
    </section>
  );
};
