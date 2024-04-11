import "./Stats.css";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarLoader } from "react-spinners";
import { sentNotificationMessage } from "../../utils/notifications/notification";
import {
  audioAnalysisApi,
  textAnalysisApi,
  videoAnalysisApi,
} from "../../utils/apis/apisAnalysisCalls";
import { categoriesToCheck } from "../../utils/globalVariables";
import {
  detectCategoryWords,
  obtainPlainTextPromise,
} from "../../utils/utilFunctions";
import { contentModerationApi } from "../../utils/apis/apisModerateResultsCalls";
import { Data, moderationType } from "../../types/types";
import alarm from "@assets/alarm.png";
import { AlertModal } from "../modals/alertModal";

interface StatsProps {
  chat: File[];
  imgs: File[];
  audios: File[];
}

export const Stats: React.FC<StatsProps> = ({ chat, imgs, audios }) => {
  let building_text = "";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [textAnalysisComplete, setTextAnalysisComplete] =
    useState<boolean>(false);
  const [audioAnalysisComplete, setAudioAnalysisComplete] =
    useState<boolean>(false);
  const [imageAnalysisComplete, setImageAnalysisComplete] =
    useState<boolean>(false);
  const [todosAnalysisComplete, setTodosAnalysisComplete] =
    useState<boolean>(false);
  const [textAlert, setTextAlert] = useState<boolean>(false);
  const [audioAlert, setAudioAlert] = useState<boolean>(false);
  const [imageAlert, setImageAlert] = useState<boolean>(false);
  const [todosAlert, setTodosAlert] = useState<boolean>(false);
  const [textModeration, setTextModeration] = useState<moderationType>();
  const [audioModeration, setAudioModeration] = useState<moderationType>();
  const [imageModeration, setimageModeration] = useState<moderationType>();
  const [showModal, setShowModal] = useState(false);
  const [alertReasons, setAlertReasons] = useState<{ option: string; category: string; words: moderationType[] }[]>([]);
  

  useEffect(() => {
    const start = Date.now();
    setIsLoading(true);
    console.log("Starting analysis...");

    /*
    Server client multiproccesing stage
    */
    Promise.all([textAnalysis(), audioAnalysis(), imagsAnalysis()])
      .then(() => {
        todoAnalysis(building_text);
        setIsLoading(false);
        const millis = Date.now() - start;
        console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
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
  }, [
    audioAnalysisComplete,
    imageAnalysisComplete,
    textAnalysisComplete,
    todosAnalysisComplete,
  ]);

  useEffect(() => {
    if (
      selectedAnalysisOption === "Conversaciones" &&
      textResult.categories.length > 0
    ) {
      handleNavAnalysisOption("Conversaciones");
    }
  }), textResult;
  const processData = (data: Data , analysis: string) => {
    const categories = Object.keys(data).map(function (clave) {
      return clave;
    });
    const confidence = Object.keys(data).map(function (clave) {
      return data[clave];
    });
    switch (analysis) {
      case "text":
        setTextResult({ categories, confidence });
        break;
      case "audio":
        setAudioResult({ categories, confidence });
        break;
      case "img":
        setImgsResult({ categories, confidence });
        break;
      case "todos":
        setTodosResult({ categories, confidence });
        break;
    }
  };

  async function textAnalysis() {
    if (chat != null && chat != undefined && chat.length > 0) {
      const promise = chat[0].text();
      const text: string | undefined = await obtainPlainTextPromise(promise);
      try {
        const data = await textAnalysisApi(text);
        building_text += text + ",";
        processData(data, "text");
        setTextAnalysisComplete(true);

        const moderationData = await contentModerationApi(text);
        const threshold = 0.8;

        const moderationJSON: moderationType = {};

        categoriesToCheck.forEach(async (category) => {
          if (moderationData[category] > threshold) {
            setTextAlert(true);
            setTodosAlert(true);
            const detectionResult = await detectCategoryWords(text, category);
            moderationJSON[category] = detectionResult;
          }
        });
        setTextModeration(moderationJSON)
      } catch (error) {
        console.error("Process request error:", error);
      }
    } else {
      setTextAnalysisComplete(true);
    }
  }

  async function genericTextAnalysis(description: string) {
    try {
      const result = await textAnalysisApi(description);
      return result;
    } catch (error) {
      console.error("Process request error:", error);
    }
  }

  async function todoAnalysis(text: string) {
    const result = await genericTextAnalysis(text);
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
        const data = await audioAnalysisApi(formData);
        const result = await genericTextAnalysis(data.transcript);
        building_text += data.transcript + ",";

        const moderationData = await contentModerationApi(data.transcript);
        const threshold = 0.8;

        type moderationType = {
          [key: string]: string[]; // Cada propiedad será una categoría con una lista de palabras detectadas
        };

        const moderationJSON: moderationType = {};

        categoriesToCheck.forEach(async (category) => {
          if (moderationData[category] > threshold) {
            setAudioAlert(true);
            setTodosAlert(true);
            const detectionResult = await detectCategoryWords(
              data.transcript,
              category
            );
            moderationJSON[category] = detectionResult;
          }
        });
        setAudioModeration(moderationJSON)

        processData(result, "audio");
        setAudioAnalysisComplete(true);
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
        const data = await videoAnalysisApi(formData);
        const result = await genericTextAnalysis(data.description);
        const moderation_result = data.moderation_list;
        if (moderation_result.length >= 1) {
          setImageAlert(true);
          setTodosAlert(true);
          
        }
        const moderation_json = {"imagen":moderation_result}
        setimageModeration(moderation_json);
        building_text += data.description + ",";
        processData(result, "img");
        setImageAnalysisComplete(true);
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

  const handleShowModal = () => {
    const reasons: {
      option: string;
      words: moderationType[];
    }[] = [];
  
    if (audioAlert && audioModeration) {
      reasons.push({
        option: "Audios",
        words: Array.isArray(audioModeration) ? audioModeration : [audioModeration],
      });
    }
  
    if (textAlert && textModeration) {
      reasons.push({
        option: "Conversaciones",
        words: Array.isArray(textModeration) ? textModeration : [textModeration],
      });
    }
  
    if (imageAlert && imageModeration) {
      reasons.push({
        option: "Imagenes",
        words: Array.isArray(imageModeration) ? imageModeration : [imageModeration],
      });
    }
  
    setAlertReasons(reasons);
    setShowModal(true);
  };
  

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <section>
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
          <div className="stats-section">
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
                    {textAlert ? (
                      <img
                        className="alarm-stats-image"
                        src={alarm}
                        alt="Alarm image"
                      />
                    ) : null}
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
                    {audioAlert ? (
                      <img
                        className="alarm-stats-image"
                        src={alarm}
                        alt="Alarm image"
                      />
                    ) : null}
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
                    {imageAlert ? (
                      <img
                        className="alarm-stats-image"
                        src={alarm}
                        alt="Alarm image"
                      />
                    ) : null}
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
                    {todosAlert ? (
                      <img
                        className="alarm-stats-image"
                        src={alarm}
                        alt="Alarm image"
                      />
                    ) : null}
                  </a>
                </li>
              </ul>
              <div className="stats-container">
                {chartResult.categories.length > 0 &&
                chartResult.confidence.length > 0 ? (
                  selectedGraphOption === "Barras" ? (
                    <BarChart className="barchar"
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
                      width={500}
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
                      width={400}
                      height={400}
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
          </div>
          {(audioAlert || textAlert || imageAlert) && (
            <div className="alert-stats-divisor">
              <button className="alert-btn" onClick={handleShowModal}>
                Ver alertas
              </button>
            </div>
          )}

          <AlertModal
            isOpen={showModal}
            handleClose={handleCloseModal}
            alertReasons={alertReasons}
          />
        </>
      )}
    </section>
  );
};
