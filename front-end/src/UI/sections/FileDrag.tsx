import "./FileDrag.css";
import { useCallback, useState } from "react";
import upload from "@assets/upload.webp";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";

export function FileDrag() {
  const [navigated, setNavigated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [chatData, setChatData] = useState<File[] | null>(null);
  const [imgData, setImgData] = useState<File[] | null>(null);
  const [audioData, setAudioData] = useState<File[] | null>(null);
  const navigate = useNavigate();
  
  const navigateToReports = () => {
    if (!navigated) {
      setNavigated(true);
      navigate("/reports", {
        state: {
          chatData: chatData,
          imgData: imgData,
          audioData: audioData,
        },
      });
    }
  };
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    setLoading(true);
    const acceptedImgsFormats = ["png", "jpg", "jpeg", "webp"];
    const chat: File[] = acceptedFiles.filter((text) =>
      text.name.endsWith(".txt")
    );
    const imgs = acceptedFiles.filter((file) => {
      return acceptedImgsFormats.some((format) =>
        file.name.toLowerCase().endsWith(format)
      );
    });
    const audios: File[] = acceptedFiles.filter((audio) =>
      audio.name.endsWith(".opus")
    );
    console.log("Cantidad de chats: ", chat.length)
    console.log("Cantidad de imagenes: ", imgs.length)
    console.log("Cantidad de audios: ", audios.length)

    setChatData(chat);
    setImgData(imgs);
    setAudioData(audios);

    setLoading(false);
    setLoaded(true);
  }, []);

  /*Props of Dropzone dependency*/
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <>
      <section className="dg-container">
        {window.innerWidth >= 600 ? (
          <label className="dg-title">Subir o arrastrar el archivo</label>
        ) : (
          <label className="dg-title">Subir el archivo</label>
        )}
        <div
          className="dg-actor"
          {...getRootProps()}
          onClick={(event) => event.stopPropagation()}
        >
          <input {...getInputProps({ multiple: true })} />
          {isDragActive ? (
            <img className="dg-img" src={upload} alt="upload img" />
          ) : (
            <button type="button" className="dg-button" onClick={open}>
              Subir Archivo
            </button>
          )}
        </div>
        <span className="dg-span-note">
          Formatos aceptados son .txt, .jpg, .png, .jpeg, .opus
        </span>

        {loading ? (
          <p>Cargando archivos...</p>
        ) : (
          loaded && (
            <button className="FileDrag-btn" onClick={navigateToReports}>
              Procesar
            </button>
          )
        )}
      </section>
    </>
  );
}
